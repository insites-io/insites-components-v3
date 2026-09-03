import { h, Component, Prop, Event, EventEmitter, Element, Method } from "@stencil/core";

@Component({ tag: 'ins-input' })
export class InsInput {
  @Element() el: HTMLElement;
  @Event() insInput: EventEmitter<{ value: string | null; keyCode?: number }>;
  @Event() insBlur: EventEmitter<{ value: string; keyCode: number }>;
  @Event() insIconClick: EventEmitter<{ target: HTMLElement; value: string }>;
  @Event() insValueChange: EventEmitter<string | null>;
  @Event() insColorChange: EventEmitter<{ value: string | null; valid: boolean }>;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable: true}) placeholder: string = "";
  @Prop({mutable: true}) value: string = "";
  @Prop({mutable: true}) label: string = "";
  @Prop({mutable: true}) name: string = "";
  @Prop({mutable: true}) field: string = 'text';
  @Prop({mutable: true}) fieldId: string = "";
  @Prop({mutable: true}) errorMessage: string = "";
  @Prop({mutable: true}) maxlength: string = "";
  @Prop({mutable: true}) min: string = "";
  @Prop({mutable: true}) max: string = "";
  @Prop({mutable: true}) step: string = "";
  @Prop({mutable: true}) required: boolean = false;
  @Prop({mutable: true}) icon: string = "";
  @Prop({mutable: true}) iconEvent: boolean = false;
  @Prop({mutable: true}) iconTitle: string = "";
  @Prop({mutable: true}) disabled: boolean = false;
  @Prop({mutable: true}) readonly: boolean = false;
  @Prop({mutable: true}) hasError: boolean = false;
  @Prop({mutable: true}) activated: boolean = false;

  @Prop({mutable: true}) unitRight: string = "";
  @Prop({mutable: true}) unitLeft: string = "";

  @Prop({mutable: true}) tooltip: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @Prop({ mutable: true }) description: string = "";
  @Prop({ mutable: true }) htmlDescription: boolean = false;

  hexValue: string | null;
  invalidHexColor: string = "";
  active = false;

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.el.dataset.insReset = "true";
      this.el.removeAttribute("data-ins-recover");
      if (this.field === 'color') {
        this.insColorChange.emit({ value: null, valid: false });
      } else {
        this.insInput.emit({ value: null });
      }
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.el.dataset.insRecover = "true";
      this.el.removeAttribute("data-ins-reset");
      if (this.field === 'color') {
        const value = await this.getValue();
        this.insColorChange.emit({ value, valid: !!value?.length });
      } else {
        this.insInput.emit({ value: await this.getValue() });
      }
    }
  }

  @Method()
  async setValue(value: string){
    if (this.field === 'color') {
      let color = value;
      if (color?.length < 7 && color?.length > 3) {
        let tempColor = color.slice(1).split('');
        for (let counter = 0; counter < tempColor.length; counter++) {
          const item = tempColor[counter];
          tempColor[counter] = item + item;
          if (tempColor.join('').length === 6) break;
        }

        color = `#${tempColor.join('')}`;
      }
      const valid = color?.match(/^#[0-9A-F]{6}$/i);

      if (valid) {
        this.hexValue = color;
        this.value = color.slice(1);
      } else {
        this.hexValue = null;
        this.value = null;
      }
    } else {
      this.value = value;
      this.insValueChange.emit(this.value);
    }
  }

  @Method()
  async getValue(){
    if (this.field === 'color') {
      return this.hexValue;
    } else {
      return this.value;
    }
  }

  componentDidLoad(){
    this.adjustInputPadding();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.el);
    }
  }

  adjustInputPadding(){
    let input = this.el.querySelector('input');
    if (this.unitRight){
      let rightEl = this.el.querySelector('.unit-right') as HTMLElement;
      let padding = rightEl.offsetWidth + 20;
      if (this.icon) padding = padding + 20;
      input.style.paddingRight = padding + 'px';
    }

    if (this.unitLeft){
      let leftEl = this.el.querySelector('.unit-left') as HTMLElement;
      let padding = leftEl.offsetWidth + 16;
      input.style.paddingLeft = padding + 'px';
    }
  }

  validateMinMax(value: any, type: string = "input") {
    if (this.min !== "" && value !== "") {
      let min = Number(this.min);
      if (value < min) value = min;
    }

    if (this.max !== "" && value !== "") {
      let max = Number(this.max);
      if (value > max) value = max;
    }

    this.value = value;

    if (type === "blur") {
      let el = this.el.querySelector('.ins-form-field') as HTMLInputElement;
      el.value = value;
    }
  }

  onInputHandler(event: any){
    if (this.field !== "color") {
      let value = event.target.value;
      let keyCode = event.which || event.keyCode;

      if (this.field === "number") this.validateMinMax(value);
      this.insInput.emit({ value, keyCode });
    }
  }

  insBlurHandler(event: any){
    let value = event.target.value;
    let keyCode = event.which || event.keyCode;

    if (this.field === "number") this.validateMinMax(value, "blur");

    if (this.field === 'color') {
      this.validateHexColor(`#${value}`);
    } else {
      this.insBlur.emit({ value, keyCode });
    }
    this.deactivateLabel();
  }

  inputChanged(event: any) {
    let val = event.target && event.target.value;
    if (this.field === "color") {
      val = val.replace(/[^A-Fa-f0-9]/g, "");
      event.target.value = val;
      if (val.length === 6) {
        this.hexValue = `#${val}`;
      } else if (val.length === 0) {
        this.hexValue = null;
      }

      this.insColorChange.emit({
        value: val ? val.length === 6 ? `#${val}` : val : null,
        valid: val.length === 6
      });
    }

    this.value = val;
    this.insValueChange.emit(this.value);
  }

  onIconClickHandler() {
    if(this.iconEvent) {
      this.insIconClick.emit({
          target: this.el,
          value: this.value
      });
    }
  }

  activateLabel(){
    if (!this.readonly && !this.disabled){
      this.activated = true
    }
  }

  deactivateLabel(){
    this.activated = false
  }

  colorHandler(e: any){
    this.validateHexColor(e.target.value);
  }

  validateHexColor(color: string) {
    if (color?.length < 7 && color?.length > 3) {
      let tempColor = color.slice(1).split('');
      for (let counter = 0; counter < tempColor.length; counter++) {
        const item = tempColor[counter];
        tempColor[counter] = item + item;
        if (tempColor.join('').length === 6) break;
      }

      color = `#${tempColor.join('')}`;
    }
    const valid = color?.match(/^#[0-9A-F]{6}$/i);

    if (valid) {
      this.hexValue = color;
      this.value = color.slice(1);
      this.insValueChange.emit(color.slice(1));
      this.insColorChange.emit({
        value: color,
        valid: true
      });
    } else {
      this.hexValue = null;
      this.value = null;
      this.insValueChange.emit(null);
      this.insColorChange.emit({
        value: null,
        valid: false
      });
    }
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

  colorFocusHandler(e: any) {
    e.target.parentNode.parentNode.classList.add('input-active');
  }

  colorBlurHandler(e: any) {
    e.target.parentNode.parentNode.classList.remove('input-active');
  }

  render(){
    return (
      <div class={`ins-input-wrap ins-form-field-wrap
        ${this.hasError || this.invalidHexColor ? 'is-invalid' : ''}
        ${this.icon || this.field === 'color' ? "has-icon":""}
        ${this.field === 'color' ? "has-color":""}
        ${this.unitLeft ? "has-unit-left":""}
        ${this.unitRight ? "has-unit-right":""}
        ${this.field === 'color' && this.active ? "input-active" : ""}`}>

        { this.label || this.tooltip?
          <label htmlFor={this.name}
            class={`ins-form-label
              ${this.disabled ? 'disabled' : ''}
              ${this.activated ? 'active':''}`}>

            {this.label}

            {this.tooltip
              ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
              : ''
            }

          </label>
        : ''}

        <div class="input-wrap">

          {this.unitLeft
            ? <div class="unit-left">
                { this.unitLeft }
              </div>
            : "" }

          <input class="ins-form-field"
            id={this.fieldId ? this.fieldId : null}
            type={this.field !== 'color' ? this.field : 'text'}
            name={this.name}
            placeholder={this.placeholder}
            required={this.required}
            onKeyUp={e => this.onInputHandler(e)}
            onInput={this.inputChanged.bind(this)}
            onFocus={() => this.activateLabel()}
            onBlur={e => this.insBlurHandler(e)}
            disabled={this.disabled}
            maxlength={this.field === 'color' ? 6 : this.maxlength}
            readonly={this.readonly}
            min={this.min}
            max={this.max}
            step={this.step}
            value={this.value} />

          {this.unitRight
            ? <div class="unit-right">
                { this.unitRight }
              </div>
            : "" }

          {this.icon ?
            <i title={this.iconTitle}
              onClick={() => this.onIconClickHandler()}
              class={`icon-wrap
                ${this.label ? this.icon + ' with-label' : this.icon}
                ${this.iconEvent ? 'hover' :''}`}>
            </i>
          : ''}

          {this.field === 'color' ?
            <i class="icon-wrap color-wrap icon-hash">
            </i>: ''}

          {this.field === 'color' ?
            <input type="color"
              class="ins-form-field color"
              value={this.hexValue || "#000000"}
              disabled={this.disabled || this.readonly}
              onInput={e => this.colorHandler(e)}
              onFocus={e => this.colorFocusHandler(e)}
              onBlur={e => this.colorBlurHandler(e)}
            />
          : ''}

        </div>

        { this.hasError || this.invalidHexColor ?
          <div class="ins-form-error">
            { this.invalidHexColor ? this.invalidHexColor : this.errorMessage }
          </div>
        : ''}

        { this.description ? this.htmlDescription ?
          <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
        : ''}
      </div>
    )
  }
}
