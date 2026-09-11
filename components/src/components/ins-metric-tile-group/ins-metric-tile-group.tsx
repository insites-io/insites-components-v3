import { h, Component, Element, Prop, Event, EventEmitter, Host, Watch, forceUpdate } from "@stencil/core";

@Component({
  tag: 'ins-metric-tile-group',
  styleUrl: './ins-metric-tile-group.scss'
})
export class InsMetricTileGroup {
  @Element() insMetricTileGroupEl: HTMLElement;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) columns: number = 3;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  // v6 record-page header metric strip (CRM Contact v1.4 / Company v1.0 .hm-strip).
  // 'strip' turns the grid into the design's flex row and switches every child tile
  // to its strip cell. The host carries the .hm-strip class so the shared record-page
  // CSS reaches it; the consumer adds the placement class beside it
  // (class="crm-hm-inline" in the identity header, or wrap the group in the
  // section.crm-hm-card the design swaps in at <=900px). 'default' is today's grid.
  @Prop({ mutable: true }) variant: 'default' | 'strip' = 'default';

  // Strip only. Card placement: tiles share the row (flex 1 1 180px) and wrap.
  @Prop({ mutable: true }) card: boolean = false;

  // Opts every child tile into the button affordance (pointer cursor, hover tint,
  // insTileClick). Off by default so the tiles match the design's informational cells.
  // A tile's own clickable="true" still opts that one tile in.
  @Prop({ mutable: true }) clickable: boolean = false;

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insMetricTileGroupEl);
    }
  }

  // The tiles read variant / card / clickable off this element when they render,
  // so a change here has to re-render them.
  @Watch('variant')
  @Watch('card')
  @Watch('clickable')
  syncTiles(){
    const tiles = this.insMetricTileGroupEl.querySelectorAll('ins-metric-tile');
    for (let i = 0; i < tiles.length; i++) forceUpdate(tiles[i]);
  }

  render() {
    const strip = this.variant === 'strip';
    const columns = typeof this.columns === 'string' ? parseInt(this.columns, 10) : this.columns;
    const style = strip ? undefined : { '--ins-metric-tile-columns': `${columns > 0 ? columns : 3}` };

    return (
      <Host class={{ 'hm-strip': strip, 'ins-metric-tile-group--card': strip && this.card }}>
        <div class="ins-metric-tile-group-wrap" style={style}>
          <slot />
        </div>
      </Host>
    );
  }
}
