import { h, Component, Prop, Method, Event, EventEmitter, Element } from "@stencil/core";

@Component({ tag: 'ins-sidebar-footer-button' })
export class InsSidebarFooterButton {
  @Element() insSidebarFooterButtonEl: HTMLElement;
  @Event() insSidebarFooterButtonEvent: EventEmitter<MouseEvent>;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) icon: string = '';
  @Prop({ mutable: true }) open: string = '';
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insSidebarFooterButtonEl);
    }
  }

  @Method()
  async insSidebarFooterButtonOnClick(event: MouseEvent){
    this.insSidebarFooterButtonEvent.emit(event);
  }

  render() {
    if (this.icon) {
      return (
        <div class="ins-sidebar-footer-item-wrap">
          <button class="ins-sfiw-button"
            onClick={event => this.insSidebarFooterButtonOnClick(event)}>

            { this.icon ?
            <i class={`ins-sfiw-button-icon ${this.icon}`}></i> : ''}
          </button>
        </div>
      )
    }
  }
}
