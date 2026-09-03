import { h, Component, Prop, Event, EventEmitter, Element, Method } from "@stencil/core";

@Component({
  tag: 'ins-toggle-switch'
})

export class InsToggleSwitch {
  @Element() insToggleSwitchEl: HTMLElement
  @Event() insToggle: EventEmitter;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable: true}) name: string;
  @Prop({mutable: true}) checked: boolean;
  @Prop({mutable: true}) value: string;
  @Prop({mutable: true}) trueValue: string = "";
  @Prop({mutable: true}) falseValue: string = "";
  @Prop({mutable: true}) label: string;
  @Prop({mutable: true}) disabled: boolean;
  @Prop({mutable: true}) inputLabel: string;
  @Prop ({ mutable:true }) hasError: boolean;
  @Prop ({ mutable:true }) errorMessage: string;

  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;
  @Prop({mutable: true}) enabledLabel: string;
  @Prop({mutable: true}) disabledLabel: string;
  @Prop({mutable: true}) tooltip: string = "";


  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insToggleSwitchEl.dataset.insReset = "true";
      this.insToggleSwitchEl.removeAttribute("data-ins-recover");
      this.insToggle.emit({ checked: false, value: this.value });
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insToggleSwitchEl.dataset.insRecover = "true";
      this.insToggleSwitchEl.removeAttribute("data-ins-reset");
      this.insToggle.emit({ checked: this.checked, value: this.value });
    }
  }

  @Method()
  async setValue(value: string, trueValue: string, falseValue: string){
    this.value = value;
    this.trueValue = trueValue;
    this.falseValue = falseValue;
  }

  @Method()
  async updateCheckState(state: boolean){
    this.checked = state;
    this.emitEvents();
  }

  @Method()
  async getValue(){
    return {
      value: this.value,
      trueValue: this.trueValue,
      falseValue: this.falseValue
    }
  }

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insToggleSwitchEl);
    }
  }

  onCheckHandler(){
    this.checked = !this.checked;
    this.emitEvents();
  }

  emitEvents(){
    this.insToggle.emit({
      checked: this.checked,
      value: this.value
    });

    let toEmit = this.value;

    if (this.checked && this.trueValue){
      toEmit = this.trueValue;
    } else if (!this.checked && this.falseValue){
      toEmit = this.falseValue;
    }

    this.insValueChange.emit(toEmit);
  }

  constructLabel(){
    if (this.checked){
      return this.enabledLabel ? this.enabledLabel : this.label;
    }
    return this.disabledLabel ? this.disabledLabel : this.label;
  }

  constructTooltip() {
    return (
      this.tooltip ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip> : ''
    )
  }

  validateDescription(value: string): string {
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
      <div class={`v-switch ${this.disabled ? 'disabled':''} ${this.inputLabel ? 'has-input-label' : ''} ${this.hasError ? 'is-invalid' : ''}`}>
        { this.inputLabel ? <label class="input-label">{this.inputLabel}{this.constructTooltip()}</label> : ''}
        <label class="ins-switch">
          <input type="checkbox" checked={this.checked}
            name={this.name}
            onChange={() => this.onCheckHandler()}
            disabled={this.disabled} />

          <span class="ins-slider round"><i></i></span>
          <span class="ins-label">{this.constructLabel()}</span>
        </label>

        {!this.inputLabel ? this.constructTooltip() : ''}
        {this.inputLabel && this.errorMessage && this.hasError ? <div class="ins-form-error">{this.errorMessage}</div> : ''}
        { this.description ? this.htmlDescription ?
          <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
        : ''}
      </div>
    );
  }
}
