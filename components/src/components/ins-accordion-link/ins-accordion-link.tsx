import { h, Component, Prop, Element, Event, EventEmitter, Method } from "@stencil/core";

@Component({ tag: 'ins-accordion-link' })
export class InsAccordionLink {
  @Element() insAccLinkEl: HTMLElement;

  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) link: string = "";
  @Prop({ mutable: true }) linkTitle: string = "";
  @Prop({ mutable: true }) linkTarget: string = "_blank";
  @Prop({ mutable: true }) label: string = "";
  @Prop({ mutable: true }) icon: string = "";
  @Prop({ mutable: true }) active: boolean = false;
  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  componentDidLoad(){
    this.checkSiblings();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insAccLinkEl);
    }
  }

  componentDidUpdate(){
    this.checkSiblings();
  }

  checkSiblings(){
    let wrap = this.insAccLinkEl.querySelector('.ins-accordion-link');
    if (this.insAccLinkEl.nextElementSibling){
      let next = this.insAccLinkEl.nextElementSibling;
      if (next.nodeName === "INS-ACCORDION" && next.hasAttribute('menu')){
        wrap.classList.add('before')
      }
    }

    if (this.insAccLinkEl.previousElementSibling){
      let prev = this.insAccLinkEl.previousElementSibling;
      if (prev.nodeName === "INS-ACCORDION" && prev.hasAttribute('menu')){
        wrap.classList.add('after')
      }
    }
  }

  @Method()
  async toggle(){
    this.active = !this.active;
  }

  render() {
    return (
      <div class={`ins-accordion-link
        ${this.active ? 'active': ''}
        ${this.disabled ? 'disabled': ''}`}>

        <a class="ins-accordion-link_link" href={this.link}
          target={this.linkTarget} title={this.linkTitle}>

          {this.icon
            ? <span class={`ins-accordion-link_icon ${this.icon}`}></span>
            : "" }

          <span>{this.label}</span>
        </a>
      </div>
    );
  }
}
