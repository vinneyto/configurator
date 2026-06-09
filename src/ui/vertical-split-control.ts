const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

type RatioChangeDetail = {
  ratio: number;
};

export class VerticalSplitControl extends EventTarget {
  readonly element: HTMLDivElement;

  private readonly lineElement: HTMLDivElement;
  private readonly knobElement: HTMLDivElement;
  private ratio = 0.5;
  private isDragging = false;

  constructor() {
    super();

    this.element = document.createElement('div');
    this.element.setAttribute('role', 'slider');
    this.element.setAttribute('aria-label', 'Split position');
    this.element.setAttribute('aria-orientation', 'horizontal');
    this.element.tabIndex = 0;

    Object.assign(this.element.style, {
      position: 'fixed',
      top: '0',
      bottom: '0',
      width: '44px',
      transform: 'translateX(-50%)',
      zIndex: '15',
      cursor: 'ew-resize',
      touchAction: 'none',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } satisfies Partial<CSSStyleDeclaration>);

    this.lineElement = document.createElement('div');

    Object.assign(this.lineElement.style, {
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '50%',
      width: '2px',
      transform: 'translateX(-50%)',
      background: 'rgba(255, 255, 255, 0.58)',
      transition: 'background 120ms ease',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.knobElement = document.createElement('div');

    Object.assign(this.knobElement.style, {
      position: 'relative',
      width: '22px',
      height: '22px',
      borderRadius: '999px',
      border: '1px solid rgba(255, 255, 255, 0.45)',
      background: 'rgba(14, 18, 26, 0.7)',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.element.append(this.lineElement, this.knobElement);

    this.element.addEventListener('pointerdown', this.handlePointerDown);
    this.element.addEventListener('pointerenter', this.handlePointerEnter);
    this.element.addEventListener('pointerleave', this.handlePointerLeave);

    this.setRatio(this.ratio);
    this.setHighlighted(false);
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }

  setRatio(ratio: number): void {
    this.ratio = clamp(ratio, 0, 1);
    this.element.style.left = `${this.ratio * 100}%`;
    this.element.setAttribute('aria-valuemin', '0');
    this.element.setAttribute('aria-valuemax', '100');
    this.element.setAttribute('aria-valuenow', `${Math.round(this.ratio * 100)}`);
  }

  destroy(): void {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointerenter', this.handlePointerEnter);
    this.element.removeEventListener('pointerleave', this.handlePointerLeave);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    this.element.remove();
  }

  private handlePointerDown = (event: PointerEvent): void => {
    event.preventDefault();

    this.isDragging = true;
    this.element.setPointerCapture(event.pointerId);
    this.setHighlighted(true);
    this.updateRatioFromClientX(event.clientX, true);

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.isDragging) {
      return;
    }

    this.updateRatioFromClientX(event.clientX, true);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.element.releasePointerCapture(event.pointerId);
    this.setHighlighted(this.element.matches(':hover'));

    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
  };

  private handlePointerEnter = (): void => {
    this.setHighlighted(true);
  };

  private handlePointerLeave = (): void => {
    if (!this.isDragging) {
      this.setHighlighted(false);
    }
  };

  private updateRatioFromClientX(clientX: number, emitEvent: boolean): void {
    const parent = this.element.parentElement;

    if (!parent) {
      return;
    }

    const rect = parent.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);

    this.setRatio(ratio);

    if (emitEvent) {
      this.dispatchEvent(
        new CustomEvent<RatioChangeDetail>('ratiochange', {
          detail: { ratio },
        })
      );
    }
  }

  private setHighlighted(highlighted: boolean): void {
    this.lineElement.style.background = highlighted
      ? 'rgba(127, 200, 255, 0.92)'
      : 'rgba(255, 255, 255, 0.58)';
  }
}
