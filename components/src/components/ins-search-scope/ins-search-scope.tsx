import { h, Component, Prop, Element, Event, EventEmitter, Method } from "@stencil/core";

interface ScopeOption {
  label: string;
  value: string;
}

@Component({
  tag: 'ins-search-scope',
  styleUrl: './ins-search-scope.scss'
})
export class InsSearchScope {
  @Element() insSearchScopeEl: HTMLElement;

  // Dynamic Events
  @Event() insSearch: EventEmitter<{ value: string; scope: string }>;
  @Event() insScopeChange: EventEmitter<{ scope: string }>;

  // Lifecycle
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) placeholder: string = "Search";
  @Prop({ mutable: true }) value: string = "";
  @Prop({ mutable: true }) scopeOptions: Array<ScopeOption> | string = [];
  @Prop({ mutable: true }) scope: string;
  @Prop({ mutable: true }) debounce: number = 300;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  inputEl: HTMLInputElement;
  debounceTimer: ReturnType<typeof setTimeout>;

  @Method()
  async clear() {
    this.cancelPendingEmit();
    this.value = "";
    if (this.inputEl) this.inputEl.value = "";
    this.emitSearch();
  }

  componentWillLoad() {
    this.parseProps();
    const options = this.getOptions();
    if (!this.scope && options.length) {
      this.scope = options[0].value;
    }
  }

  componentWillUpdate() {
    this.parseProps();
  }

  componentDidLoad() {
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]) {
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insSearchScopeEl);
    }
  }

  disconnectedCallback() {
    this.cancelPendingEmit();
  }

  parseProps() {
    if (typeof this.scopeOptions === 'string') {
      try {
        this.scopeOptions = JSON.parse(this.scopeOptions) as Array<ScopeOption>;
      } catch (e) {
        console.error("Invalid scope options for", this.insSearchScopeEl);
        this.scopeOptions = [];
      }
    }
  }

  getOptions(): Array<ScopeOption> {
    return Array.isArray(this.scopeOptions) ? this.scopeOptions : [];
  }

  cancelPendingEmit() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  emitSearch() {
    this.insSearch.emit({ value: this.value, scope: this.scope });
  }

  handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.cancelPendingEmit();
    this.debounceTimer = setTimeout(() => this.emitSearch(), this.debounce);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.cancelPendingEmit();
      this.emitSearch();
    }
  }

  handleScopeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.scope = target.value;
    this.insScopeChange.emit({ scope: this.scope });
  }

  render() {
    const options = this.getOptions();
    return (
      <div class="ins-search-scope">
        <span class="ins-search-scope-icon icon-search" aria-hidden="true"></span>
        <input
          class="ins-search-scope-input"
          type="search"
          placeholder={this.placeholder}
          value={this.value}
          aria-label={this.placeholder}
          onInput={this.handleInput}
          onKeyDown={this.handleKeyDown}
          ref={(el: HTMLInputElement) => this.inputEl = el}
        />
        {options.length > 0 &&
          <div class="ins-search-scope-select-wrap">
            <select
              class="ins-search-scope-select"
              aria-label="Search in"
              onChange={this.handleScopeChange}
            >
              {options.map((option) =>
                <option value={option.value} selected={option.value === this.scope}>
                  {option.label}
                </option>
              )}
            </select>
          </div>
        }
      </div>
    );
  }
}
