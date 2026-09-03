import { h, Component, Prop, Element, Listen, Method, Watch, Event, EventEmitter } from "@stencil/core";

@Component({
    tag: 'ins-input-search'
})

export class InsInputSearch {
  @Element() insInputSearchEl: HTMLElement;
  @Event() insInput: EventEmitter;
  @Event() insOptionSelect: EventEmitter;

  // Dynamic Events
  @Event() insSearch: EventEmitter;

  // Lifecycle
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  // Input Controllers
  @Prop({ mutable: true }) name: string;
  @Prop({ mutable: true }) label: string;
  @Prop({ mutable: true }) value: any;
  @Prop({ mutable: true }) searchValue: string = "";
  @Prop({ mutable: true }) placeholder: string = "";
  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) loading: boolean = false;
  @Prop({ mutable: true }) readonly: boolean = false;
  @Prop({ mutable: true }) hasError: boolean = false;
  @Prop({ mutable: true }) errorMessage: string = "";
  @Prop({ mutable: true }) tooltip: string = "";
  @Prop({ mutable: true }) description: string = "";
  @Prop({ mutable: true }) htmlDescription: boolean = false;
  @Prop({ mutable: true }) multiple: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({ mutable: true }) checkValue: boolean = false;
  @Prop({ mutable: true }) optionsData: any = [];
  @Prop({ mutable: true }) dropUp: boolean = false;
  @Prop({ mutable: true }) blankSearch: boolean = false;
  @Prop({ mutable: true }) icon: string = "icon-search-1";
  @Prop({ mutable: true }) noResults: boolean = false;
  @Prop({ mutable: true }) noResultsText: string = 'No results found.';
  @Prop({ mutable: true }) loadingText: string = 'Searching...';
  @Prop({ mutable: true }) addPx: number = 35;

  activated = false;
  empty = true;
  mainWrapEl: HTMLElement;
  searchClicked = false;
  optionClicked = false;
  clearClicked = false;

  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insInputSearchEl.dataset.insReset = "true";
      this.insInputSearchEl.removeAttribute("data-ins-recover");
      this.insInput.emit(this.multiple ? [] : null);
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insInputSearchEl.dataset.insRecover = "true";
      this.insInputSearchEl.removeAttribute("data-ins-reset");
      this.insInput.emit(await this.getValue());
    }
  }

  @Method()
  async setValue(value) {
    if (this.multiple) {
      if (value?.length && typeof value === 'object') {
        this.value = [];
        for (const item of value) {
          if (item.value) {
            if (!item.label) item.label = item.value;
            this.value.push(item);
          }
        }
      } else {
        this.value = [];
      }
    } else {
      this.value = value?.value ? value : null;
      let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;
      searchInput.value = value?.label || value?.value || "";
      this.searchValue = searchInput.value;
    }
  }

  @Method()
  async resetValue() {
    if (this.multiple) {
      this.value = [];
      this.insInput.emit([]);
    } else {
      this.value = null;
      this.insInput.emit(null);
      let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;
      searchInput.value = "";
    }
  }

  @Method()
  async getValue() {
    return this.value;
  }

  async closeSearchResults() {
    this.mainWrapEl.classList.remove("activated");
    this.clearSearchResults();
  }

  initOutsideClick() {
    window.addEventListener('click', event => {
      let clickedEl = event.target as HTMLElement;
      let closestEl = clickedEl.closest('ins-input-search');

      if (closestEl !== this.insInputSearchEl) {
        let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;

        if (this.mainWrapEl.className.indexOf('activated') !== -1) this.closeSearchResults();
        if (this.mainWrapEl.className.indexOf('active') !== -1) {
          this.mainWrapEl.classList.remove("active");
          searchInput.value = this.value?.label || this.value?.value || "";
        }

        if (this.multiple || !this.value) this.searchValue = "";

        this.loading = false;
        if (!searchInput.value) this.noResults = false;
      }
    });
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

	onfocusHandler() {
		if (!this.readonly && !this.disabled) {
      this.insInputSearchEl.querySelector('.ins-input-search').classList.add('active');

      if (!this.multiple) {
        let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;
        searchInput.value = "";
        this.searchValue = null;
      }
    }
	}

	onblurHandler() {
    if (!this.searchClicked && !this.optionClicked && !this.clearClicked) {
      let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;
      this.insInputSearchEl.querySelector('.ins-input-search').classList.remove('active');

      if (!this.multiple) {
        searchInput.value = this.value?.label ? this.value?.label : null;
        this.searchValue = searchInput.value;
      } else {
        searchInput.value = null;
      }
    }

    this.searchClicked = false;
    if (this.multiple) this.optionClicked = false;
    this.clearClicked = false;
	}

	oninputHandler(event) {
    if (this.disabled || this.readonly) return;

    let eventValue = event.target.value;

		if (event.keyCode === 13) {
      // this.dropUp = false;
      this.clearSearchResults();
      this.checkDropUp();
      if ((eventValue.trim() && !this.readonly) || (this.blankSearch && !this.readonly)) {
        setTimeout(() => {
          this.insInputSearchEl.querySelector('input').focus();
          this.insSearch.emit({
            value: eventValue.trim()
          });
        }, 100);
        this.empty = false;
        this.mainWrapEl.classList.add('activated');
      } else {
        this.mainWrapEl.classList.remove('activated');
      }

      if (!this.multiple) this.value = null;
		} else {
      this.searchValue = event.target.value;
    }
  }

  onclearSearch() {
    this.clearClicked = true;

    let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;
    searchInput.value = "";
    this.searchValue = "";

    if (!this.multiple) {
      this.value = null;
      this.insInput.emit(null);
    }

    this.clearSearchResults();

    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }

  onclickSearch() {
    let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;

    this.oninputHandler({
      target: {
        value: searchInput.value
      },
      keyCode: 13
    });

    this.searchClicked = true;
  }

  clearSearchResults() {
    this.empty = true;
    this.noResults = false;
    this.optionsData = [];
  }

  renderSearchResults() {
    const options = [];

    for (let option of this.optionsData) {
      if (this.multiple) {
        let values = this.value.map(item => item.value)
        if (values.indexOf(option.value) === -1) options.push(option);
      } else {
        options.push(option);
      }
    }

    // if (!options.length) {
    //   this.insInputSearchEl.querySelector('.ins-input-search').classList.remove('drop-up');
    //   this.insInputSearchEl.querySelector('.ins-input-search .ins-input-search-text').removeAttribute('style');
    // }

    return (
      <div class={`ins-input-search-options-wrap ${options.length ? 'has-options' : 'no-options'} ${this.multiple && this.value.length ? 'has-multiple-value' : ''}`}>

        {this.loading ? <div class="loading-searching">{this.loadingText}</div> : ''}
        {this.noResults && !this.loading ? <div class="no-results-found">{this.noResultsText}</div> : ''}

        <div class="scroll-wrap">
          <div class="ins-input-search-slot-wrap">
            { options.map(option => {
              return (
                <ins-input-search-option
                  activated={!this.multiple && this.value?.value === option.value}
                  label={option.label}
                  value={option.value}>
                </ins-input-search-option>
              )
            }) }
          </div>
        </div>
      </div>
    )
  }

  renderMultipleValues() {
    return (
      <div class={`ins-input-search-value ${this.value.length ? 'has-value' : ''}`}>
        { this.value.map(item =>
            <div class="input-search-items-wrap">
              <span>{item.label}</span>
              <span class="icon-close" onMouseDown={() => this.removeItem(item)}></span>
            </div>
          )
        }
      </div>
    )
  }

  removeItem(item) {
    if (this.disabled || this.readonly) return;
    const val = [];

    for (const _item of this.value) {
      if (_item.value !== item.value) val.push(_item);
    }

    this.value = [];
    this.value = val;
    this.insInput.emit(val);
    this.resetOptions();
    this.searchClicked = true;
  }

  activate() {
    if (this.multiple && !this.readonly && !this.disabled) {
      this.insInputSearchEl.querySelector('.ins-input-search').classList.add('active');
      let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;
      searchInput.focus();

      if (this.value.length) this.checkDropUp();
    }
  }

  checkDropUp() {
    let pos = this.insInputSearchEl.getBoundingClientRect();
    let height = 65;

    if (this.value) height = height + 45;
    if (this.optionsData.length) {
      let len = this.optionsData.length;
      len = len > 3 ? 3 : !len ? 1 : len;
      height = height + (len * 45)
    }

    this.dropUp = (window.innerHeight - pos.bottom) < height;
  }

  resetOptions() {
    let opt = this.optionsData;
    this.optionsData = [];
    this.optionsData = opt;
  }

  setOptionsPosition() {
    let fieldEl = this.insInputSearchEl.querySelector('.ins-input-search .ins-input-search-text') as HTMLElement;
    let labelWrap = this.insInputSearchEl.querySelector('.ins-input-search label.ins-form-label') as HTMLElement;
    let searchOptions = this.insInputSearchEl.querySelector('.ins-input-search-options-wrap') as HTMLElement;
    let searchWrap = this.insInputSearchEl.querySelector('.ins-input-search-container') as HTMLElement;
    let searchValueWrap = this.insInputSearchEl.querySelector('.ins-input-search-value') as HTMLElement;
    let descriptionWrap = this.insInputSearchEl.querySelector('.ins-description') as HTMLElement;
    let errorWrap = this.insInputSearchEl.querySelector('.ins-input-search.has-error .error-message') as HTMLElement;
    let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text') as HTMLElement;

    if (!this.dropUp) {
      searchOptions.setAttribute('style', `top: ${(fieldEl?.offsetHeight + 6) + (labelWrap?.offsetHeight ? labelWrap?.offsetHeight + 3 : 0) + (searchValueWrap?.offsetHeight ? searchValueWrap?.offsetHeight + 6 : 0)}px`);
      if (this.multiple && this.value.length) searchInput.removeAttribute('style');
    } else {
      if (this.multiple) {
        // if (this.value.length) {
          // searchInput.setAttribute('style', `bottom: ${searchValueWrap?.offsetHeight + 7 || 0}px`);

          if (this.value.length) {
            searchOptions.setAttribute('style', `bottom: ${(fieldEl?.offsetHeight + 1) + (this.multiple && this.value.length ? searchInput?.offsetHeight : 0) + (searchValueWrap?.offsetHeight || 0) + (errorWrap?.offsetHeight ? errorWrap?.offsetHeight + 4 : 0) + (descriptionWrap?.offsetHeight + 4 || 0) - this.addPx}px`);
            searchInput.setAttribute('style', `bottom: ${searchWrap?.offsetHeight - 2 || 0}px`);
          } else {
            searchOptions.setAttribute('style', `bottom: ${(fieldEl?.offsetHeight + 1) + (this.multiple && this.value.length ? searchInput?.offsetHeight : 0) + (searchValueWrap?.offsetHeight || 0) + (errorWrap?.offsetHeight ? errorWrap?.offsetHeight + 4 : 0) + (descriptionWrap?.offsetHeight + 4 || 0)}px`);
            searchInput.removeAttribute('style');
          }

          // console.log((fieldEl?.offsetHeight + 1), (this.multiple && this.value.length ? searchInput?.offsetHeight : 0), (searchValueWrap?.offsetHeight || 0), (errorWrap?.offsetHeight ? errorWrap?.offsetHeight + 4 : 0), (descriptionWrap?.offsetHeight + 4 || 0))
        // } else {
        //   searchInput.removeAttribute('style');
        //   searchOptions.removeAttribute('style');
        // }
      } else {
        searchOptions.setAttribute('style', `bottom: ${(!this.multiple ? fieldEl?.offsetHeight + 1 : 7) + (this.multiple && this.value.length ? searchInput?.offsetHeight : 0) + (searchValueWrap?.offsetHeight || 0) + (errorWrap?.offsetHeight ? errorWrap?.offsetHeight + 4 : 0) + (descriptionWrap?.offsetHeight + 4 || 0)}px`);
      }
      // searchOptions.setAttribute('style', `bottom: ${(!this.multiple ? fieldEl?.offsetHeight + 1 : 7) + (this.multiple && this.value.length ? searchInput?.offsetHeight : 0) + (searchValueWrap?.offsetHeight || 0) + (errorWrap?.offsetHeight ? errorWrap?.offsetHeight + 4 : 0) + (descriptionWrap?.offsetHeight + 4 || 0)}px`);
      // if (this.multiple && this.value.length) searchInput.setAttribute('style', `bottom: ${searchValueWrap?.offsetHeight + 7 || 0}px`);
    }

    // if (!this.dropUp) {
    //   searchOptions.setAttribute('style', `top: ${(fieldEl?.offsetHeight + 6) + (labelWrap?.offsetHeight ? labelWrap?.offsetHeight + 3 : 0) + (searchValueWrap?.offsetHeight ? searchValueWrap?.offsetHeight + 6 : 0)}px`);
    //   if (this.multiple && this.value.length) searchInput.removeAttribute('style');
    // } else {
    //   searchOptions.setAttribute('style', `bottom: ${(fieldEl?.offsetHeight + 1) + (this.multiple && this.value.length ? searchInput?.offsetHeight : 0) + (searchValueWrap?.offsetHeight || 0) + (errorWrap?.offsetHeight ? errorWrap?.offsetHeight + 4 : 0) + (descriptionWrap?.offsetHeight + 4 || 0)}px`);
    //   // console.log((!this.multiple ? fieldEl?.offsetHeight + 1 : 7), (this.multiple && this.value.length ? searchInput?.offsetHeight : 0), (searchValueWrap?.offsetHeight || 0), (errorWrap?.offsetHeight ? errorWrap?.offsetHeight + 4 : 0), (descriptionWrap?.offsetHeight + 4 || 0));

    //   console.log(searchValueWrap?.offsetHeight)
    //   if (this.multiple && this.value.length) searchInput.setAttribute('style', `bottom: ${searchValueWrap?.offsetHeight + 7 || 0}px`);
    // }
  }

  @Listen('insInputSearchOptionClicked')
  async InsInputSelectOptionClickedHandler(event: CustomEvent) {
    if (this.multiple) {
      if (this.multiple) this.optionClicked = true;
      let val = this.value;
      val.push(event.detail);
      this.value = [];
      this.value = val;
    } else {
      let searchInput = this.insInputSearchEl.querySelector('.ins-input-search-text input') as HTMLInputElement;
      if (event.detail.value) {
        this.value = event.detail;
        searchInput.value = event.detail.label;

        const optionEls = this.insInputSearchEl.querySelectorAll('ins-input-select-option') as any;
        for (const item of optionEls) item.activated = false;
        const optionEl = event.target as HTMLInsInputSearchOptionElement;
        optionEl.activated = true;
      } else {
        this.value = null;
        searchInput.value = null;
      }

      this.searchValue = searchInput.value;
    }

    this.insInput.emit(await this.getValue());
    this.resetOptions();
    this.checkDropUp();
  }

  componentWillLoad() {
    if (this.multiple && !this.value) {
      this.value = [];
    }

    if (this.value) {
      try {
        let value;
        const parsedValue = JSON.parse(this.value);

        if (this.multiple) {
          if (parsedValue?.length && typeof parsedValue === 'object') {
            value = [];
            for (const item of parsedValue) {
              if (item.value) {
                if (!item?.label) item.label = item.value;
                value.push(item)
              }
            }
            this.value = value;
          } else {
            this.value = [];
          }
        } else {
          value = parsedValue;
          this.value = value?.value ? value : null
          this.searchValue = this.value;
        }
      } catch {}
    }
  }

  componentDidLoad() {
    this.mainWrapEl = this.insInputSearchEl.querySelector('.ins-input-search') as HTMLElement;
    this.initOutsideClick();

    if (this.value) this.setValue(this.value);
  }

  componentDidRender() {
    this.setOptionsPosition();
  }

  @Watch('loading')
  checkLoading() {
    this.dropUp = false;
    if (this.loading) {
      this.checkDropUp();
    }
  }

  @Method()
  async setOptions(value: Array<{ label: string; value: string }>) {
    this.optionsData = value;
    this.checkDropUp();
    this.noResults = false;

    if (!this.optionsData?.length) this.noResults = true;
  }

  render() {
    return (
      <div class={`ins-form-field-wrap ins-input-search
        ${this.multiple ? 'multiple-search' : ''}
        ${this.dropUp ? 'drop-up' : ''}
        ${this.disabled ? 'disabled' : ''}
        ${this.readonly ? 'readonly' : ''}
        ${this.hasError ? 'has-error' : ''}
        ${this.noResults ? 'no-results' : ''}
        ${this.loading ? 'loading' : ''}`}>

        { this.label || this.tooltip ?
          <label class="ins-form-label">
            {this.label}

            {this.tooltip
              ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
              : ''
            }
          </label> : '' }

        { this.renderSearchResults() }

        <div class={`ins-input-search-container ${this.multiple && this.value.length ? 'has-value' : ''}`} onClick={() => this.activate()}>
          { this.multiple ? this.renderMultipleValues() : '' }

          <div class="ins-input-search-text">
						<input
							type="text"
							readonly={this.readonly}
							disabled={this.disabled}
              placeholder={this.placeholder}
							onFocus={() => this.onfocusHandler()}
							onBlur={() => this.onblurHandler()}
							onKeyUp={event => this.oninputHandler(event)}>
						</input>

            {!this.readonly && !this.disabled ?
            <div class="container-icon">
              {this.searchValue && !this.loading ?
              <span
                class="clear-icon icon-close-1"
                onMouseDown={() => this.onclearSearch()}>
              </span> : ''}
              <span
                class={`search-icon ${this.icon}`}
                title="Click to search or press enter"
                onMouseDown={() => this.onclickSearch()}>
              </span>
            </div>
            : ''}

            {!this.readonly && !this.disabled ?
            <div class="spinner-wrap">
              <div class="spinner"></div>
            </div>
            : ''}

          </div>
        </div>

				<span class="error-message">
          {this.errorMessage}
        </span>

        { this.description ? this.htmlDescription ?
          <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
        : ''}
      </div>
    )
  }
}