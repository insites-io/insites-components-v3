import { h, Component, Element, Method, Event, EventEmitter, Prop } from "@stencil/core";

@Component({ tag: 'ins-sidebar-footer' })
export class InsSidebarFooter {
  @Element() InsSidebarFooter: HTMLElement;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  componentDidLoad(){
    let items = this.InsSidebarFooter
      .querySelectorAll('.slot-wrapper .ins-sidebar-footer-item-wrap') as NodeListOf<HTMLElement>;

    for (let i = 0; i < items.length; i++) {
      items[i].style.width = `${100 / items.length}%`;
    }

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.InsSidebarFooter);
    }
  }

  @Method()
  async toggleSidebar() {
      let menuBar = document.querySelector("ins-header") as any;
      if (menuBar)
          menuBar.toggleSidebar();
  }

  render() {
    return (
      <div class="ins-sidebar-footer-wrap">
        <ins-sidebar-footer-button
          class="ins-sidebar-footer-menu-toggle"
          icon="icon-more-vertical"
          onClick={() => this.toggleSidebar()}>
        </ins-sidebar-footer-button>
        <div class="slot-wrapper">
          <slot />
        </div>
      </div>
    )
  }
}
