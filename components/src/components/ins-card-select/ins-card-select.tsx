import { h, Component, Prop, Listen, EventEmitter, Event, Element, Method } from "@stencil/core";

@Component({
  tag: 'ins-card-select'
})

export class InsCardSelect {
  @Element() insCardSelectEl: HTMLElement;
  @Prop ({ mutable:true }) label: string;
  @Prop ({ mutable:true }) value: any;
  @Prop ({ mutable:true }) disabled: boolean;
  @Prop ({ mutable:true }) readonly: boolean;
  @Prop ({ mutable:true }) hasError: boolean;
  @Prop ({ mutable:true }) errorMessage: string;
  @Prop ({ mutable:true }) multiple: boolean;
  @Prop ({ mutable:true }) tooltip: string;
  @Prop ({ mutable:true }) load: boolean = false;
  @Prop ({ mutable:true }) checkLoad: boolean = false;
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;

  // Lifecycle
  @Event() didLoad: EventEmitter;
  @Event() insInput: EventEmitter;
  cardOptions;

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insCardSelectEl.dataset.insReset = "true";
      this.insCardSelectEl.removeAttribute("data-ins-recover");
      this.insInput.emit({ value: this.multiple ? [] : null });
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insCardSelectEl.dataset.insRecover = "true";
      this.insCardSelectEl.removeAttribute("data-ins-reset");
      this.insInput.emit({ value: await this.getValue() });
    }
  }

  @Listen('insCardSelectOptionClicked')
  async InsCardSelectOptionClickedHandler(event: CustomEvent) {
    if (!this.disabled && !this.readonly) {
      let el = event.target as HTMLInsCardSelectOptionElement;

      if (!this.multiple) {
        this.value = event.detail.value;
        for (let item of this.cardOptions) {
          item.deactivate();
        }
        el.activate();
      } else {
        this.value = [];
        await el.toggle();

        for (let item of this.cardOptions) {
          if (item.activated) {
            this.value.push(item.value);
          }
        }
      }

      this.insInput.emit({ value: this.value });
    }
  }

  @Method() async setValue(value: string | string[]) {
    if (!this.multiple) {
      for (let item of this.cardOptions) {
        if (item.value === value) {
          item.activate();
        } else {
          item.deactivate();
        }
      }
    } else {
      if (Array.isArray(value)) {
        for (let item of this.cardOptions) {
          item.deactivate();
          if (value.indexOf(item.value) !== -1) {
            item.activate();
          }
        }
      }
    }
  }

  @Method() async getValue() {
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
    this.cardOptions = this.insCardSelectEl.querySelectorAll('ins-card-select-option');

    if (!this.multiple && this.value) this.setValue(this.value);
    if (this.multiple) this.value = [];
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
  }

  render() {
    return (
      <div class={`ins-card-select-wrap
        ${this.hasError ? ' is-invalid' : ''}
        ${this.disabled ? ' disabled' : ''}
        ${this.readonly ? ' readonly' : ''}`}>
          <label class="ins-card-select-label-wrap">{this.label}
            {this.tooltip
              ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
              : ''
            }
            </label>
          <div class="ins-card-select-option-wrap">
            <slot />
          </div>

          {this.errorMessage && this.hasError ? <div class="ins-form-error">{this.errorMessage}</div> : ''}

          { this.description ? this.htmlDescription ?
            <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
          : ''}
      </div>
    )
  }
}
