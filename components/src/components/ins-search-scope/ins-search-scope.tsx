import { h, Component, Prop, State, Element, Event, EventEmitter, Method, Listen, Watch } from "@stencil/core";

// exported: a type used in a @Prop signature lands in the generated components.d.ts, which must be able to import it
export interface ScopeOption {
  label: string;
  value: string;
}

let searchScopeIds = 0;

/**
 * The IIA v6 record-page search pill with a field-scope dropdown.
 * Ported from module-v6-crm Companies/sections/Contacts/Contacts.vue (design: CRM Company v1.0, Contacts tab header).
 *
 * Markup mirrors the design so the shared record-page CSS (.crm-search, .crm-sbprefix, button[data-tip]) lands on it:
 *   label.crm-search > span (trigger + role=menu) + input[type=search] + clear button + submit button
 * The search only applies on submit (Enter or the search button), matching v5 and the design prototype.
 * Set `debounce` above 0 to opt in to a live insSearch while typing.
 */
@Component({
  tag: 'ins-search-scope',
  styleUrl: './ins-search-scope.scss'
})
export class InsSearchScope {
  @Element() insSearchScopeEl: HTMLElement;

  // Dynamic Events
  @Event() insSearch: EventEmitter<{ value: string; scope: string }>;
  @Event() insInput: EventEmitter<{ value: string; scope: string }>;
  @Event() insScopeChange: EventEmitter<{ scope: string; label: string }>;
  @Event() insClear: EventEmitter<{ scope: string }>;
  @Event() insOpenChange: EventEmitter<{ open: boolean }>;

  // Lifecycle
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) placeholder: string = "Search";
  @Prop({ mutable: true }) value: string = "";
  @Prop({ mutable: true }) scopeOptions: Array<ScopeOption | string> | string = [];
  @Prop({ mutable: true }) scope: string;
  @Prop({ mutable: true }) scopePrefix: string = "Search by:";
  @Prop({ mutable: true }) menuLabel: string = "Search field";
  @Prop({ mutable: true }) searchLabel: string = "Search";
  @Prop({ mutable: true }) clearLabel: string = "Clear search";
  @Prop({ mutable: true }) loading: boolean = false;
  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) debounce: number = 0;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @State() open: boolean = false;

  inputEl: HTMLInputElement;
  debounceTimer: ReturnType<typeof setTimeout>;
  // the last value handed to insSearch; clearing or re-scoping only re-runs the search when one is active (Contacts.vue clearSearch / selectSearchBy)
  submittedValue: string = "";
  private instanceId: number = ++searchScopeIds;
  private menuId: string = `ins-search-scope-menu-${this.instanceId}`;
  // the label points at the input, so a click on empty pill space focuses the text box rather than the trigger button
  private inputId: string = `ins-search-scope-input-${this.instanceId}`;
  private focusOptionOnRender: boolean = false;

  private documentClickHandler = (event: MouseEvent): void => {
    const target = event.target as Node;
    if (!this.insSearchScopeEl.contains(target)) this.setOpen(false);
  };

  @Method()
  async clear() {
    this.cancelPendingEmit();
    this.value = "";
    if (this.inputEl) this.inputEl.value = "";
    this.insClear.emit({ scope: this.scope });
    if (this.submittedValue) this.emitSearch();
  }

  @Method()
  async closeMenu(): Promise<void> {
    this.setOpen(false);
  }

  @Method()
  async focusInput(): Promise<void> {
    if (this.inputEl) this.inputEl.focus();
  }

  componentWillLoad() {
    this.parseProps();
    const options = this.getOptions();
    if (!this.scope && options.length) {
      this.scope = options[0].value;
    }
    // an initial value is an applied search (restored state), so clearing it re-fires insSearch
    this.submittedValue = (this.value || "").trim();
  }

  @Watch('scopeOptions')
  handleScopeOptionsChange() {
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

  componentDidRender() {
    if (this.focusOptionOnRender) {
      this.focusOptionOnRender = false;
      const buttons = this.getOptionButtons();
      if (!buttons.length) return;
      const checked = buttons.find(button => button.getAttribute('aria-checked') === 'true');
      (checked || buttons[0]).focus();
    }
  }

  disconnectedCallback() {
    this.cancelPendingEmit();
    document.removeEventListener('click', this.documentClickHandler);
  }

  @Watch('disabled')
  handleDisabledChange(disabled: boolean) {
    if (disabled) {
      this.cancelPendingEmit();
      this.setOpen(false);
    }
  }

  @Listen('keydown')
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.open) {
        event.preventDefault();
        event.stopPropagation();
        this.setOpen(false, true);
      }
      return;
    }

    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(event.key) === -1) return;

    const target = event.target as HTMLElement;

    if (!this.open) {
      if (event.key === 'ArrowDown' && target.classList.contains('ins-search-scope__trigger')) {
        event.preventDefault();
        this.setOpen(true);
      }
      return;
    }

    if (!target.classList.contains('ins-search-scope__option')) return;
    this.moveFocus(event, target as HTMLButtonElement);
  }

  parseProps() {
    if (typeof this.scopeOptions === 'string') {
      try {
        this.scopeOptions = JSON.parse(this.scopeOptions) as Array<ScopeOption | string>;
      } catch (e) {
        console.error("Invalid scope options for", this.insSearchScopeEl);
        this.scopeOptions = [];
      }
    }
  }

  // accepts ["Name", "Email"] as well as [{ label, value }], the way Contacts.vue lists its fields
  getOptions(): Array<ScopeOption> {
    if (!Array.isArray(this.scopeOptions)) return [];
    const options: Array<ScopeOption> = [];
    for (const option of this.scopeOptions) {
      if (typeof option === 'string') {
        options.push({ label: option, value: option });
      } else if (option && option.value !== undefined) {
        options.push({ label: option.label || option.value, value: option.value });
      }
    }
    return options;
  }

  getScopeLabel(): string {
    const current = this.getOptions().find(option => option.value === this.scope);
    return current ? current.label : (this.scope || "");
  }

  cancelPendingEmit() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  emitSearch() {
    const value = (this.value || "").trim();
    this.submittedValue = value;
    this.insSearch.emit({ value, scope: this.scope });
  }

  private setOpen(open: boolean, focusTrigger: boolean = false): void {
    if (this.open === open) {
      if (focusTrigger) this.focusTrigger();
      return;
    }

    this.open = open;

    if (open) {
      document.addEventListener('click', this.documentClickHandler);
      this.focusOptionOnRender = true;
    } else {
      document.removeEventListener('click', this.documentClickHandler);
      if (focusTrigger) this.focusTrigger();
    }

    this.insOpenChange.emit({ open });
  }

  private moveFocus(event: KeyboardEvent, target: HTMLButtonElement): void {
    const buttons = this.getOptionButtons();
    if (!buttons.length) return;

    event.preventDefault();
    const currentIndex = buttons.indexOf(target);
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex < 0 ? buttons.length - 1 : (currentIndex - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttons.length - 1;
        break;
      default:
        return;
    }

    buttons[nextIndex].focus();
  }

  private getOptionButtons(): HTMLButtonElement[] {
    return Array.from(this.insSearchScopeEl.querySelectorAll('.ins-search-scope__option')) as HTMLButtonElement[];
  }

  private focusTrigger(): void {
    const trigger = this.insSearchScopeEl.querySelector('.ins-search-scope__trigger') as HTMLElement | null;
    if (trigger) trigger.focus();
  }

  handleTriggerClick = (event: MouseEvent) => {
    // the pill is a <label for=input>: stop the click from also focusing the text box
    event.preventDefault();
    if (this.disabled) return;
    this.setOpen(!this.open);
  }

  handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.insInput.emit({ value: this.value, scope: this.scope });
    this.cancelPendingEmit();
    if (this.debounce > 0) {
      this.debounceTimer = setTimeout(() => this.emitSearch(), this.debounce);
    }
  }

  handleInputKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.cancelPendingEmit();
      this.emitSearch();
    }
  }

  handleSubmitClick = (event: MouseEvent) => {
    event.preventDefault();
    if (this.disabled) return;
    this.cancelPendingEmit();
    this.emitSearch();
  }

  handleClearClick = (event: MouseEvent) => {
    event.preventDefault();
    if (this.disabled) return;
    this.clear();
    if (this.inputEl) this.inputEl.focus();
  }

  // picking a scope re-runs the active search against the new field
  handleOptionSelect = (option: ScopeOption, event: MouseEvent) => {
    event.preventDefault();
    this.setOpen(false, true);
    if (option.value === this.scope) return;
    this.scope = option.value;
    this.insScopeChange.emit({ scope: this.scope, label: option.label });
    if (this.submittedValue) {
      this.cancelPendingEmit();
      this.emitSearch();
    }
  }

  render() {
    const options = this.getOptions();
    const hasValue = !!(this.value && this.value.length);
    const scopeLabel = this.getScopeLabel();

    return (
      <label
        class={`ins-search-scope crm-search ${this.disabled ? 'disabled' : ''} ${this.open ? 'is-open' : ''} ${this.loading ? 'loading' : ''}`}
        htmlFor={this.inputId}
      >
        {options.length > 0 &&
          <span class="ins-search-scope__scope">
            <button
              type="button"
              class="ins-search-scope__trigger"
              aria-haspopup="menu"
              aria-expanded={this.open ? 'true' : 'false'}
              aria-controls={this.menuId}
              disabled={this.disabled}
              onClick={this.handleTriggerClick}
            >
              <span class="crm-sbprefix ins-search-scope__prefix">{this.scopePrefix}&nbsp;</span>
              <strong class="ins-search-scope__field">{scopeLabel}</strong>
              <i class="ins-search-scope__caret icon-caret-down" aria-hidden="true"></i>
            </button>

            <div
              class="ins-search-scope__menu"
              role="menu"
              id={this.menuId}
              aria-label={this.menuLabel}
              hidden={!this.open}
            >
              {options.map((option) =>
                <button
                  type="button"
                  role="menuitemradio"
                  class={`ins-search-scope__option ${option.value === this.scope ? 'is-checked' : ''}`}
                  aria-checked={option.value === this.scope ? 'true' : 'false'}
                  onClick={(event: MouseEvent) => this.handleOptionSelect(option, event)}
                >
                  {option.label}
                </button>
              )}
            </div>
          </span>
        }

        <input
          class="ins-search-scope__input ins-search-scope-input"
          id={this.inputId}
          type="search"
          placeholder={this.placeholder}
          value={this.value}
          aria-label={this.placeholder}
          disabled={this.disabled}
          onInput={this.handleInput}
          onKeyDown={this.handleInputKeyDown}
          ref={(el: HTMLInputElement) => this.inputEl = el}
        />

        <button
          type="button"
          class="ins-search-scope__clear"
          aria-label={this.clearLabel}
          data-tip={this.clearLabel}
          hidden={!hasValue}
          disabled={this.disabled}
          onClick={this.handleClearClick}
        >
          <i class="icon-close-1" aria-hidden="true"></i>
        </button>

        <button
          type="button"
          class={`ins-search-scope__submit ${hasValue ? 'has-value' : ''}`}
          aria-label={this.searchLabel}
          data-tip={this.searchLabel}
          aria-busy={this.loading ? 'true' : undefined}
          disabled={this.disabled}
          onClick={this.handleSubmitClick}
        >
          <i class={`ins-search-scope__submit-icon ${this.loading ? 'icon-refresh-cw is-spinning' : 'icon-search-1'}`} aria-hidden="true"></i>
        </button>
      </label>
    );
  }
}
