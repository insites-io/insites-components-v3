import { h, Component, Prop, Element, Event, EventEmitter, Listen, Method } from "@stencil/core";

@Component({
  tag: 'ins-checkbox-group'
})

export class InsCheckboxGroup {
  @Element() insCheckboxGroupEl: HTMLElement;
  @Event() insInput: EventEmitter;
  @Event() didLoad: EventEmitter;

  @Prop ({ mutable:true }) load: boolean = false;
  @Prop ({ mutable:true }) checkLoad: boolean = false;
  @Prop ({ mutable:true }) label: string;
  @Prop ({ mutable:true }) value: any = [];
  @Prop ({ mutable:true }) disabled: boolean;
  @Prop ({ mutable:true }) readonly: boolean;
  @Prop ({ mutable:true }) hasError: boolean;
  @Prop ({ mutable:true }) errorMessage: string;
  @Prop ({ mutable:true }) multiple: boolean;
  @Prop ({ mutable:true }) tooltip: string;
  @Prop ({ mutable:true }) horizontal: boolean;
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;
  checkboxOptions;

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insCheckboxGroupEl.dataset.insReset = "true";
      this.insCheckboxGroupEl.removeAttribute("data-ins-recover");
      this.insInput.emit({ value: [] });
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insCheckboxGroupEl.dataset.insRecover = "true";
      this.insCheckboxGroupEl.removeAttribute("data-ins-reset");
      this.insInput.emit({ value: await this.getValue() });
    }
  }

  @Listen('insCheck')
  async InsCheckHandler() {
    this.value = [];

    for (let item of this.checkboxOptions) {
      if (item.checked) this.value.push(item.value);
    }

    this.insInput.emit({ value: this.value });
  }

  @Listen('didLoad')
  async didLoadHandler(event) {
    if (this.disabled) event.target.disabled = true;
    if (this.readonly) event.target.readonly = true;
  }

  @Method()
  async setValue(value: string[]) {
    if (Array.isArray(value)) {
      for (let item of this.checkboxOptions) {
        item.updateCheckState(false);
        if (value.indexOf(item.value) !== -1) {
          item.updateCheckState(true);
        }
      }
    }
  }

  @Method()
  async getValue() {
    return this.value;
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

  componentDidLoad() {
    this.checkboxOptions = this.insCheckboxGroupEl.querySelectorAll('ins-checkbox');
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
  }

  render() {
    return (
      <div class={`ins-checkbox-group-wrap
        ${this.hasError ? ' is-invalid' : ''}
        ${this.disabled ? ' disabled' : ''}
        ${this.readonly ? ' readonly' : ''}`}>
        <label class="ins-checkbox-group-label-wrap">{this.label}
          {this.tooltip
            ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
            : ''
          }
          </label>
        <div class={`ins-checkbox-group-option-wrap ${this.horizontal ? 'checkbox-horizontal' : ''}`}>
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