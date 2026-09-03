import { h, Component, Prop, Event, State, EventEmitter, Element, Method } from "@stencil/core";

@Component({ tag: 'ins-textarea' })
export class InsTextarea {
  @Element() insTextareaEl: HTMLElement;

  @Event() insInput: EventEmitter;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({mutable: true}) placeholder: string;
  @Prop({mutable: true}) name: string;
  @Prop({mutable: true}) label: string;
  @Prop({mutable: true}) value: string;
  @Prop({mutable: true}) errorMessage: string;
  @Prop({mutable: true}) maxlength: string = "";
  @Prop({mutable: true}) counter: string = "";
  @Prop({mutable: true}) hasError: boolean = false;
  @Prop({mutable: true}) readonly: boolean = false;
  @Prop({mutable: true}) disabled: boolean = false;
  @Prop({mutable: true}) required: boolean = false;
  @Prop({mutable: true}) tooltip: string = "";

  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;

  @State() activeLabel: boolean;
  @State() charCount: string = "0";

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insTextareaEl.dataset.insReset = "true";
      this.insTextareaEl.removeAttribute("data-ins-recover");
      this.insInput.emit({ value: null });
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insTextareaEl.dataset.insRecover = "true";
      this.insTextareaEl.removeAttribute("data-ins-reset");
      this.insInput.emit({ value: await this.getValue() });
    }
  }

  @Method()
  async getValue(){
    return this.value
  }

  @Method()
  async setValue(value: string){
    this.value = value;
    this.insValueChange.emit(this.value);
  }

  onTextareaHandler(event: any){
    let x = event.which || event.keyCode;
    this.value = event.target.value;

    this.insInput.emit({
      value: event.target.value,
      keyCode: x
    });

    this.insValueChange.emit(event.target.value);
  }

  activateLabel() {
    this.activeLabel = true;
  }

  deactivateLabel() {
    this.activeLabel = false;
  }

  charCounter(){
    let current = this.value.length;
    let max = this.maxlength ? `/ ${this.maxlength}` : "";
    return `${current}${max}`;
  }

  componentWillUpdate(){
    if (this.counter) this.charCount = this.charCounter();
  }

  componentWillLoad(){
    if (this.counter){

      let max = +this.maxlength;
      if (this.counter === "decreasing" && max){
        this.charCounter = () => {
          let left = max - (this.value ? this.value.length : 0)
          return `${left} characters left`;
        }
      }

      this.charCount = this.charCounter();
    }
  }


  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insTextareaEl);
    }
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

  render(){
    return (
      <div class={`ins-textarea-wrap ins-form-field-wrap ${this.hasError ? 'is-invalid' : ''}`}>

        <div class={`ins-ta ${ this.counter ? 'with-counter' : ''}`}>
          {this.label || this.tooltip ?
            <label class={`ins-form-label
              ${this.disabled ? 'disabled' : ''}
              ${this.activeLabel ? 'active' : ''}`}>

              {this.label}

              {this.tooltip
                ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
                : ''
              }
            </label>
          : '' }

          <textarea
            class="ins-textarea-field ins-form-field"
            name={this.name}
            onKeyUp={e => this.onTextareaHandler(e)}
            onFocus={() => this.activateLabel()}
            onBlur={() => this.deactivateLabel()}
            placeholder={this.placeholder}
            value={this.value}
            disabled={this.disabled}
            readonly={this.readonly}
            required={this.required}
            maxlength={this.maxlength}>
          </textarea>

          {this.hasError ?
            <div class="ins-form-error">
              {this.errorMessage}
            </div>
          : ''}

          {this.counter ?
            <div class="ins-textarea-counter">
              { this.charCount }
            </div>
          : ''}

          { this.description ? this.htmlDescription ?
            <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
          : ''}

        </div>

      </div>
    )
  }
}
