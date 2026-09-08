import { h, Component, Element, Prop, Event, EventEmitter, Method, State, Watch, Host } from "@stencil/core";

/*
 * ins-disclosure-panel
 *
 * Default rendering is the v2 panel (angle-down chevron, 16px header, stacked panels divided by a
 * border-top). Nothing about it changed.
 *
 * `v6` opts a panel into the IIA v6 reference section card from the CRM Contact v1.4 / Company v1.0
 * prototypes (the refSections loop): card > header <button aria-expanded> (icon, semibold label,
 * .chip count, icon-chevron-right that rotates 90deg when open) > .crm-refwrap body. Inline styles
 * are the prototype's own, ported from the live module-v6-crm ReferenceSection.vue so the shared
 * stylesheet cannot move them. Card, chip, refwrap and the ins-fade-in-up keyframe come from the
 * "IIA v6 record-page layer" in insites.css.
 */
@Component({
  tag: 'ins-disclosure-panel',
  styleUrl: './ins-disclosure-panel.scss'
})
export class InsDisclosurePanel {
  @Element() insDisclosurePanelEl: HTMLElement;

  @Event() insToggle: EventEmitter<{ open: boolean; heading: string }>;
  /** Fired once, the first time the body is considered mounted (first open, or on load when `open` or `eager`). */
  @Event() insMount: EventEmitter<{ heading: string }>;
  @Event() didLoad: EventEmitter<void>;

  @Prop() hasLoad: string;
  @Prop({ mutable: true }) heading: string;
  /** Number, or a string such as "5 profiles". Hidden when null, undefined or an empty string. */
  @Prop({ mutable: true }) count: number | string;
  @Prop({ mutable: true }) icon: string;
  @Prop({ mutable: true }) open: boolean = false;
  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  /** Opt in to the IIA v6 reference section card. Off by default so existing panels do not move. */
  @Prop({ mutable: true, attribute: 'v6' }) v6: boolean = false;
  /** Treat the body as mounted from the start, for panels whose content is read while closed. */
  @Prop({ mutable: true }) eager: boolean = false;

  /** True once the body has been opened (or eagerly mounted). Never reverts on close. */
  @State() mounted: boolean = false;

  private uniqueId: string = (Math.random() + 1).toString(36).substring(7);

  componentWillLoad() {
    this.mounted = this.open || this.eager;
  }

  componentDidLoad() {
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.mounted) this.insMount.emit({ heading: this.heading });
    if (this.hasLoad && window["Insites"]) {
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insDisclosurePanelEl);
    }
  }

  @Watch('open')
  onOpenChange(isOpen: boolean) {
    if (isOpen) this.markMounted();
  }

  @Watch('eager')
  onEagerChange(isEager: boolean) {
    if (isEager) this.markMounted();
  }

  /** Programmatic toggle. Does NOT emit insToggle. */
  @Method()
  async toggle(): Promise<void> {
    this.open = !this.open;
  }

  /** Programmatic open. Does NOT emit insToggle. Mounts the body if it was not yet mounted. */
  @Method()
  async openPanel(): Promise<void> {
    this.markMounted();
    this.open = true;
  }

  /** Programmatic close. Does NOT emit insToggle. The body stays mounted. */
  @Method()
  async closePanel(): Promise<void> {
    this.open = false;
  }

  /** Current open state. The `open` prop is the synchronous equivalent. */
  @Method()
  async isOpen(): Promise<boolean> {
    return this.open;
  }

  /** Whether the body has been opened at least once (or was eager). */
  @Method()
  async isMounted(): Promise<boolean> {
    return this.mounted;
  }

  private markMounted(): void {
    if (this.mounted) return;
    this.mounted = true;
    this.insMount.emit({ heading: this.heading });
  }

  private onHeaderClick(): void {
    if (this.disabled) return;
    if (!this.open) this.markMounted();
    this.open = !this.open;
    this.insToggle.emit({ open: this.open, heading: this.heading });
  }

  private hasCount(): boolean {
    return typeof this.count === 'number'
      || (typeof this.count === 'string' && this.count !== '');
  }

  private renderCount() {
    if (!this.hasCount()) return null;
    return <span class="ins-disclosure-panel_count">{this.count}</span>;
  }

  private wrapClass(): string {
    return `ins-disclosure-panel
        ${this.v6 ? 'v6' : ''}
        ${this.open ? 'open' : 'closed'}
        ${this.mounted ? 'mounted' : ''}
        ${this.disabled ? 'disabled' : ''}`;
  }

  /* Prototype markup, styles inline as in design-v14.html and ReferenceSection.vue. */
  private renderV6(headerId: string, bodyId: string) {
    return (
      <div
        class={this.wrapClass()}
        style={{
          background: 'var(--ins-card)',
          border: '1px solid var(--ins-border-color)',
          borderRadius: 'var(--ins-radius)'
        }}>

        <button
          type="button"
          id={headerId}
          class="ins-disclosure-panel_header"
          disabled={this.disabled}
          aria-expanded={this.open ? 'true' : 'false'}
          aria-controls={bodyId}
          onClick={() => this.onHeaderClick()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ins-space-xs)',
            width: '100%',
            boxSizing: 'border-box',
            border: 'none',
            background: 'transparent',
            padding: 'var(--ins-space-sm) var(--ins-space-sm)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: 'var(--ins-radius)'
          }}>

          {this.icon
            ? <i class={this.icon} aria-hidden="true"
                style={{ fontSize: 'var(--ins-text-md)', color: 'var(--ins-text-3)', flex: 'none' }}></i>
            : null}
          <span
            class="ins-disclosure-panel_label"
            style={{
              fontSize: 'var(--ins-text-sm)',
              fontWeight: 'var(--ins-weight-semibold)',
              color: 'var(--ins-text-1)'
            }}>{this.heading}</span>
          {this.hasCount() ? <span class="chip">{this.count}</span> : null}
          <i
            class="icon-chevron-right"
            aria-hidden="true"
            style={{
              marginLeft: 'auto',
              fontSize: 'var(--iia-glyph-xs)',
              color: 'var(--ins-ui-2)',
              transform: this.open ? 'rotate(90deg)' : 'none',
              transition: 'transform var(--ins-duration-fast) var(--ins-ease-out)'
            }}></i>
        </button>

        <div
          id={bodyId}
          class="ins-disclosure-panel_body crm-refwrap"
          role="region"
          aria-labelledby={headerId}
          data-mounted={this.mounted ? 'true' : 'false'}
          style={{
            '--crm-tblpad': 'var(--ins-space-sm)',
            '--crm-grid-pad': 'var(--ins-space-xs) 0 var(--ins-space-sm)',
            '--crm-grid-gap': 'var(--ins-space-sm)',
            borderTop: '1px solid var(--ins-border-color)',
            padding: '0 var(--ins-space-sm)',
            animation: this.open ? 'ins-fade-in-up var(--ins-duration-fast) var(--ins-ease-out)' : 'none'
          }}>

          <slot />
        </div>
      </div>
    );
  }

  render() {
    const headerId = `ins-disclosure-panel_header-${this.uniqueId}`;
    const bodyId = `ins-disclosure-panel_body-${this.uniqueId}`;

    // Host adds no element; it only carries the v6 marker class so the stylesheet can drop the
    // host background and the v2 divider. It is always rendered so the class clears if v6 toggles off.
    if (this.v6) {
      return (
        <Host class={{ 'ins-disclosure-panel--v6': true }}>
          {this.renderV6(headerId, bodyId)}
        </Host>
      );
    }

    return (
      <Host class={{ 'ins-disclosure-panel--v6': false }}>
      <div class={this.wrapClass()}>

        <button
          type="button"
          id={headerId}
          class="ins-disclosure-panel_header"
          disabled={this.disabled}
          aria-expanded={this.open ? 'true' : 'false'}
          aria-controls={bodyId}
          onClick={() => this.onHeaderClick()}>

          <span class="ins-disclosure-panel_chevron icon-angle-down" aria-hidden="true"></span>
          {this.icon ? <span class={`ins-disclosure-panel_icon ${this.icon}`} aria-hidden="true"></span> : null}
          <span class="ins-disclosure-panel_heading">{this.heading}</span>
          {this.renderCount()}
        </button>

        <div
          id={bodyId}
          class="ins-disclosure-panel_body"
          role="region"
          aria-labelledby={headerId}
          data-mounted={this.mounted ? 'true' : 'false'}>

          <slot />
        </div>
      </div>
      </Host>
    );
  }
}
