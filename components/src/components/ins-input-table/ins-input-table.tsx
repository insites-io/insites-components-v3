import { h, Component, Prop, Element, Event, EventEmitter, Method, Listen, State } from "@stencil/core";

@Component({
  tag: 'ins-input-table'
})

export class InsInputTable {
  @Element() insInputTableEl: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Event() insInput: EventEmitter;

  @Prop() hasLoad: string;
  @Prop({ mutable: true }) label: string;
  @Prop({ mutable: true }) tableHeaders: any = [];
  @Prop({ mutable: true }) tooltip: string;
  @Prop({ mutable: true }) readonly: boolean;
  @Prop({ mutable: true }) disabled: boolean;
  @Prop({ mutable: true }) hasError: boolean;
  @Prop({ mutable: true }) blankValues: boolean;
  @Prop({ mutable: true }) errorMessage: string;
  @Prop({ mutable: true }) addButtonIcon: string = "icon-plus";
  @Prop({ mutable: true }) removeButtonIcon: string = "icon-minus";
  @Prop({ mutable: true }) addButtonColor: string = "blue";
  @Prop({ mutable: true }) removeButtonColor: string = "blue";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;

  @State() data: Array<Record<string, string | null>> = [{}];

  columnWidth: string;

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insInputTableEl.dataset.insReset = "true";
      this.insInputTableEl.removeAttribute("data-ins-recover");
      this.insInput.emit([]);
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insInputTableEl.dataset.insRecover = "true";
      this.insInputTableEl.removeAttribute("data-ins-reset");
      this.insInput.emit(await this.getValue());
    }
  }

  componentWillLoad() {
    if (typeof this.tableHeaders === "string") {
      try {
        this.tableHeaders = JSON.parse(this.tableHeaders);
      } catch {}
    }
  }

  componentDidLoad() {
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insInputTableEl);
    }

    this.updateColumnWidth();
  }

  componentDidUpdate() {
    this.updateColumnWidth();
  }

  updateColumnWidth() {
    this.columnWidth = !this.readonly && !this.disabled ?
      `width: calc(${100 / (this.tableHeaders.length)}% - ${80 / (this.tableHeaders.length)}px)` :
      `width: ${100 / (this.tableHeaders.length)}%`;
    const els = this.insInputTableEl.querySelectorAll('.ins-input-table_column');

    for (const key in els) {
      const el = els[key];
      if (el && el.setAttribute) el.setAttribute("style", this.columnWidth);
    }
  }

  @Method()
  async setValue(value: Array<Record<string, string | null>>) {
    this.data = value;
    return await value;
  }

  @Method()
  async getValue() {
    let values = this.data;
    if (this.blankValues) values = this.fixBlankValues(values);
    return await values;
  }

  inputHander(event) {
    let childEl = event.target;
    let childIndex = 0;

    if (childEl.parentNode.previousSibling) {
      childEl = childEl.parentNode;
      do {
        childEl = childEl.previousSibling;
        childIndex++;
      } while (childEl.previousSibling);
    } else {
      childIndex = 0;
    }

    let parentEl = event.target.parentNode.parentNode;
    let parentIndex = 0;

    if (parentEl.previousSibling) {
      do {
        parentEl = parentEl.previousSibling;
        parentIndex++;
      } while (parentEl.previousSibling);
    } else {
      parentIndex = 0;
    }

    this.data[parentIndex][this.tableHeaders[childIndex].name] = event.target.value;

    let values = this.data;
    if (this.blankValues) values = this.fixBlankValues(values);
    this.insInput.emit(values);
  }

  fixBlankValues(values: Array<Record<string, string | null>>) {
    let nullValue = true;
    for (const value of values) {
      for (const key in Object.keys(value)) {
        const item = value[Object.keys(value)[key]];
        if (item) nullValue = false;
      }
    }

    return nullValue ? [] : values;
  }

  @Listen('insClick')
  insClickHander(event) {
    let action = "remove";
    if (!event.target.previousSibling) action = "add";

    let parentEl = event.target.parentNode.parentNode;
    let parentIndex = 0;

    if (parentEl.previousSibling) {
      do {
        parentEl = parentEl.previousSibling;
        parentIndex++;
      } while (parentEl.previousSibling);
    } else {
      parentIndex = 0;
    }

    let updatedData = JSON.parse(JSON.stringify(this.data));

    if (action === "remove") {
      updatedData.splice(parentIndex, 1);
      if (!updatedData.length) updatedData = [this.emptyValue()];
    } else {
      if (parentIndex === updatedData.length) {
        updatedData.push(this.emptyValue());
      } else {
        updatedData.splice(parentIndex + 1, 0, this.emptyValue());
      }
    }

    this.data = updatedData;
    let values = this.data;
    if (this.blankValues) values = this.fixBlankValues(values);
    this.insInput.emit(values);
  }

  updateValue(els) {
    const inputEls = [];

    for (const key in els) {
      const el = els[key];
      if (typeof el === "object") inputEls.push(el);
    }

    if (els.length) {
      let counter = 0;
      for (const item of this.data) {
        for (const header of this.tableHeaders) {
          els[counter].value = item[header.name];
          els[counter].parentNode.classList.remove('is-invalid');

          if (this.hasError && !item[header.name]) els[counter].parentNode.classList.add('is-invalid');
          counter++;
        }
      }
    }
  }

  emptyValue() {
    let empty = {};

    for (const header of this.tableHeaders) {
      empty[header.name] = null;
    }

    return empty;
  }

  componentDidRender() {
    for (const key in this.data) {
      if (!Object.keys(this.data[key]).length) this.data[key] = this.emptyValue();
    }

    this.updateValue(this.insInputTableEl.querySelectorAll('input'));
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
      <div class={`ins-input-table ${this.hasError ? 'has-error' : ''}`}>
        <div class="ins-input-table_label">
          {this.label}
          {this.tooltip
            ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
            : ''
          }
        </div>
        <div class="ins-input-table_header">
          {
            this.tableHeaders.map((item) => {
              return (
                <div class="table-header ins-input-table_column">{ item.label }</div>
              )
            })
          }
        </div>
        <div>
          {
            this.data.map((item) => {
              return (
                <div class="ins-input-table_row">
                  {
                    this.tableHeaders.map((header, index) => {
                      return (
                        <div class={`ins-input-table_column ins-form-field-wrap`}>
                          <label class="ins-form-label">{header.label}</label>
                          <input
                            class="ins-form-field"
                            key={index}
                            value={item[header.name]}
                            disabled={this.disabled}
                            readonly={this.readonly}
                            onInput={e => this.inputHander(e)}>
                          </input>
                        </div>
                      )
                    })
                  }
                  {
                    !this.readonly && !this.disabled ?
                    <div class="ins-input-table_buttons">
                      <ins-button
                        type="button"
                        icon={this.addButtonIcon}
                        color={this.addButtonColor}
                        label="">
                      </ins-button>
                      <ins-button
                        type="button"
                        icon={this.removeButtonIcon}
                        color={this.removeButtonColor}
                        label="">
                      </ins-button>
                    </div> : ''
                  }
                </div>
              )
            })
          }
        </div>

        { this.hasError ?
          <div class="ins-form-error">
            { this.errorMessage }
          </div>
        : ''}

        { this.description ? this.htmlDescription ?
          <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
        : ''}
      </div>
    );
  }
}
