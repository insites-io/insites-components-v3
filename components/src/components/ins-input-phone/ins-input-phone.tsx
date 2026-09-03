import { h, Component, Prop, Element, Method, State, Event, EventEmitter, Watch } from '@stencil/core';
import intlTelInput from "intl-tel-input";

@Component({
  tag: 'ins-input-phone',
  styleUrls: ["../../../node_modules/intl-tel-input/build/css/intlTelInput.min.css"]
})

export class InsInputPhone {
  @Element() el: HTMLElement;
  @Event() insInput: EventEmitter;
  @Event() insValueChange: EventEmitter<string>;
  @Event() insValidation: EventEmitter<{hasError: boolean; errorMessage: string}>;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) label: string = "";
  @Prop({ mutable: true }) value: string = "";
  @Prop({ mutable: true }) placeholder: string = "";
  @Prop({ mutable: true }) errorMessage: string = "";
  @Prop({ mutable: true }) invalidMessage: string = "";
  @Prop({ mutable: true }) validate: boolean;
  @Prop({ mutable: true }) required: boolean;
  @Prop({ mutable: true }) hasError: boolean;
  @Prop({ mutable: true }) disabled: boolean;
  @Prop({ mutable: true }) readonly: boolean;
  @Prop({ mutable: true }) tooltip: string = "";

  @Prop({ mutable: true }) fieldId: string = "";
  @Prop({ mutable: true }) name: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;

  @State() activated: boolean = false;

  _iti: ReturnType<typeof intlTelInput>;
  _errorMessage: string;

  @Watch('value')
  valueHandler(newValue: string) {
    if (newValue) this.setValue(newValue);
  }

  @Method()
  async getValue(){
    return this._iti.getNumber();
  }

  @Method()
  async setValue(value: string){
    this._iti.setNumber(value);
  }

  componentDidLoad() {
    this._errorMessage = this.errorMessage;
    setTimeout(() => this.initintTel(), 500);
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.el);
    }
  }

  initintTel() {
    let input = this.el.querySelector('.ins-form-field');
    this._iti = intlTelInput(input, {
      utilsScript: "https://components.insites.io/assets/js/ins-input-phone-utils.min.js",
      initialCountry: "au",
      preferredCountries: ['au']
    });

    if (this.value) this.setValue(this.value);
  }

  blurHandler(){
    this.activated = false;
    this.value = this._iti.getNumber();
    this.insValueChange.emit(this.value);
    if (this.validate) this.validateHandler();
  }

  validateHandler(){
    if (!this.value && this.required){
      this.hasError = true;
      this.errorMessage = this._errorMessage
        ? this._errorMessage
        : "Required field.";

    } else if (this.value){
      this.hasError = !this._iti.isValidNumber();
      this.errorMessage = this.invalidMessage
        ? this.invalidMessage
        : "Invalid number.";

    } else {
      this.hasError = false;
    }

    this.insValidation.emit({
      hasError: this.hasError,
      errorMessage: this.errorMessage
    })
  }

  activateLabel(){
    if (!this.readonly && !this.disabled){
      this.activated = true
    }
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

  render() {
    return (
      <div class={`ins-input-phone-wrap ins-form-field-wrap
        ${this.hasError ? 'is-invalid':''}
        ${this.readonly ? 'read-only' : ''} `}>

        {this.label || this.tooltip?
          <label htmlFor={this.name}
            class={`ins-form-label
              ${this.disabled ? 'disabled' : ''}
              ${this.activated ? 'active':''}`}>

            {this.label}

            {this.tooltip
              ? <ins-input-tooltip
                  content={this.tooltip}>
                </ins-input-tooltip>

              : ''
            }

          </label>
        : ''}

        <input type ="hidden" name={this.name} value={this.value} />

        <input class="ins-form-field"
          id={this.fieldId ? this.fieldId : null}
          type="tel"
          placeholder={this.placeholder}
          required={this.required}
          disabled={this.disabled}
          readonly={this.readonly}
          onFocus={() => this.activateLabel()}
          onBlur={() => this.blurHandler()} />

        {this.hasError ?
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
