import { h, Component, Element, Prop, Event, EventEmitter, Method } from "@stencil/core";

@Component({
  tag: 'ins-disclosure-panel',
  styleUrl: './ins-disclosure-panel.scss'
})
export class InsDisclosurePanel {
  @Element() insDisclosurePanelEl: HTMLElement;

  @Event() insToggle: EventEmitter<{ open: boolean; heading: string }>;
  @Event() didLoad: EventEmitter<void>;

  @Prop() hasLoad: string;
  @Prop({ mutable: true }) heading: string;
  @Prop({ mutable: true }) count: number;
  @Prop({ mutable: true }) icon: string;
  @Prop({ mutable: true }) open: boolean = false;
  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  private uniqueId: string = (Math.random() + 1).toString(36).substring(7);

  componentDidLoad() {
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]) {
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insDisclosurePanelEl);
    }
  }

  /** Programmatic toggle — does NOT emit insToggle. */
  @Method()
  async toggle(): Promise<void> {
    this.open = !this.open;
  }

  /** Programmatic open — does NOT emit insToggle. */
  @Method()
  async openPanel(): Promise<void> {
    this.open = true;
  }

  /** Programmatic close — does NOT emit insToggle. */
  @Method()
  async closePanel(): Promise<void> {
    this.open = false;
  }

  private onHeaderClick(): void {
    if (this.disabled) return;
    this.open = !this.open;
    this.insToggle.emit({ open: this.open, heading: this.heading });
  }

  private renderCount() {
    if (this.count === undefined || this.count === null) return null;
    return <span class="ins-disclosure-panel_count">{this.count}</span>;
  }

  render() {
    const headerId = `ins-disclosure-panel_header-${this.uniqueId}`;
    const bodyId = `ins-disclosure-panel_body-${this.uniqueId}`;

    return (
      <div class={`ins-disclosure-panel
        ${this.open ? 'open' : 'closed'}
        ${this.disabled ? 'disabled' : ''}`}>

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
          aria-labelledby={headerId}>

          <slot />
        </div>
      </div>
    );
  }
}
