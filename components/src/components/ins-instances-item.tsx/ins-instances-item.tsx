import { h, Component, Event, EventEmitter, Prop, State, Element } from "@stencil/core";

@Component({ tag: 'ins-instances-item' })
export class InsInstancesItem {
  @Element() el: HTMLElement;
  @Event() routeInstance: EventEmitter<{ instance: string; logoLink: string; withSubItem: boolean }>;
  @Event() activeSubItem: EventEmitter<void>;
  @Prop({ mutable: true }) logoLink: string = "";
  @Prop({ mutable: true }) instance: string = "";
  @Prop({ mutable: true }) instanceLink: string = "";
  @Prop({ mutable: true }) withSubItem: boolean = false;

  @State() subItemState: boolean;

  routeInstanceHandler(){
    this.routeInstance.emit({
      instance: this.instance,
      logoLink: this.logoLink,
      withSubItem: this.withSubItem
    });

    this.subItemState = true;
  }

  emitActiveSubItem() {
    this.activeSubItem.emit();
    this.subItemState = false;
  }

  render(){
    return (
      <div class={`ins-instances-item-wrap ${this.subItemState ? 'sub-item-active' : ''}`}>
        <a href={this.instanceLink} onClick={() => this.routeInstanceHandler()} class="ins-instances-item">
          <div class="logo-wrap">
            <img src={this.logoLink ? this.logoLink : ''} />
          </div>
          <span class="instance-label">{this.instance ? this.instance : 'Label'}</span>
          <i class="icon-chevron-right"></i>
        </a>
        {this.withSubItem ? (
          <div class="instance-sub-item__container">
            <a onClick={() => this.emitActiveSubItem()}>
              <i class="fas icon-chevron-left"></i>
              <span>{this.instance}</span>
            </a>
            <slot />
          </div>
        ) : (
          ""
        )}
      </div>
    )
  }
}
