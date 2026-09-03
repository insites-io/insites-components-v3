import { h, Component, Prop, Event, EventEmitter, Element, Method } from "@stencil/core";
import rangeSlider from "rangeslider-pure";
// plugin API reference https://www.npmjs.com/package/rangeslider-pure

@Component({
  tag: 'ins-input-slider',
  styleUrls: ['../../../node_modules/rangeslider-pure/dist/range-slider.css']
})
export class InsInputSlider {
  @Element() el: HTMLElement;

  @Event() insSlide: EventEmitter;
  @Event() insSlideStart: EventEmitter;
  @Event() insSlideEnd: EventEmitter;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable: true}) name: string;
  @Prop({mutable: true}) label: string;
  @Prop({mutable: true}) value: any = 0;
  @Prop({mutable: true}) position: string = "right";

  @Prop({mutable: true}) min: number = 0;
  @Prop({mutable: true}) max: number;
  @Prop({mutable: true}) step: number = 1;

  @Prop({mutable: true}) errorMessage: string;
  @Prop({mutable: true}) hasError: boolean = false;
  @Prop({mutable: true}) disabled: boolean = false;
  @Prop({mutable: true}) sliderOnly: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;

  @Prop({mutable: true}) tooltip: string = "";

  inputEl: HTMLInputElement;
  tooltipValue: HTMLDivElement;
  sliderEl: any; // TODO: use rangeslider-pure's instance type if the package ships typings
  labelInput: HTMLInputElement;

  @Method()
  async getValue(){
    return this.value
  }

  @Method()
  async setValue(value: number){
    this.value = value;
    this.insValueChange.emit(this.value);
  }

  componentDidLoad(){
    this.initSlider();
    this.initTooltip();
    this.initLabelInput();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.el);
    }
  }

  componentDidUpdate(){
    this.triggerUpdate();
  }

  emitAction(where?: 'Start' | 'End'){
    let prop = `insSlide${where || ""}`;
    this[prop].emit({
      action: prop,
      label: this.label,
      value: this.value
    });
  }

  triggerUpdate(){
    this.sliderEl.update({
      min : this.min,
      max : this.max,
      step : this.step,
      value : this.value
    }, true);
  }

  initSlider(){
    this.inputEl = this.el.querySelector('input[type="range"]') as HTMLInputElement;
    this.sliderEl = new rangeSlider(this.inputEl, {
      onSlideStart: () => {
        this.emitAction('Start');
      },
      onSlide: value => {
        this.tooltipValue.textContent = value;
        this.emitAction()
      },
      onSlideEnd: value => {
        this.value = value;
        this.emitAction('End');
        this.insValueChange.emit(this.value);
      }
    });
  }

  initTooltip(){
    const handleEl = this.sliderEl.handle;
    this.tooltipValue = document.createElement('div');
    this.tooltipValue.classList.add('ins-input-slider_tooltip');
    this.tooltipValue.textContent = this.sliderEl.value;
    handleEl.appendChild(this.tooltipValue);
  }

  initLabelInput(){
    if (this.sliderOnly) return;
    this.labelInput = this.el.querySelector('label input[type="number"]') as HTMLInputElement;
    this.labelInput.addEventListener('change', e => {
      this.value = (e.target as HTMLInputElement).value;
      this.triggerUpdate();
      this.insValueChange.emit(this.value)
    })

  }

  renderLabelInput(){
    return (
      <label class={`ins-input-slider_label
         ${this.label ? "" : "no-label"}`}>

        {this.label}

        <input type="number" class="ins-input-slider_label-input"
          min={this.min} max={this.max} step={this.step}
          value={this.value || this.min} disabled={this.disabled} />


        {this.tooltip
          ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
          : ''
        }
      </label>
    )
  }

  validateDescription(value: string) {
    let allowed = '<a>,<abbr>,<acronym>,<address>,<article>,<aside>,<b>,<base>,<bdi>,<bdo>,<blockquote>,<br>,<caption>,<code>,<dd>,<del>,<details>,<dfn>,<dir>,<div>,<dl>,<dt>,<em>,<font>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<hr>,<i>,<ins>,<label>,<li>,<link>,<mark>,<menu>,<meter>,<nav>,<ol>,<p>,<pre>,<q>,<s>,<samp>,<section>,<small>,<span>,<strike>,<strong>,<sub>,<summary>,<sup>,<table>,<tbody>,<td>,<tfoot>,<th>,<thead>,<time>,<tr>,<tt>,<u>,<ul>,<wbr>';
    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return value.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) => {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
  }

  render(){
    if (!this.max) return(<div>Please set the max attribute to render ins-input-slider</div>)

    return (
      <div class={`ins-input-slider ${this.position}
        ${this.disabled ? 'disabled' : ''}
        ${this.sliderOnly ? 'slider-only' : ''}`}>

        {(this.position === "left" || this.position === "top") && !this.sliderOnly
          ? this.renderLabelInput()
          : "" }

        { this.sliderOnly ? "" : <span class="ins-input-slider_min">{ this.min }</span> }

        <input type="range"
          min={this.min} max={this.max} step={this.step}
          disabled={this.disabled} name={this.name}
          value={this.value || this.min} />

        { this.sliderOnly ? "" : <span class="ins-input-slider_max">{ this.max }</span> }

        {(this.position === "right" || this.position === "bottom") && !this.sliderOnly
          ? this.renderLabelInput()
          : "" }

        {this.hasError ?
          <div class="ins-form-error">
            {this.errorMessage}
          </div>
        : ''}

        { this.description ? this.htmlDescription ?
          <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
        : ''}
      </div>
    )
  }
}
