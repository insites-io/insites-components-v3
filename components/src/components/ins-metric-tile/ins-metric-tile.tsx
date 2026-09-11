import { h, Component, Element, Prop, Event, EventEmitter, Host } from "@stencil/core";

@Component({
  tag: 'ins-metric-tile',
  styleUrl: './ins-metric-tile.scss'
})
export class InsMetricTile {
  @Element() insMetricTileEl: HTMLElement;
  @Event() didLoad: EventEmitter<void>;
  @Event() insTileClick: EventEmitter<{ metricKey: string }>;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) label: string;
  @Prop({ mutable: true }) value: string;
  @Prop({ mutable: true }) hint: string;
  @Prop({ mutable: true }) icon: string;
  @Prop({ mutable: true }) metricKey: string;
  @Prop({ mutable: true }) clickable: boolean = false;
  @Prop({ mutable: true }) loading: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  // v6 record-page header metric (CRM Contact v1.4 / Company v1.0 .hm-cell).
  // 'strip' renders the design's cell: value over a centred label, min-width 120px,
  // a left divider on every cell after the first, no card chrome. Unset, the tile
  // follows its ins-metric-tile-group; with no group it renders the default boxed tile.
  @Prop({ mutable: true }) variant: 'default' | 'strip';

  // Strip only. Card placement (the standalone metrics card the design swaps in at
  // <=900px): the cell shares the row (flex 1 1 180px) instead of hugging 120px.
  // Inherits from the group when unset.
  @Prop({ mutable: true }) card: boolean = false;

  private groupEl: HTMLElement | null = null;

  componentWillLoad(){
    this.groupEl = this.insMetricTileEl.closest('ins-metric-tile-group');
  }

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insMetricTileEl);
    }
  }

  // Group-level props cascade to the tiles; a tile's own prop wins when set.
  private groupProp(name: string): any {
    return this.groupEl ? (this.groupEl as any)[name] : undefined;
  }

  private get effectiveVariant(): 'default' | 'strip' {
    if (this.variant) return this.variant;
    return this.groupProp('variant') === 'strip' ? 'strip' : 'default';
  }

  private get effectiveCard(): boolean {
    return !!(this.card || this.groupProp('card'));
  }

  private get effectiveClickable(): boolean {
    return !!(this.clickable || this.groupProp('clickable'));
  }

  private handleClick = (): void => {
    if (!this.effectiveClickable || this.loading) return;
    this.insTileClick.emit({ metricKey: this.metricKey || '' });
  }

  private renderBody() {
    return [
      this.icon
        ? <span class="ins-metric-tile__icon" aria-hidden="true"><i class={this.icon}></i></span>
        : null,
      <span class="ins-metric-tile__content">
        <span class="ins-metric-tile__label">{this.label}</span>
        {this.loading
          ? <span class="ins-metric-tile__placeholder" aria-hidden="true"></span>
          : <span class="ins-metric-tile__value">{this.value}</span>
        }
        {this.hint && !this.loading
          ? <span class="ins-metric-tile__hint">{this.hint}</span>
          : null
        }
      </span>
    ];
  }

  // Design .hm-cell: always a <button> (the prototype's informational cells are buttons
  // with cursor:default and a no-op click), value then label, no icon or hint.
  private renderStrip() {
    const clickable = this.effectiveClickable;
    const card = this.effectiveCard;

    return (
      <Host class={{
        'ins-metric-tile--strip': true,
        'ins-metric-tile--card': card,
        'ins-metric-tile--clickable': clickable,
        'ins-metric-tile--loading': this.loading
      }}>
        <button
          type="button"
          class={{ 'hm-cell': true, 'hm-cell-clickable': clickable }}
          onClick={this.handleClick}
          aria-busy={this.loading ? 'true' : null}
        >
          {this.loading
            ? <span class="ins-metric-tile__placeholder" aria-hidden="true"></span>
            : <span class="hm-cell__value">{this.value}</span>
          }
          <span class="hm-cell__label">{this.label}</span>
        </button>
        <slot name="actions" />
      </Host>
    );
  }

  render() {
    if (this.effectiveVariant === 'strip') return this.renderStrip();

    const clickable = this.effectiveClickable;
    const classes = `ins-metric-tile-wrap
      ${clickable ? 'clickable' : ''}
      ${this.loading ? 'loading' : ''}`;

    return (
      <div class={classes}>
        {clickable
          ? <button
              type="button"
              class="ins-metric-tile__body"
              onClick={this.handleClick}
              aria-busy={this.loading ? 'true' : null}
            >
              {this.renderBody()}
            </button>
          : <div class="ins-metric-tile__body" aria-busy={this.loading ? 'true' : null}>
              {this.renderBody()}
            </div>
        }
        <span class="ins-metric-tile__actions">
          <slot name="actions" />
        </span>
      </div>
    );
  }
}
