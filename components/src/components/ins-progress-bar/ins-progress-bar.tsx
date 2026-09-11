import { h, Component, Prop, Element, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-progress-bar' })
export class InsProgressBar {
  @Element() el: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable: true}) text: string = "";
  @Prop({mutable: true}) progress: number = 0;
  @Prop({mutable: true}) total: number = 1;
  @Prop({mutable: true}) hidden: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  progressEl: HTMLElement;

  componentDidLoad(){
    this.progressEl = this.el.querySelector('.progress') as HTMLElement
    this.calculateProgress();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.el);
    }
  }

  componentDidUpdate(){
    this.calculateProgress()
  }

  calculateProgress(){
    let totalWidth = (this.progress / this.total) * 100;
    this.progressEl.style.width = `${totalWidth}%`;
  }

  render() {
    return (
      <div class={`ins-progress-bar ${this.hidden ? "hidden":""}`}>

        <div class="text">{this.text}</div>
        <div class="progress"></div>

      </div>
    );
  }
}
