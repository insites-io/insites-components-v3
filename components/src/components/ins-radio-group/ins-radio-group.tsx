import { h, Component, Prop, Element, Event, EventEmitter, Listen, Method } from "@stencil/core";

@Component({
  tag: 'ins-radio-group'
})

export class InsRadioGroup {
  @Element() insRadioGroupEl: HTMLElement;
  @Event() insInput: EventEmitter<{ value: any }>;
  @Event() didLoad: EventEmitter<void>;

  @Prop ({ mutable:true }) load: boolean = false;
  @Prop ({ mutable:true }) checkLoad: boolean = false;
  @Prop ({ mutable:true }) label: string;
  @Prop ({ mutable:true }) value: any = null;
  @Prop ({ mutable:true }) disabled: boolean;
  @Prop ({ mutable:true }) readonly: boolean;
  @Prop ({ mutable:true }) hasError: boolean;
  @Prop ({ mutable:true }) errorMessage: string;
  @Prop ({ mutable:true }) multiple: boolean;
  @Prop ({ mutable:true }) tooltip: string;
  @Prop ({ mutable:true }) horizontal: boolean;
  @Prop ({ mutable:true }) hasNone: boolean;
  @Prop ({ mutable:true }) noneLabel: String = "None";
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;
  radioOptions: any;

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insRadioGroupEl.dataset.insReset = "true";
      this.insRadioGroupEl.removeAttribute("data-ins-recover");
      this.insInput.emit({ value: null });
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insRadioGroupEl.dataset.insRecover = "true";
      this.insRadioGroupEl.removeAttribute("data-ins-reset");
      this.insInput.emit({ value: await this.getValue() });
    }
  }

  @Listen('insCheck')
  async InsCheckHandler(event: CustomEvent) {
    for (let item of this.radioOptions) {
      item.querySelector(".ripple-check.radio").checked = false;
    }

    const target = event.target as HTMLElement;
    target.querySelector<HTMLInputElement>(".ripple-check.radio").checked = true;

    this.value = event.detail.value;
    this.insInput.emit({ value: event.detail.value });
  }

  @Listen('didLoad')
  async didLoadHandler(event: CustomEvent) {
    if (this.disabled) (event.target as any).disabled = true;
    if (this.readonly) (event.target as any).readonly = true;
  }

  @Method()
  async setValue(value: string | any[]) {
    for (let item of this.radioOptions) {
      item.querySelector(".ripple-check.radio").checked = false;
      if (value.indexOf(item.value) !== -1) {
        item.querySelector(".ripple-check.radio").checked = true;
      }
    }
  }

  @Method()
  async getValue() {
    return this.value;
  }

  componentDidLoad() {
    this.radioOptions = this.insRadioGroupEl.querySelectorAll('ins-radio');
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
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
      <div class={`ins-radio-group-wrap
        ${this.hasError ? ' is-invalid' : ''}
        ${this.disabled ? ' disabled' : ''}
        ${this.readonly ? ' readonly' : ''}`}>
        <label class="ins-radio-group-label-wrap">{this.label}
          {this.tooltip
            ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
            : ''
          }
          </label>
        <div class={`ins-radio-group-option-wrap ${this.horizontal ? 'radio-horizontal' : ''}`}>
          {this.hasNone ? <ins-radio value={null} label={this.noneLabel} checked null-value></ins-radio> : ''}
          <slot />
        </div>

        {this.errorMessage && this.hasError ? <div class="ins-form-error">{this.errorMessage}</div> : ''}

        { this.description ? this.htmlDescription ?
          <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
        : ''}
      </div>
    )
  };
}