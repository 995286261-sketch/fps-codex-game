export class Hud {
  private readonly scoreValue: HTMLSpanElement;
  private readonly hitValue: HTMLSpanElement;
  private readonly ammoValue: HTMLSpanElement;
  private readonly message: HTMLDivElement;
  private messageUntil = 0;

  constructor(root: HTMLElement) {
    root.insertAdjacentHTML(
      'beforeend',
      `
        <div class="hud" aria-live="polite">
          <div class="hud__top">
            <div class="hud__panel">
              <span class="hud__label">SCORE</span>
              <span class="hud__value" data-score>0</span>
            </div>
            <div class="hud__panel">
              <span class="hud__label">AMMO</span>
              <span class="hud__value" data-ammo>READY</span>
            </div>
          </div>
          <div class="crosshair" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="hit-indicator" data-hit></div>
          <div class="prompt">
            Click to lock mouse | WASD move | Space jump | Ctrl crouch | Shift walk | Left click fire
          </div>
        </div>
      `,
    );

    this.scoreValue = root.querySelector('[data-score]') ?? this.missing('score');
    this.hitValue = root.querySelector('[data-hit]') ?? this.missing('hit');
    this.ammoValue = root.querySelector('[data-ammo]') ?? this.missing('ammo');
    this.message = this.hitValue as HTMLDivElement;
  }

  showScore(score: number) {
    this.scoreValue.textContent = String(score);
  }

  showHit(value: number, now: number) {
    this.message.textContent = `TARGET HIT +${value}`;
    this.message.classList.add('is-visible');
    this.messageUntil = now + 700;
  }

  showDamage(now: number) {
    this.message.textContent = 'TARGET HIT';
    this.message.classList.add('is-visible');
    this.messageUntil = now + 420;
  }

  showMiss(now: number) {
    this.message.textContent = 'MISS';
    this.message.classList.add('is-visible');
    this.messageUntil = now + 360;
  }

  update(now: number, cooldown: number) {
    this.ammoValue.textContent = cooldown > 0 ? `${Math.ceil(cooldown)}ms` : 'READY';

    if (this.messageUntil <= now) {
      this.message.classList.remove('is-visible');
    }
  }

  private missing(name: string): never {
    throw new Error(`Missing HUD element: ${name}`);
  }
}
