import { h,Component, Prop, Event, EventEmitter } from "@stencil/core";

@Component({ tag: "ins-instances-sub-item" })
export class InsInstancesSubItem {
  @Event() routeInstanceSubItem: EventEmitter<{ instance: string; link: string }>;
  @Prop({ mutable: true }) instance: string = "";
  @Prop({ mutable: true }) link: string = "";

  routeInstanceSubItemHandler(){
    this.routeInstanceSubItem.emit({
      instance: this.instance,
      link: this.link
    });
  }

  render() {
    return (
      <div class="ins-instance-sub-item">
        <a href={this.link} onClick={() => this.routeInstanceSubItemHandler()}>
          <span class="instance-sub-item-label">{this.instance ? this.instance : 'Label' }</span>
        </a>
      </div>
    );
  }
}
