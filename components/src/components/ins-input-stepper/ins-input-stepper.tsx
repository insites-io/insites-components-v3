import { h, Component, Prop, Event, EventEmitter, Element, Method } from "@stencil/core";

@Component({ tag: 'ins-input-stepper' })
export class InsStepper {
  @Element() el: HTMLElement;
  @Event() insBlur: EventEmitter;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) label: string = "";
  @Prop({ mutable: true }) name: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @Prop({ mutable: true }) step: string = "1";
  @Prop({ mutable: true }) min: string;
  @Prop({ mutable: true }) max: string;
  @Prop({ mutable: true }) value: string;

  @Prop({ mutable: true }) required: boolean = false;
  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) readonly: boolean = false;

  @Prop({ mutable: true }) hasError: boolean = false;
  @Prop({ mutable: true }) errorMessage: string = "";

  @Prop({mutable: true}) tooltip: string = "";

  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;
  @Prop({mutable: true}) noValueChangeOnBlur: boolean = false;

  labelEl: HTMLElement; inputEl: HTMLElement; active: boolean;

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.el.dataset.insReset = "true";
      this.el.removeAttribute("data-ins-recover");
      this.insValueChange.emit(null);
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.el.dataset.insRecover = "true";
      this.el.removeAttribute("data-ins-reset");
      this.insValueChange.emit(await this.getValue());
    }
  }

  @Method()
  async getValue() {
    if (this.value) {
      return Number(this.value);
    } else {
      return null;
    }
  }

  @Method()
  async setValue(value: string) {
    this.value = value;
    this.insValueChange.emit(this.value);
  }

  componentWillLoad(){
    this.value = this.validateInput(this.value);
  }

  componentDidLoad(){
    this.addClickOutside();
    this.bindEls();

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
  }

  componentWillUpdate(){
    this.value = this.validateInput(this.value);
  }

  componentDidUpdate(){
    this.bindEls();
  }

  bindEls(){
    this.labelEl = this.el.querySelector('.ins-form-label') as HTMLElement;
    this.inputEl = this.el.querySelector('.ins-input-stepper_input-wrap') as HTMLElement;
  }

  stepDown(){
    if (this.readonly || this.disabled) return false;
    let diff = +this.value - +this.step;
    let value = this.validateInput(diff);

    this.insValueChange.emit(value);
    this.value = value;
    return undefined;
  }

  validateInput(input){
    let num = +input;
    if (!num && num !== 0) return "0";
    if (this.min && num < +this.min) return this.min;
    if (this.max && num > +this.max) return this.max;
    return input;
  }

  stepUp(){
    if (this.readonly || this.disabled) return false;
    let sum = +this.value + +this.step;
    let value = this.validateInput(sum);

    this.insValueChange.emit(value);
    this.value = value;
    return undefined;
  }

  activateLabel(){
    if (!this.readonly && !this.disabled){
      this.active = true;
      if (this.labelEl) this.labelEl.classList.add('active');
      if (this.inputEl) this.inputEl.classList.add('active');
    }
  }

  deactivateLabel(){
    this.active = false;
    if (this.labelEl) this.labelEl.classList.remove('active');
    if (this.inputEl) this.inputEl.classList.remove('active');
  }

  insBlurHandler(event){
    let keyCode = event.which || event.keyCode;
    let value = this.validateInput(event.target.value);
    event.target.value = value;

    this.deactivateLabel();
    this.insBlur.emit({ value, keyCode });

    if (!this.noValueChangeOnBlur) {
      if (event.target.value) {
        this.insValueChange.emit(Number(event.target.value));
      } else {
        this.insValueChange.emit(null);
      }
    }

    this.value = value;
  }

  insInputHandler(event) {
    if (event.target.value) {
      this.insValueChange.emit(Number(event.target.value));
    } else {
      this.insValueChange.emit(null);
    }
  }

  addClickOutside(){
    window.addEventListener("click", e => {
      let target = e.target as HTMLElement;
      let closest = target.closest("ins-input-stepper")

      if (closest !== this.el) {
        this.deactivateLabel();
      }
    });
  }

  validateDescription(value: string) {
    let allowed = '<a>,<abbr>,<acronym>,<address>,<article>,<aside>,<b>,<base>,<bdi>,<bdo>,<blockquote>,<br>,<caption>,<code>,<dd>,<del>,<details>,<dfn>,<dir>,<div>,<dl>,<dt>,<em>,<font>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<hr>,<i>,<ins>,<label>,<li>,<link>,<mark>,<menu>,<meter>,<nav>,<ol>,<p>,<pre>,<q>,<s>,<samp>,<section>,<small>,<span>,<strike>,<strong>,<sub>,<summary>,<sup>,<table>,<tbody>,<td>,<tfoot>,<th>,<thead>,<time>,<tr>,<tt>,<u>,<ul>,<wbr>';
    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

    const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return value.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) => {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
  }

  render() {
    return (
      <div class={`ins-input-stepper ins-form-field-wrap
        ${this.hasError ? 'is-invalid' : ''}
        ${this.readonly ? 'readonly': ''}
        ${this.disabled ? 'disabled': ''}`}>

        { this.label || this.tooltip ?
          <label htmlFor={this.name}
            class={`ins-form-label
              ${this.disabled ? 'disabled' : ''}`}>

            {this.label}

            {this.tooltip
              ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
              : ''
            }
          </label>
        : ''}

        <div class="ins-input-stepper_input-wrap"
          onClick={() => this.activateLabel()}>

          <div class="ins-input-stepper_minus"
            onClick={() => this.stepDown()}>
            <i class="icon-minus"></i>
          </div>

          <div class="ins-input-stepper_input">
            <input type="number"
              step={this.step}
              min={this.min}
              max={this.max}
              name={this.name}
              value={this.value}
              required={this.required}
              disabled={this.disabled}
              readonly={this.readonly}
              onInput={e => this.insInputHandler(e)}
              onFocus={() => this.activateLabel()}
              onBlur={e => this.insBlurHandler(e)}
              />
          </div>

          <div class="ins-input-stepper_plus"
            onClick={() => this.stepUp()}>
            <i class="icon-plus"></i>
          </div>

        </div>

        { this.hasError ?
          <div class="ins-form-error">
            {this.errorMessage}
          </div>
        : ''}

        { this.description ? this.htmlDescription ?
          <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
        : ''}
      </div>
    );
  }
}
