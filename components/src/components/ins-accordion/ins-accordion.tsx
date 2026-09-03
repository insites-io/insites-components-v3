import { h, Component, Element, Prop, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-accordion' })
export class InsAccordion {
  @Element() insAccordionEl: HTMLElement;
  @Event() insToggle: EventEmitter;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) menu: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insAccordionEl);
    }
  }

  render() {
    return (
      <div class={`ins-accordion ${this.menu ? 'menu':''}`}>
        <slot />
      </div>
    );
  }
}
