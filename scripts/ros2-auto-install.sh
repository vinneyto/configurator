#!/usr/bin/env bash
set -Eeuo pipefail

# ROS 2 auto-installer for Ubuntu.
# - Detects Ubuntu version
# - Installs the newest official ROS 2 distro for that Ubuntu release
# - Tries to clean up common leftovers from previous failed install attempts
# - Adds a managed apt source + keyring
# - Installs ros-base or desktop variant
# - Adds sourcing to ~/.bashrc
#
# Supported Ubuntu releases:
#   24.04 -> ROS 2 Jazzy
#   22.04 -> ROS 2 Humble
#
# Usage:
#   bash ros2-auto-install.sh
#   bash ros2-auto-install.sh --desktop
#   bash ros2-auto-install.sh --ros-base
#   bash ros2-auto-install.sh --skip-bashrc
#   bash ros2-auto-install.sh --dry-run

PACKAGE_VARIANT="desktop"
SKIP_BASHRC=0
DRY_RUN=0

log()  { printf '\n[%s] %s\n' "INFO" "$*"; }
warn() { printf '\n[%s] %s\n' "WARN" "$*" >&2; }
die()  { printf '\n[%s] %s\n' "ERROR" "$*" >&2; exit 1; }

run() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf '[DRY-RUN] %s\n' "$*"
  else
    eval "$@"
  fi
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

usage() {
  cat <<'EOF'
ROS 2 Ubuntu auto-installer

Options:
  --desktop       Install ros-<distro>-desktop (default)
  --ros-base      Install ros-<distro>-ros-base
  --skip-bashrc   Do not modify ~/.bashrc
  --dry-run       Print actions without executing them
  -h, --help      Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --desktop)
      PACKAGE_VARIANT="desktop"
      ;;
    --ros-base)
      PACKAGE_VARIANT="ros-base"
      ;;
    --skip-bashrc)
      SKIP_BASHRC=1
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
  shift
done

need_cmd sudo
need_cmd curl
need_cmd gpg
need_cmd tee
need_cmd grep
need_cmd awk
need_cmd sed

[[ -r /etc/os-release ]] || die "/etc/os-release not found"
# shellcheck disable=SC1091
source /etc/os-release

[[ "${ID:-}" == "ubuntu" ]] || die "This script supports Ubuntu only. Detected ID='${ID:-unknown}'"

UBUNTU_CODENAME="${VERSION_CODENAME:-}"
UBUNTU_VERSION="${VERSION_ID:-}"
ARCH="$(dpkg --print-architecture)"

case "$UBUNTU_CODENAME" in
  noble)
    ROS_DISTRO="jazzy"
    ;;
  jammy)
    ROS_DISTRO="humble"
    ;;
  focal)
    die "Ubuntu 20.04 (focal) is too old for the current supported ROS 2 apt path in this script. Recommended: upgrade to Ubuntu 22.04+ or use Docker."
    ;;
  *)
    die "Unsupported Ubuntu release: codename='${UBUNTU_CODENAME:-unknown}', version='${UBUNTU_VERSION:-unknown}'. This script currently supports Ubuntu 22.04 and 24.04."
    ;;
esac

ROS_PACKAGE="ros-${ROS_DISTRO}-${PACKAGE_VARIANT}"
KEYRING_PATH="/usr/share/keyrings/ros-archive-keyring.gpg"
SOURCES_LIST_PATH="/etc/apt/sources.list.d/ros2.list"
ROS_REPO_LINE="deb [arch=${ARCH} signed-by=${KEYRING_PATH}] http://packages.ros.org/ros2/ubuntu ${UBUNTU_CODENAME} main"
BASHRC_PATH="${HOME}/.bashrc"
ROS_SETUP_LINE="source /opt/ros/${ROS_DISTRO}/setup.bash"

log "Detected Ubuntu ${UBUNTU_VERSION} (${UBUNTU_CODENAME}), architecture=${ARCH}"
log "Will install the newest official ROS 2 distro for this Ubuntu: ${ROS_DISTRO}"
log "Selected package: ${ROS_PACKAGE}"

if dpkg -s "$ROS_PACKAGE" >/dev/null 2>&1; then
  log "${ROS_PACKAGE} is already installed. I will still verify repo/key/shell setup."
fi

cleanup_previous_attempts() {
  log "Cleaning up common leftovers from previous ROS install attempts"

  local file
  shopt -s nullglob
  for file in /etc/apt/sources.list.d/*.list; do
    [[ "$file" == "$SOURCES_LIST_PATH" ]] && continue
    if grep -Eq 'packages\.ros\.org/ros2/ubuntu|ros2/ubuntu' "$file"; then
      warn "Found extra ROS 2 apt source: $file"
      run "sudo cp '$file' '${file}.bak.$(date +%Y%m%d%H%M%S)'"
      run "sudo rm -f '$file'"
      warn "Removed duplicate ROS 2 apt source (backup created)"
    fi
  done
  shopt -u nullglob

  if [[ -f "$SOURCES_LIST_PATH" ]]; then
    local current
    current="$(cat "$SOURCES_LIST_PATH" || true)"
    if [[ "$current" != "$ROS_REPO_LINE" ]]; then
      warn "Managed ROS source exists but differs from expected content; it will be replaced"
    fi
  fi

  if grep -Fq '/opt/ros/' "$BASHRC_PATH" 2>/dev/null; then
    warn "Found ROS sourcing lines in ${BASHRC_PATH}; stale lines for other distros will be removed"
    if [[ "$DRY_RUN" -eq 1 ]]; then
      printf '[DRY-RUN] rewrite %s to keep only source /opt/ros/%s/setup.bash later\n' "$BASHRC_PATH" "$ROS_DISTRO"
    else
      cp "$BASHRC_PATH" "${BASHRC_PATH}.bak.$(date +%Y%m%d%H%M%S)"
      python3 - "$BASHRC_PATH" "$ROS_DISTRO" <<'PY'
import sys
path, keep = sys.argv[1], sys.argv[2]
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
out = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith('source /opt/ros/') and stripped.endswith('/setup.bash'):
        if stripped == f'source /opt/ros/{keep}/setup.bash':
            out.append(line)
        continue
    out.append(line)
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(out)
PY
    fi
  fi

  if dpkg -l | awk '{print $2}' | grep -Eq '^ros-[a-z0-9-]+-(desktop|ros-base)$'; then
    warn "Detected some ROS metapackages already present. That is not fatal; apt will reconcile packages."
    dpkg -l | awk '{print $2}' | grep -E '^ros-[a-z0-9-]+-(desktop|ros-base)$' || true
  fi
}

install_prereqs() {
  log "Installing prerequisite packages"
  run "sudo apt-get update"
  run "sudo apt-get install -y --no-install-recommends locales curl gnupg2 lsb-release ca-certificates software-properties-common"

  if ! locale -a 2>/dev/null | grep -qi '^en_US\.utf8$'; then
    log "Generating locale en_US.UTF-8"
    run "sudo locale-gen en_US en_US.UTF-8"
    run "sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8"
  fi

  log "Ensuring Ubuntu Universe repository is enabled"
  run "sudo add-apt-repository -y universe"
}

setup_ros_repo() {
  log "Installing ROS repository keyring"
  run "sudo mkdir -p /usr/share/keyrings"
  run "curl -fsSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key | sudo gpg --dearmor -o '${KEYRING_PATH}.tmp'"
  run "sudo mv '${KEYRING_PATH}.tmp' '${KEYRING_PATH}'"
  run "echo '$ROS_REPO_LINE' | sudo tee '$SOURCES_LIST_PATH' >/dev/null"
}

install_ros() {
  log "Updating apt indexes after adding ROS repository"
  run "sudo apt-get update"

  log "Installing ${ROS_PACKAGE}"
  run "sudo apt-get install -y '${ROS_PACKAGE}' python3-colcon-common-extensions python3-rosdep python3-vcstool"

  log "Initializing rosdep if needed"
  if [[ ! -f /etc/ros/rosdep/sources.list.d/20-default.list ]]; then
    run "sudo rosdep init"
  else
    log "rosdep already initialized"
  fi

  run "rosdep update"
}

update_bashrc() {
  [[ "$SKIP_BASHRC" -eq 1 ]] && { log "Skipping ~/.bashrc modification"; return; }

  log "Ensuring ${ROS_SETUP_LINE} is present in ${BASHRC_PATH}"
  if grep -Fqx "$ROS_SETUP_LINE" "$BASHRC_PATH" 2>/dev/null; then
    log "~/.bashrc already contains the correct ROS setup line"
  else
    if [[ "$DRY_RUN" -eq 1 ]]; then
      printf '[DRY-RUN] append to %s: %s\n' "$BASHRC_PATH" "$ROS_SETUP_LINE"
    else
      {
        printf '\n# ROS 2\n%s\n' "$ROS_SETUP_LINE"
      } >> "$BASHRC_PATH"
    fi
  fi
}

print_summary() {
  cat <<EOF

Done.

Installed ROS 2 distro: ${ROS_DISTRO}
Installed package:      ${ROS_PACKAGE}
Ubuntu release:         ${UBUNTU_VERSION} (${UBUNTU_CODENAME})
Apt source:             ${SOURCES_LIST_PATH}
Keyring:                ${KEYRING_PATH}

Next steps:
  1. Open a new shell, or run:
       source /opt/ros/${ROS_DISTRO}/setup.bash
  2. Verify installation:
       ros2 --version
       ros2 doctor --report || true
  3. Optional quick check:
       ros2 run demo_nodes_cpp talker

If apt update/install fails, send me the full terminal output and I will adapt the script to your machine state.
EOF
}

cleanup_previous_attempts
install_prereqs
setup_ros_repo
install_ros
update_bashrc
print_summary
