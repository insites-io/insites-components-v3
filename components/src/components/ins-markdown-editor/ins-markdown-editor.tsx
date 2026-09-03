import { h, Component, Element, Prop, Method, Event, EventEmitter } from "@stencil/core";
import "../../assets/js/simplemde.min.js";

@Component({
  tag: "ins-markdown-editor",
  styleUrl: "../../../node_modules/simplemde/dist/simplemde.min.css"
})
export class InsMarkdownEditor {
  @Element() insMarkdownEditorEl: HTMLElement;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  editor: any;
  labelEl: HTMLElement;
  wrapperEl: HTMLElement;

  @Prop({ mutable: true }) label: string = "";
  @Prop({ mutable: true }) value: string = "";
  @Prop({ mutable: true }) name: string = "";
  @Prop({ mutable: true }) required: boolean;
  @Prop({ mutable: true }) readonly: boolean;
  @Prop({ mutable: true }) errorMessage: string = "";
  @Prop({ mutable: true }) hasError: boolean;
  @Prop({mutable: true}) tooltip: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insMarkdownEditorEl.dataset.insReset = "true";
      this.insMarkdownEditorEl.removeAttribute("data-ins-recover");
      this.insValueChange.emit(null);
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insMarkdownEditorEl.dataset.insRecover = "true";
      this.insMarkdownEditorEl.removeAttribute("data-ins-reset");
      this.insValueChange.emit(await this.getValue());
    }
  }

  @Method()
  async val() {
    return this.editor.value();
  }

  @Method()
  async getValue() {
    return this.editor.value();
  }

  @Method()
  async reset(){
    this.value = "";
    this.editor.value("");
  }

  @Method()
  async setValue(value: string) {
    this.value = value;
    this.editor.value(value);
  }

  activeState() {
    if (this.labelEl) this.labelEl.classList.add('active');
    if (this.wrapperEl) this.wrapperEl.classList.add('active');
  }

  inactiveState() {
    if (this.labelEl) this.labelEl.classList.remove('active');
    if (this.wrapperEl) this.wrapperEl.classList.remove('active');
  }

  setHiddenIcons() {
    if (this.readonly) {
      return ['bold', 'italic', 'heading', 'quote', 'image', 'ordered-list', 'unordered-list', 'guide', 'link'];
    } else {
      return ['guide'];
    }
  }

  componentDidLoad() {
    this.initSimpleMDE();
    this.initEls();
    this.initEventListeners();

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insMarkdownEditorEl);
    }
  }

  initSimpleMDE(){
    this.editor = new window["SimpleMDE"]({
      element: this.insMarkdownEditorEl.querySelector('.markdown-editor'),
      spellChecker: false,
      status: false,
      hideIcons: this.setHiddenIcons()
    });

    this.editor.codemirror.options.readOnly = this.readonly;
    if (this.value) this.editor.value(this.value);
  }

  initEls(){
    this.labelEl = this.insMarkdownEditorEl.querySelector('label') as HTMLElement;
    this.wrapperEl = this.insMarkdownEditorEl.querySelector('.ins-markdown-editor') as HTMLElement;
  }

  initEventListeners() {
    this.editor.codemirror.on("focus", () => {
      this.activeState();
    });

    this.editor.codemirror.on("blur", () => {
      this.inactiveState();
    });

    this.editor.codemirror.on("change", () => {
      this.insValueChange.emit(this.editor.value());
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
      <div class={`ins-markdown-editor ins-form-field-wrap ${this.hasError ? 'is-invalid' : ''}`}>
        { this.label || this.tooltip ?
          <label class="ins-form-label">
            {this.label}

            {this.tooltip
              ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
              : ''
            }
          </label>
        : '' }

        <div class="markdown-editor-wrap ins-form-field">
          <textarea name={this.name} class="markdown-editor"></textarea>
          {this.hasError ?
            <div class="ins-form-error">
              {this.errorMessage ? this.errorMessage : `${this.label} field is required`}
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
