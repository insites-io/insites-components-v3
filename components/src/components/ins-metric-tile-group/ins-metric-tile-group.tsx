import { h, Component, Element, Prop, Event, EventEmitter } from "@stencil/core";

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

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insMetricTileGroupEl);
    }
  }

  render() {
    const columns = typeof this.columns === 'string' ? parseInt(this.columns, 10) : this.columns;
    const style = { '--ins-metric-tile-columns': `${columns > 0 ? columns : 3}` };

    return (
      <div class="ins-metric-tile-group-wrap" style={style}>
        <slot />
      </div>
    );
  }
}
