import { h, Component, Prop, Element, Event, EventEmitter, Method } from "@stencil/core";

@Component({ tag: 'ins-checkbox-card' })
export class InsCheckboxCard {
  @Element() insCheckboxCardEl: HTMLElement;
  @Event() insClick: EventEmitter;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable:true}) noPadding: boolean;
  @Prop({mutable:true}) tabOrder: string = '0';
  @Prop({mutable:true}) selected: boolean;
  @Prop({mutable:true}) disabled: boolean;
  @Prop({mutable:true}) selectedColor: string = "#1e86e3";
  @Prop({mutable:true}) value: string;
  @Prop({mutable:true}) label: string;
  @Prop({mutable:true}) name: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  addColorStyles(){
    let insCardWrap = this.insCheckboxCardEl.querySelector('.ins-checkbox-card-wrap');
    if (this.selected && this.selectedColor[0] === '#'){

      if (insCardWrap){
        insCardWrap.setAttribute('style', `border-color:${this.selectedColor}`);

        let selectedWrap = insCardWrap.querySelector('.selected-wrap');
        selectedWrap.setAttribute('style', `background-color:${this.selectedColor}`);
      }
    } else {
      insCardWrap.removeAttribute('style');
    }
  }

  insClickHandler(){
    this.insClick.emit({
      label: this.label,
      value: this.value
    });
    this.insValueChange.emit(this.value);
  }

  keyPressHandler(e: KeyboardEvent){
    if (e.keyCode === 13){
      this.insClickHandler()
    }
  }

  componentDidLoad(){
    this.addColorStyles();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insCheckboxCardEl);
    }
  }

  componentDidUpdate(){
    this.addColorStyles()
  }

  @Method()
  async setValue(value: string){
    this.value = value;
    this.insValueChange.emit(this.value);
  }

  @Method()
  async getValue(){
    return this.value
  }

  render() {
    return (
      <div class={`ins-checkbox-card-wrap
        ${this.noPadding ? 'no-padding' : ''}
        ${this.disabled ? 'disabled' : ''}
        ${this.selected ? 'selected':''}
        ${this.selectedColor ? this.selectedColor : ''}`}
        tabindex={this.tabOrder}
        onClick={() => this.insClickHandler()}
        onKeyPress={e => this.keyPressHandler(e)}>
        {this.selected ? <div class="icon-check-2 selected-wrap"></div>: ''}

        <slot />

        <input type="checkbox" class="ins-checkbox-card-input"
          name={this.name} value={this.value} />
      </div>
    )
  }
}
