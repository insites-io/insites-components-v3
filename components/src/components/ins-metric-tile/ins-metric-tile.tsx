import { h, Component, Element, Prop, Event, EventEmitter } from "@stencil/core";

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

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insMetricTileEl);
    }
  }

  private handleClick = (): void => {
    if (!this.clickable || this.loading) return;
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

  render() {
    const classes = `ins-metric-tile-wrap
      ${this.clickable ? 'clickable' : ''}
      ${this.loading ? 'loading' : ''}`;

    return (
      <div class={classes}>
        {this.clickable
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
