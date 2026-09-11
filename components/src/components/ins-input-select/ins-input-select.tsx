import { h, Component, Prop, Element, Method, Listen, Event, EventEmitter } from "@stencil/core";

@Component({
    tag: 'ins-input-select'
})

export class InsInputSelect {
    @Element() insInputSelectEl: HTMLElement;
    @Event() insChange: EventEmitter;
    @Event() insOptionSelect: EventEmitter;

    // Dynamic Events
    @Event() insDynamicSubmit: EventEmitter;
    @Event() insSearch: EventEmitter;
    @Event() insLoadMore: EventEmitter;

    // Lifecycle
    @Event() didLoad: EventEmitter;
    @Prop() hasLoad: string;

    activated: boolean = false; options: Array<{ el: HTMLInsInputSelectOptionElement; label: string; value: string; activated: boolean; hidden: boolean }> = [];
    labelOfValue = "";
    inputValueEl; inputSearchEl: HTMLInputElement; optionsWrapEl: HTMLElement; mainWrapEl: HTMLElement;

    // Input Controllers
    @Prop({ mutable: true }) name: string;
    @Prop({ mutable: true }) label: string;
    @Prop({ mutable: true }) value: any;
    @Prop({ mutable: true }) placeholder: string = "";
    @Prop({ mutable: true }) disabled: boolean = false;
    @Prop({ mutable: true }) readonly: boolean = false;
    @Prop({ mutable: true }) hasError: boolean = false;
    @Prop({ mutable: true }) errorMessage: string = "";
    @Prop({ mutable: true }) tooltip: string = "";
    @Prop({ mutable: true }) blankLabel: boolean = false;
    @Prop({ mutable: true }) labelKey: string = "";
    @Prop({ mutable: true }) valueKey: string = "";
    @Prop({ mutable: true }) optionsData: Array<any> = [];
    @Prop({ mutable: true }) load: boolean = false;
    @Prop({ mutable: true }) checkLoad: boolean = false;
    @Prop({mutable: true}) description: string = "";
    @Prop({mutable: true}) htmlDescription: boolean = false;

    // Multiple Mode
    @Prop({mutable: true}) multiple: boolean = false;

    // Searchable Controllers
    @Prop({ mutable: true }) searchable: boolean = false;
    @Prop({ mutable: true }) searchablePlaceholder: string = "Type here to search for options";

    // Dynamic Controllers
    @Prop({ mutable: true }) dynamicOption: boolean = false;
    @Prop({ mutable: true }) dynamicHasError: boolean = false;
    @Prop({ mutable: true }) dynamicErrorMessage: string = "";
    @Prop({ mutable: true }) dynamicPlaceholder: string;
    @Prop({ mutable: true }) dynamicButtonLabel: string = "Add";
    @Prop({ mutable: true }) dynamicValue: string = "";

    // Lookup Controllers
    @Prop({ mutable: true }) lookup: boolean = false;
    @Prop({ mutable: true }) lookupLoading: boolean = false;
    @Prop({ mutable: true }) lookupScrolling: boolean = false;

    // Mutable Controllers
    @Prop({ mutable: true }) dropUp: boolean = false
    @Prop({ mutable: true }) selectedValues: any = [];
    dynamicInputEl: HTMLInputElement; scrollWrapEl: HTMLElement;
    loading: boolean = false;
    searching: boolean = false;

    @Prop({ mutable: true }) checkValue: boolean = false;
    @Method()
    async insReset() {
      if (this.checkValue) {
        this.insInputSelectEl.dataset.insReset = "true";
        this.insInputSelectEl.removeAttribute("data-ins-recover");
        this.insChange.emit(this.multiple ? [] : null);
      }
    }

    @Method()
    async insRecover() {
      if (this.checkValue) {
        this.insInputSelectEl.dataset.insRecover = "true";
        this.insInputSelectEl.removeAttribute("data-ins-reset");
        this.insChange.emit(await this.getValue());
      }
    }

    @Method()
    async setValue(value?) {
        if (!this.options.length) return false;

        if (this.multiple) {
            this.setMultipleValue(value);
        } else { this.setSelected(value); }
        return undefined;
    }

    @Method()
    async resetValue() {
        this.loopThroughOptions(option => {
            if (this.multiple) {
                this.value = [];
            } else { this.value = "" }
            this.labelOfValue = "";
            option.activated = false;
            this.deactivateOption(option);
            this.showOption(option);
            this.checkForOptions();
        }, this.options);
    }

    @Method()
    async getValue() {
        if (this.multiple) {
            return this.value.map(el => {
                return el.value
            });
        } else {
            return this.value;
        }
    }

    @Listen('insInputSelectOptionClicked')
    InsInputSelectOptionClickedHandler(event: CustomEvent) {
        let clickedOption = event.target as any;

        if (this.multiple) this.multipleInputHandler(clickedOption);
        else { this.singleInputHandler(clickedOption, event.detail); }
    }

    setMultipleValue(val){
        let values = [], selections = []
        val = this.isArray(val, true);

        this.loopThroughOptions(option => {
            option.activated = false;
            this.deactivateOption(option);
            if (val.includes(option.value)){
                option.activated = true;
                this.activateOption(option);
                values.push(option.value);
                selections.push(option);
            }
        }, this.options);

        this.value = selections;
        this.selectedValues = values;
    }

    multipleInputHandler(clickedOption) {
        let checkSelections = this.value.find(el => {
            return el === clickedOption
        });

        if (!checkSelections) {
            clickedOption.activated = true;
            this.value.push(clickedOption);
            this.emitEvent('add');
        }
    }

    scrollHandler = () => {
        let target = this.scrollWrapEl.scrollHeight - 200;
        let pos = this.scrollWrapEl.scrollTop + this.scrollWrapEl.clientHeight;

        if (pos >= target && !this.loading){
            this.insLoadMore.emit();
            this.loading = true;
            this.setLoadingState(true);
            this.disableNoResult();
        }
    }

    initLookupScrolling() {
        let action = this.lookupScrolling ? "add" : "remove";
        this.scrollWrapEl = this.searchEl(".scroll-wrap");
        this.scrollWrapEl[`${action}EventListener`]('scroll', this.scrollHandler);
    }

    @Method()
    async setLoadingState(state: boolean){
        this.loading = state;
        if (this.optionsWrapEl){
            this.optionsWrapEl.classList[state? 'add':'remove']('loading');
        } else return false
        return undefined;
    }

    singleInputHandler(clickedOption, e) {
        this.loopThroughOptions(option => {
            option.activated = false;
            option.showOption();
        });

        clickedOption.activated = true;
        if (this.searchable) {
            this.resetSearch();
        }
        this.closeOptions();
        this.showHiddenOptions();
        this.labelOfValue = e.label;
        this.insChange.emit(e.value);
        this.value = e.value;
    }

    showHiddenOptions() {
        this.optionsWrapEl.classList.remove('no-result');
        this.loopThroughOptions(option => {
            this.showOption(option);
        }, this.options);
    }

    loopThroughOptions(cb, opts?){
        let options = opts || this.insInputSelectEl.querySelectorAll('ins-input-select-option');
        for (let i = 0; i < options.length; i++){
          if (cb(options[i])) break;
        }
    }

    expandSection() {
        if (!this.readonly && !this.disabled && !this.lookupLoading && !this.activated) {
            this.checkDropUp();
            this.activated = true;
            this.mainWrapEl.classList.add("activated");

            if (this.searchable) {
                this.inputSearchEl.focus();
            }
        }
    }

    searchEl(selector: string) {
        return this.insInputSelectEl.querySelector(selector) as any;
    }

    resetSearch() {
        this.inputSearchEl.value = "";
        this.staticSearch("");
    }

    bindEls() {
        this.mainWrapEl = this.searchEl('.ins-select-wrap');
        this.inputValueEl = this.searchEl('.ins-select-value-input');
        this.optionsWrapEl = this.searchEl('.ins-select-options-wrap');
        if (this.searchable) {
            this.inputSearchEl = this.searchEl('.ins-select-search-input');
        }
    }

    @Method()
    async getAllOptions(){
        return this.insInputSelectEl.querySelectorAll('ins-input-select-option');
    }

    async initOptions() {
        let options = this.insInputSelectEl.querySelectorAll('ins-input-select-option');

        this.loopThroughOptions(option => {
            this.options.push({
                el: option,
                label: option.label,
                value: option.value,
                activated: false,
                hidden: false
            });
        }, options);

        this.checkForOptions();
    }

    async checkForOptions() {
        if (!this.options.length) {
            this.mainWrapEl.classList.add("no-options");
            return false;
        }

        let hasOption = false;
        this.loopThroughOptions(option => {
            if (!option.el.activated && !option.el.hidden) {
                hasOption = true;
                return true;
            }
            return undefined;
        }, this.options);

        let action = hasOption ? "remove" : "add";
        this.mainWrapEl.classList[action]("no-options");
        return hasOption;
    }

    initOutsideClick() {
        window.addEventListener('click', event => {
            let clickedEl = event.target as HTMLElement;
            let closestEl = clickedEl.closest('ins-input-select');

            if (closestEl !== this.insInputSelectEl){
                if (this.activated) {
                    this.closeOptions();
                }
            }
        });
    }

    initSearchInput() {
        if (this.searchable && this.inputSearchEl) {
            this.inputSearchEl.addEventListener('keyup', e => {
                this.searchOptions(e);
            });
        }
    }

    initDynamicOption() {
        if (!this.dynamicOption) return false;
        this.dynamicInputEl = this.searchEl('input[data-dynamic]');
        return undefined;
    }

    @Method()
    async disableNoResult() {
        if (this.optionsWrapEl) {
            this.optionsWrapEl.classList.remove('no-result');
        } else return false
        return undefined;
    }

    searchOptions(event) {
        let keyword = event.target.value;
        this.disableNoResult();
        if (!this.activated) this.expandSection();

        if (this.lookup) {
            this.lookupHandler(keyword, event);
        } else this.staticSearch(keyword);
    }

    lookupHandler(keyword, event) {
        if (event.which === 13 && !this.searching && !this.loading) {
            this.setSearchingState(true);
            this.disableNoResult();
            this.insSearch.emit(keyword);
        } else if (!this.searching && !this.loading) {
            this.staticSearch(keyword);
        }
    }

    @Method()
    async setSearchingState(state: boolean){
        this.searching = state;
        this.inputValueEl.readonly = state;
        if (this.optionsWrapEl){
            this.optionsWrapEl.classList[state? 'add' : 'remove']('searching');
        } else return false
        return undefined;
    }

    staticSearch(keyword: string) {
        if (!keyword) {
            this.showHiddenOptions();
            return this.checkForOptions();
        }

        let hasResult = false;
        this.loopThroughOptions(option => {
            this.hideOption(option);
            let result = option.label.toLowerCase().indexOf(keyword.toLowerCase());

            if (result >= 0 && option.value !== this.value) {
                this.showOption(option);
                hasResult = true;
            }
        }, this.options);

        if (!hasResult) this.enableNoResult();
        else this.checkForOptions();
        return undefined;
    }

    @Method()
    async enableNoResult(){
        if (this.optionsWrapEl){
            this.optionsWrapEl.classList.add('no-result');
        } else return false
        return undefined;
    }

    renderCaret() {
        return (<i class="icon-caret-down"></i>);
    }

    renderCloseBtnWrap() {
        return (
            <div class="done-wrap" onClick={() => this.closeOptions()}>
                Close Options
            </div>
        )
    }

    renderLabelWrap() {
        return (
            <label class="ins-select-label-wrap">
                {this.label}

                {this.tooltip
                    ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
                    : ''
                }
            </label>
        )
    }

    renderOptionsWrap() {
        return (

            <div class={`ins-select-options-wrap
                ${this.dynamicOption ? 'with-dynamic-option' : ''}`}>

                { this.searchable ?
                    <div class="ins-select-search">
                        <input class="ins-select-search-input" placeholder={this.searchablePlaceholder} />
                        <i class="icon-search"></i>
                    </div>
                    : '' }
                { this.renderCloseBtnWrap() }

                <div class="scroll-wrap">
                    <div class="no-result-text">No result found</div>
                    <div class="no-more-options">No options available</div>

                    <div class="ins-select-slot-wrap">
                        <slot />

                        {this.labelKey && this.valueKey
                          ? this.optionsData.map(option => {
                              return (
                                <ins-input-select-option
                                  label={option[this.labelKey]}
                                  value={option[this.valueKey]}>
                                </ins-input-select-option>
                              )
                            })
                          : ''
                        }
                    </div>

                    <div class="spinner-wrap">
                    <div class="spinner"></div>
                    </div>
                </div>

                { this.renderDynamicOptionWrap() }
            </div>
        )
    }

    renderDynamicOptionWrap(){
        if (!this.dynamicOption) return "";
        return (
            <div class="dynamic-option-wrap">
                <div class="dynamic-option-input-wrap">
                    <input class={this.dynamicHasError ? "invalid" : ""}
                        onKeyUp={e => this.keyUpDynamicInput(e)}
                        placeholder={this.dynamicPlaceholder} data-dynamic />

                    { this.dynamicHasError ?
                        <div class="error-message">
                            { this.dynamicErrorMessage }
                        </div>
                    : "" }
                </div>
                <button type="button" onClick={e => this.dynamicOptionHandler(e)}>
                    {this.dynamicButtonLabel}
                </button>
            </div>
        );
    }

    @Method()
    async dynamicCloseOptions() {
        this.dynamicInputEl.value = "";
        this.dynamicHasError = false;
        this.closeOptions();
    }

    @Method()
    async dynamicUpdateOptions() {
        this.initOptions();
    }

    keyUpDynamicInput(e: KeyboardEvent) {
        this.dynamicValue = (e.target as HTMLInputElement).value;
    }

    dynamicOptionHandler(e: MouseEvent) {
        e.stopPropagation();
        this.insDynamicSubmit.emit(this.dynamicInputEl.value);
    }

    renderValueWrap() {
        if (this.multiple) return this.renderMultipleValueWrap();
        else { return this.renderSingleValueWrap(); }
    }

    renderMultipleValueWrap(){
        return (
            <div class={`ins-select-value-wrap multiple
                ${this.value.length ? "has-value": ""}`}
                onClick={() => this.expandSection()}>
                <input class="ins-select-value-input" placeholder={this.placeholder}></input>
                { this.renderCaret() }
                { this.renderSelections() }
            </div>
        )
    }

    renderSelections() {
        if (!this.value.length && this.searchable) return "";
        if (this.value.length) return (
            <div class="multiple-item">
                { this.value.map(item => this.renderItem(item)) }
            </div>
        );

        return (
            <div class="multiple-placeholder">
                { this.placeholder ? this.placeholder : "Select" }
            </div>
        )
    }

    renderItem(item){
        return (
            <div class="multiple-item-wrap">
                <span>{item.label}</span>
                <span class="icon-close"
                    onClick={() => this.removeItem(item)}>
                </span>
            </div>
        )
    }

    removeItem(option){
      if (!this.disabled && !this.readonly){
        let i = this.value.findIndex(el => {
          return el === option
        });

        if (i > -1) {
            this.value[i].activated = false;
            this.value[i].el ? this.value[i].el.deactivate() : this.value[i].deactivate();
            this.value.splice(i, 1);

            this.emitEvent('remove');
        }
      }
    }

    emitEvent(type: 'add' | 'remove'){
        if (this.multiple) {
            this.emitForMultiple(type);
        } else this.insChange.emit(this.value);
    }

    emitForMultiple(event_type: string){
        let selected = this.value.map(item => item.value);
        let selectedOptions = this.value.map(item => {
          return {
            label: item.label,
            value: item.value
          }
        });

        this.insOptionSelect.emit({
          event_type, selected, selectedOptions
        });

        this.insChange.emit(selected);
        this.selectedValues = selected;
    }

    renderSingleValueWrap() {
        return (
            <div class="ins-select-value-wrap"
                onClick={() => this.expandSection()}>
                    { this.renderCaret() }

                    <input class={`ins-select-value-input ${this.value ? 'has-value' : ''}`} value={this.blankLabel && !this.value ? "" : this.labelOfValue}
                        readonly placeholder={this.placeholder} disabled={this.disabled} />
            </div>
        )
    }

    renderHiddenFields() {
        return (
            <input type ="hidden"
                name={this.name}
                value={this.value} />
        )
    }

    renderErrorWrap() {
        if (!this.hasError) return "";
        return (
            <div class="ins-form-error">
                {this.errorMessage}
            </div>
        )
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

    renderDescriptionWrap() {
      return (
        this.description ? this.htmlDescription ?
          <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
        : ''
      )
    }

    activateOption(option) {
        option.el.activated = true;
    }

    deactivateOption(option) {
        option.el.activated = false;
    }

    hideOption(option) {
        option.el.hidden = true;
    }

    showOption(option) {
        option.el.hidden = false;
    }

    setSelected(value: string) {
        this.loopThroughOptions(option => {
            option.activated = false;
            this.deactivateOption(option);
            if (value === option.value) {
                this.value = option.value;
                this.labelOfValue = this.blankLabel && !option.value ? "" : option.label;
                this.activateOption(option);
                this.updateValueEls(option);
                this.checkForOptions();
            }
        }, this.options);
    }

    updateValueEls(option){
        this.inputValueEl.value = this.blankLabel && !option.value ? "" : option.label;
    }

    isArray(value, isObject = false) {
        try {
            if (isObject) {
                if (value.length !== undefined) {
                    return value;
                } else { return []; }
            } else {
                if (JSON.parse(value).length !== undefined) {
                    return JSON.parse(value);
                } else { return []; }
            }
        } catch(err) { return []; }
    }

    checkDropUp() {
        let pos = this.insInputSelectEl.getBoundingClientRect();
        let height = 110;

        // if (this.value) height = height + 45;
        if (this.options.length) {
            let len = 0;
            this.options.map(item => {
                if (!item.el.activated) len++;
            });
            len = len > 3 ? 3 : !len ? 1 : len;
            height = height + (len * 45)
        }
        if (this.dynamicOption) height = height + 70;

        if (this.searchable) {
          height = height + 100;
        } else if (!this.searchable) {
          height = height + 45;
        }

        this.dropUp = (window.innerHeight - pos.bottom) < height;
    }

    componentWillLoad(){
        if (this.multiple && !this.value) {
            this.value = [];
        } else if (typeof this.value === 'string' && this.multiple){
            this.value = this.isArray(this.value)
        } else if (!this.multiple && !this.value) {
			this.value = "";
		}

        if (!this.placeholder && this.searchable){
            this.placeholder = "Please select or type to search for an option";
        }
    }

    componentDidLoad() {
        this.bindEls();
        this.initOutsideClick();
        this.initSearchInput();
        this.initDynamicOption();
        this.initLookupScrolling();
        this.initOptions();
        this.setValue(this.value);

        if (this.checkLoad) this.load = true;
        this.didLoad.emit();
        this.checkDropUp();

        if (this.hasLoad && window["Insites"]){
            let func = window["Insites"].methods[this.hasLoad];
            if (func) func(this.insInputSelectEl);
        }
    }

    componentDidUpdate() {
        this.bindEls();
        this.initSearchInput();
        this.initDynamicOption();
        this.initLookupScrolling();
        this.checkForOptions();
    }

    @Method()
    async closeOptions() {
        this.activated = false;
        this.mainWrapEl.classList.remove("activated");
    }

    render() {
        return (
          <div class="ins-input-select-wrap">
            <div class={`ins-input-select ins-select-wrap
                ${this.value ? 'has-value' : ''}
                ${this.searchable ? 'searchable' : ''}
                ${this.dropUp ? 'drop-up' : ''}
                ${this.readonly ? 'readonly' : ''}
                ${this.disabled ? 'disabled' : ''}
                ${this.hasError ? 'is-invalid' : ''}
                ${this.lookupLoading ? 'initializing' : ''}`}>

                { this.renderHiddenFields() }
                { this.renderLabelWrap() }
                { this.renderValueWrap() }
                { this.renderErrorWrap() }
                { this.renderOptionsWrap() }

                <div class="main-spinner-wrap">
                    <div class="spinner"></div>
                </div>
            </div>
            { this.renderDescriptionWrap() }
          </div>
        );
    }
}