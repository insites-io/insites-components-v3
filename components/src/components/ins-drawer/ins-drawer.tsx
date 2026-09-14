import { h, Component, Prop, Element, Method, Watch, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-drawer' })
export class InsDrawer {
  @Element() insDrawer: HTMLElement;
  @Event() insToggle: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) isOpen: boolean = false;
  @Prop({ mutable: true }) position: string = ""; //[left, right]
  @Prop({ mutable: true }) showHeader: boolean = true;
  @Prop({ mutable: true }) stickyHeader: boolean = true;
  @Prop({ mutable: true }) bordered: boolean = true;
  @Prop({ mutable: true }) noPadding: boolean = false;
  @Prop({ mutable: true }) label: string;
  @Prop({ mutable: true }) icon: string;
  @Prop({ mutable: true }) showCloseButton: boolean = true;
  @Prop({ mutable: true }) backdropCanClose: boolean = true;
  @Prop({ mutable: true }) customWidth: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @Watch('isOpen')
  watchStatusHandler(){
    if (this.customWidth) {
      this.isOpen ? this.setStyleWidth() : this.hideDrawerInlineCSS();
    }
    if (this.stickyHeader) {
      // Do not remove
      this.rebindHeaderCSS();
    }
    this.setBodyCSS();
    this.toggleDrawerEmitter();
  }

  @Watch('customWidth')
  watchCustomWidthHandler() {
    if(this.customWidth)
       this.insDrawer.querySelector('.ins-content')['style'].width = this.customWidth;
  }

  @Watch('backdropCanClose')
  backDropClickHandler() {
    let backdropEl = this.insDrawer.querySelector('.ins-backdrop-wrap');
    if (this.backdropCanClose) {
      backdropEl.addEventListener('click', () => {
        this.setDrawerState(false);
      });
    } else {
      backdropEl.removeEventListener('click', () => { });
    }
  }

  rebindHeaderCSS() {
      let element = this.insDrawer.querySelector('.ins-drawer-header');
      if(element)
        element['style'].width = "inherit";
  }

  setBodyCSS() {
    if (this.isOpen) {
      document.querySelector('body').style.overflow = "hidden";
      parent.document.querySelector('body').style.overflow = "hidden";
    } else {
      document.querySelector('body').style.overflow = "initial";
      parent.document.querySelector('body').style.overflow = "initial";
    }
  }

  setStyleWidth() {
    let insDrawerEl = this.insDrawer.querySelector('.ins-content');
    if (this.customWidth && insDrawerEl && this.isOpen) {
      insDrawerEl['style'].width = this.customWidth;
      if(this.position === 'left') {
        insDrawerEl['style'].right = 'initial';
        insDrawerEl['style'].left = !this.isOpen ? '-' + this.customWidth : 0;
      } else {
        insDrawerEl['style'].left = 'initial';
        insDrawerEl['style'].right = !this.isOpen ? '-' + this.customWidth : 0;
      }
    }
  }

  hideDrawerInlineCSS() {
    let insDrawerEl = this.insDrawer.querySelector('.ins-content');
    if (this.position === 'left') {
      insDrawerEl['style'].right = 'initial';
      insDrawerEl['style'].left = '-' + this.customWidth;
    } else {
      insDrawerEl['style'].left = 'initial';
      insDrawerEl['style'].right = '-' + this.customWidth;
    }
  }

  componentDidLoad() {
    this.backdropCanClose ? this.backDropClickHandler() : '';
    this.customWidth ? this.setStyleWidth() : '';
    this.setBodyCSS();
    this.rebindHeaderCSS();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insDrawer);
    }
  }
  componentDidUpdate() {
    this.backdropCanClose ? this.backDropClickHandler() : '';
  }

  toggleDrawerEmitter() {
    this.insToggle.emit({
      status: this.isOpen ? "open" : "close",
      label: this.label
    })
  }

  @Method()
  async setDrawerState(status: boolean) {
    this.isOpen = status;
  }

  render() {
    return(
      <div class={`ins-drawer-wrap ${this.isOpen ? 'opened' : ''}`}>
        <ins-backdrop onClick={()=>this.backDropClickHandler()}></ins-backdrop>
        <div class={`ins-content ${this.position ? this.position : ''} ${this.customWidth ? 'custom-width' : ''}`}>
        {this.showHeader ?
            <div class={`ins-drawer-header ${this.bordered ? 'bordered' : ''} ${this.stickyHeader ? 'sticky': ''}`}>
            {this.label || this.icon ?
            <h4>
              {this.icon ? <span class={this.icon}></span> : ''}
              {this.label}
            </h4> : ''}
            {this.showCloseButton ?
              <button class="ins-drawer-close-btn" onClick={()=>this.setDrawerState(false)}>
              <i class="icon-close-1"></i>
            </button>: ''}
          </div> : ''}

          <div class={`ins-drawer-body ${this.noPadding ? 'no-padding':''}`}>
            <slot />
          </div>
        </div>
      </div>
    )
  }
}
