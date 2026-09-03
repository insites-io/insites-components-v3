import { h, Component, Prop, Element, Method, Event, EventEmitter } from '@stencil/core';
import intlTelInput from "intl-tel-input";

@Component({
  tag: 'ins-input-tel',
  styleUrls: ["../../../node_modules/intl-tel-input/build/css/intlTelInput.min.css"]
})

export class InsInputTel {
  @Element() insInputTelEl: HTMLElement;
  @Event() insInput: EventEmitter;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) label: string = "";
  @Prop({ mutable: true }) areacodePlaceholder: string = "";
  @Prop({ mutable: true }) areacodeValue: string = "";
  @Prop({ mutable: true }) phonenumPlaceholder: string = "";
  @Prop({ mutable: true }) phonenumValue: string = "";
  @Prop({ mutable: true }) countryCode: string = "61";
  @Prop({ mutable: true }) areaCode: string = "";
  @Prop({ mutable: true }) phoneNumber: string = "";
  @Prop({ mutable: true }) errorMessage: string = "";
  @Prop({ mutable: true }) required: boolean;
  @Prop({ mutable: true }) hasError: boolean;
  @Prop({ mutable: true }) disabled: boolean;
  @Prop({ mutable: true }) readonly: boolean;
  @Prop({ mutable: true }) noAreacode: boolean;
  @Prop({ mutable: true }) tooltip: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;

  responsiveView: boolean;
  dropdownIsOpen: boolean = false;
  _phone: HTMLInputElement;
  _areaCode: HTMLInputElement;
  _phoneNumber: HTMLInputElement;
  _label: HTMLLabelElement;
  _iti: ReturnType<typeof intlTelInput>;

  _phone_number_value: string = "";
  _area_code_value: string = "";

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insInputTelEl.dataset.insReset = "true";
      this.insInputTelEl.removeAttribute("data-ins-recover");
      this.insInput.emit({ field: "phone_number", value: null });
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insInputTelEl.dataset.insRecover = "true";
      this.insInputTelEl.removeAttribute("data-ins-reset");
      const valuePhone = await this.getValues();
      this.insInput.emit({ field: "phone_number", value: valuePhone.phone_number });
    }
  }

  componentDidLoad() {
    this._phone = this.insInputTelEl.querySelector('.phone') as HTMLInputElement;
    this._areaCode = this.insInputTelEl.querySelector('.area-code') as HTMLInputElement;
    this._phoneNumber = this.insInputTelEl.querySelector('.phone-number') as HTMLInputElement;
    this._label = this.insInputTelEl.querySelector('label');
    this._phone_number_value = this.phonenumValue;
    this._area_code_value = this.areacodeValue

    this.initintTel();
    this.initKeyPressEvents();
    this.initFocusEvents();
    this.initBlurEvents();

    if (this.countryCode){
      this.setCountryCode(`+${this.countryCode}`);
    }

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insInputTelEl);
    }
  }

  initBlurEvents(){
    this._phoneNumber.addEventListener('blur', this.deactivateLabel.bind(this));
    this._areaCode.addEventListener('blur', this.deactivateLabel.bind(this));
  }

  initFocusEvents(){
    this._phoneNumber.addEventListener('focus', this.activateLabel.bind(this));
    this._areaCode.addEventListener('focus', this.activateLabel.bind(this));
  }

  initKeyPressEvents(){
    this._areaCode.addEventListener('keypress', e => this.validateValue(e));
    this._phoneNumber.addEventListener('keypress', e => this.validateValue(e));

    this._areaCode.addEventListener('keyup', e => this.changeHandler(e, 5, 'area_code'));
    this._phoneNumber.addEventListener('keyup', e => this.changeHandler(e, 13, 'phone_number'));

    this._areaCode.addEventListener('change', e => this.changeHandler(e, 5, 'area_code'));
    this._phoneNumber.addEventListener('change', e => this.changeHandler(e, 13, 'phone_number'));
  }

  changeHandler(event: Event, maxChars: number, field: 'area_code' | 'phone_number'){
    let value = (event.target as HTMLInputElement).value.replace(/[^\d]/g, '');

    if (value.length > maxChars) {
      value = value.substr(0, maxChars);
    }

    (event.target as HTMLInputElement).value = value;
    if (field === "area_code") {
      this._area_code_value = value;
    } else if (field === "phone_number") {
      this._phone_number_value = value;
    }

    this.insInput.emit({ field, value });
    this.insValueChange.emit(this._getValue());
  }

  validateValue(event: KeyboardEvent){
    if ((event.which >= 48 && event.which <= 57)
        || event.which === 8
        || event.which === 9
        || event.which === 32
    ) {
      return true;

    } else event.preventDefault();
  }

  initintTel() {
    this._iti = intlTelInput(this._phone, {
      autoPlaceholder: "off",
      initialCountry: "au",
      preferredCountries: ['au'],
      separateDialCode: true
    });

    this._phone.addEventListener("countrychange", async () => {
      let data = await this.getCountryData();
      this.countryCode = data.dialCode;
      this.insInput.emit({
        field: 'country_code',
        value: data
      })
      this.insValueChange.emit(await this.getValue());
    });

    this._phone.addEventListener("open:countrydropdown", () => {
      this.activateLabel();
      this.dropdownIsOpen = true;
    });

    this._phone.addEventListener("close:countrydropdown", () => {
      this.dropdownIsOpen = false;

      if (this._phoneNumber !== document.activeElement
        && this._areaCode !== document.activeElement){
        this.deactivateLabel();
      }
    });

    this.insInputTelEl.querySelector('.iti__arrow').className = "icon-caret-down";
  }

  @Method()
  async getValue(){
    return this._getValue();
  }

  _getValue(){
    let value = `+${this.countryCode}`
    if (!this.noAreacode){
      value += this._area_code_value;
    }

    return value += this._phone_number_value;
  }

  @Method()
  async getValues(): Promise<{ country_code: string; area_code: string; phone_number: string }>{
    return {
      country_code: this._iti.getSelectedCountryData().dialCode,
      area_code: this._areaCode.value,
      phone_number: this._phoneNumber.value
    }
  }

  @Method()
  async setValue({ country, country_code, area_code, phone_number }: { country?: string; country_code?: string; area_code?: string; phone_number?: string }){
    if (country) this._iti.setCountry(country);
    if (country_code) this._iti.setNumber(country_code);

    this.areacodeValue = area_code;
    this._area_code_value = area_code;
    this._areaCode.value = area_code;

    this.phonenumValue = phone_number;
    this._phone_number_value = phone_number;
    this._phoneNumber.value = phone_number;

    this.insValueChange.emit(this._getValue());
  }

  @Method()
  async getCountryData() {
    return this._iti.getSelectedCountryData();
  }

  @Method()
  async setCountry(country: string) {
    this._iti.setCountry(country);
  }

  @Method()
  async setCountryCode(code: string) {
    this._iti.setNumber(code);
  }

  activateLabel() {
    if (this.readonly || this.disabled) return;
    if (this._label) this._label.classList.add('active');
  }

  deactivateLabel() {
    if (this.readonly || this.disabled) return;
    if (this._label) this._label.classList.remove('active');
    this.areacodeValue = this._area_code_value;
    this.phonenumValue = this._phone_number_value;
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
      <div class={`ins-input-tel-wrap ins-form-field-wrap
        ${this.hasError ? 'is-invalid':''}
        ${this.responsiveView ? 'responsive' : ''}
        ${this.noAreacode ? 'no-areacode' : ''}
        ${this.readonly ? 'read-only' : ''} `}>

        {this.label || this.tooltip ?
          <label class="ins-form-label">
            {this.label}

            {this.tooltip
              ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
              : ''
            }

          </label>
        : '' }


        <div class="row-col-container">

          <div class="col-container column-1">
            <input
              type="tel"
              class="phone ins-form-field"
              disabled={this.disabled}
              readonly={this.readonly}
            />
          </div>

          <div class="col-container column-2">
            <input
              type="tel"
              tabindex="0"
              maxlength="5"
              class="ins-form-field area-code"
              name={this.areaCode}
              placeholder={this.areacodePlaceholder}
              value={this.areacodeValue}
              required={this.required ? true : false}
              disabled={this.disabled} readonly={this.readonly}
            />
          </div>

          <div class="col-container column-3">
            <input
              type="tel"
              tabindex="0"
              maxlength="13"
              class="ins-form-field phone-number"
              name={this.phoneNumber}
              placeholder={this.phonenumPlaceholder}
              value={this.phonenumValue}
              disabled={this.disabled} readonly={this.readonly} />
          </div>

        </div>

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
