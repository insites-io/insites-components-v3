import { h, Component, Element, Event, Method, EventEmitter, Prop, State, Listen } from "@stencil/core";
import { iconForTabLabel } from '../../utils/tab-icons';

/**
 * Tabs. Two renderings share one public API (props, methods, insTabChange payload, header
 * class names, the :scope > .ins-tab > .ins-tab-headers > .ins-tab-header structure), so the
 * 63 module views that drive this component keep working untouched:
 *
 * - legacy: the original strip, unchanged.
 * - v6 (TW#26778152): the IIA v6 tab strip from the CRM record pages (ViewContact /
 *   ViewCompany's RecordTabs). Icon + label + optional count chip per tab, the design's
 *   colours and underline, icons dropped below 1280px, and no sideways scroll: tabs that do
 *   not fit move into a "More" menu at the end of the strip. The active tab is always visible
 *   in the strip; when it comes from the menu it takes the last visible slot.
 *
 * The v6 rendering switches on automatically inside the v6 Admin Shell (a
 * <ins-sidebar variant="v6"> is on the page), the same detection the rail item uses, so no
 * module needs a commit. `variant="v6"` forces it (tests, pages outside the shell) and
 * `variant="legacy"` opts out.
 *
 * Tab icons come from the item's icon="…" or, when absent, from utils/tab-icons by label.
 */
@Component({ tag: 'ins-tab' })

export class InsTab {
  @Element() insTabEl: HTMLElement;
  @Event() insTabChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) tabs: any = []; // NOTE: @Prop types compile into Stencil runtime metadata — do not change without a deliberate behaviour review
  /** '' = detect from the page (v6 inside the Admin Shell, legacy elsewhere); 'v6' or 'legacy' to force. */
  @Prop({ mutable: true }) variant: string = '';
  /** Label of the overflow menu trigger in the v6 strip. */
  @Prop({ mutable: true }) moreLabel: string = 'More';
  @State() activeTab: string = "";
  @State() activeTabIndex: number = 0;
  @State() insTabItems: any[] = [];
  /** Header <li>s by item index. Plain field on purpose: it is refreshed after every render and must not trigger one. */
  private insTabHeaders: HTMLElement[] = [];
  @State() v6: boolean = false;
  /** How many headers fit in the strip before the More menu takes over. Infinity = all. */
  @State() visibleCount: number = Infinity;
  @State() moreOpen: boolean = false;
  /** Bumped whenever an item's label/icon/count changes so the headers re-render. */
  @State() itemRevision: number = 0;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  private headerWidths: number[] = [];
  private moreWidth: number = 0;
  private resizeObserver: ResizeObserver;
  private iconMedia: MediaQueryList;
  private measureQueued: boolean = false;

  private documentClickHandler = (event: MouseEvent): void => {
    if (!this.moreOpen) return;
    const target = event.target as Node;
    if (this.insTabEl.querySelector('.iia-tabs__more')?.contains(target)) return;
    this.moreOpen = false;
  };

  private documentKeyHandler = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.moreOpen) this.moreOpen = false;
  };

  onchangeTabHandler(event: MouseEvent, index: number) {
    if (
      !this.insTabItems[index].disabled &&
      !this.insTabItems[index].active
    ) {
      this.setActiveTab(index);
      this.setActiveTabItem(index);
      this.insTabChange.emit({
        event: event,
        index: index,
        label: this.headerLabel(index)
      });
    }
    this.moreOpen = false;
  }

  getTabItemsEl() {
    return this.insTabEl.querySelectorAll(":scope ins-tab-item");
  }

  getTabHeadersEl() {
    return this.insTabEl.querySelectorAll(":scope > .ins-tab > .ins-tab-headers > .ins-tab-header");
  }

  getDefaulTabLabel(index: number) {
    return `Tab ${index + 1}`;
  }

  getTabHeaders() {
    let tabHeaders = this.getTabHeadersEl();
    let headers = [];

    for (let i = 0; i < tabHeaders.length; i++) {
      let item = tabHeaders[i] as HTMLElement;
      headers.push(item);
    }

    return headers;
  }

  getTabItems() {
    let tabItems = this.getTabItemsEl();
    let options = [];

    for (let i = 0; i < tabItems.length; i++) {
      if (tabItems[i].closest('ins-tab') === this.insTabEl){
        let item = tabItems[i] as any;
        options.push(item);
      }
    }

    return options;
  }

  getActiveTabLabelIndex() {
    for (let i = 0; i < this.insTabItems.length; i++) {
    let item = this.insTabItems[i] as any;

      if (item.active) {
        this.activeTab = item.label ?
          item.label.value :
          this.getDefaulTabLabel(i);
        this.activeTabIndex = i;
        break;
      }
    }
  }

  setActiveTab(index: number) {
    this.insTabHeaders.forEach(item => {
      item.classList.remove('active');
    });
    let el = this.insTabHeaders[index];
    if (el) el.classList.add('active');
    this.activeTabIndex = index;
  }

  setDisabledTabs() {
    let indexes = [];
    this.insTabItems.forEach((item, index) => {
      if (item.attributes.disabled) {
        indexes.push(index);
      }
    });

    this.insTabHeaders.forEach((item, index) => {
      if (indexes.indexOf(index) !== -1) {
        item.classList.add('disabled');
      } else {
        item.classList.remove('disabled');
      }
    });
  }

  setActiveTabItem(index: number) {
    this.insTabItems.forEach(item => {
      item.deactivate();
    });
    this.insTabItems[index]?.activate();
  }

  setScrollableHeaders() {
    if (this.v6) return; // the v6 strip never scrolls; overflow goes to the More menu
    let scrollWidth = 0 as number;
    let insTabContainer = this.insTabEl.querySelector('.ins-tab-headers');
    let scrollWidthContainer = insTabContainer.clientWidth;

    this.insTabHeaders.forEach(item => {
      scrollWidth += item.clientWidth;
    });

    if (scrollWidth > scrollWidthContainer) {
      insTabContainer.classList.add('scrollable');
    } else {
      insTabContainer.classList.remove('scrollable');
    }
  }

  setTabLabel(item: any, index: number) {
    return item.label ?
      item.label :
      this.getDefaulTabLabel(index);
  }

  setTabIcon(item) {
    return item.icon ?
     item.icon : '';
  }

  /** v6: the item's own icon, else the default for its label. Legacy: the item's icon only. */
  tabIcon(item: any, index: number) {
    if (item.icon) return item.icon;
    return this.v6 ? iconForTabLabel(this.setTabLabel(item, index)) : '';
  }

  /** A count chip renders for a number or a non-empty string; never for null/undefined/''. */
  hasCount(item: any) {
    const c = item.count;
    return typeof c === 'number' || (typeof c === 'string' && c.trim() !== '');
  }

  /**
   * The label reported in insTabChange. Consumers route on it
   * (`${method} Authorization Policy ${event.detail.label}`), so it must stay the label text
   * alone: never the count chip, never the icon.
   */
  headerLabel(index: number) {
    const header = this.insTabHeaders[index];
    const span = header?.querySelector('.ins-tab-header__label') as HTMLElement;
    if (span) return span.innerText.trim();
    return header?.innerText?.trim();
  }

  detectVariant() {
    if (this.variant === 'v6') return true;
    if (this.variant === 'legacy') return false;
    return typeof document !== 'undefined' && !!document.querySelector('ins-sidebar[variant="v6"]');
  }

  /* ---- v6 overflow ------------------------------------------------------------------------- */

  /** Indices drawn in the strip. Everything else goes to the More menu. */
  visibleIndices(): number[] {
    const n = this.insTabItems.length;
    if (!this.v6 || this.visibleCount >= n) return this.insTabItems.map((_, i) => i);
    const count = Math.max(1, this.visibleCount);
    const visible = [];
    for (let i = 0; i < count && i < n; i++) visible.push(i);
    if (visible.indexOf(this.activeTabIndex) === -1 && this.activeTabIndex < n) {
      visible[visible.length - 1] = this.activeTabIndex;
    }
    return visible;
  }

  overflowIndices(): number[] {
    const visible = this.visibleIndices();
    return this.insTabItems.map((_, i) => i).filter((i) => visible.indexOf(i) === -1);
  }

  queueMeasure() {
    if (this.measureQueued) return;
    this.measureQueued = true;
    requestAnimationFrame(() => {
      this.measureQueued = false;
      this.measure();
    });
  }

  /**
   * Fit as many headers as the strip is wide, leaving room for the More trigger when anything
   * overflows. Widths are read with every header shown, so a header hidden by a previous pass
   * is measured too, then the state change re-applies `hidden` through the render.
   */
  measure() {
    if (!this.v6) return;
    const strip = this.insTabEl.querySelector(':scope > .ins-tab > .ins-tab-headers') as HTMLElement;
    if (!strip) return;
    const headers = this.getTabHeaders();
    const more = strip.querySelector('.iia-tabs__more') as HTMLElement;

    const wasHidden = headers.map((h) => h.hidden);
    headers.forEach((h) => { h.hidden = false; });
    const moreWasHidden = more ? more.hidden : true;
    if (more) more.hidden = false;
    this.headerWidths = headers.map((h) => h.getBoundingClientRect().width);
    this.moreWidth = more ? more.getBoundingClientRect().width : this.moreWidth;
    headers.forEach((h, i) => { h.hidden = wasHidden[i]; });
    if (more) more.hidden = moreWasHidden;

    const available = strip.clientWidth;
    const total = this.headerWidths.reduce((a, b) => a + b, 0);
    let next: number;
    if (total <= available || available === 0) {
      next = Infinity;
    } else {
      const room = available - this.moreWidth;
      let used = 0;
      next = 0;
      for (let i = 0; i < this.headerWidths.length; i++) {
        // the active tab is always drawn, so reserve its width even when it sits past the cut
        const w = this.headerWidths[i];
        if (used + w > room) break;
        used += w;
        next++;
      }
      if (next < this.headerWidths.length && this.activeTabIndex >= next) {
        // swapping the active tab into the last slot may need more room than the tab it replaces
        const activeW = this.headerWidths[this.activeTabIndex] || 0;
        while (next > 1 && used - this.headerWidths[next - 1] + activeW > room) {
          used -= this.headerWidths[next - 1];
          next--;
        }
      }
      next = Math.max(1, next);
    }
    if (next !== this.visibleCount) this.visibleCount = next;
  }

  observe() {
    if (!this.v6 || typeof ResizeObserver === 'undefined') return;
    const strip = this.insTabEl.querySelector(':scope > .ins-tab > .ins-tab-headers');
    if (!strip) return;
    this.resizeObserver = new ResizeObserver(() => this.queueMeasure());
    this.resizeObserver.observe(strip);
    // icons drop below 1280px (CSS), which changes every header's width
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.iconMedia = window.matchMedia('(max-width: 1279px)');
      this.iconMedia.addEventListener?.('change', () => this.queueMeasure());
    }
    document.addEventListener('click', this.documentClickHandler);
    document.addEventListener('keydown', this.documentKeyHandler);
  }

  toggleMore(event: MouseEvent) {
    event.stopPropagation();
    this.moreOpen = !this.moreOpen;
  }

  /* ---- lifecycle --------------------------------------------------------------------------- */

  componentWillLoad() {
    this.v6 = this.detectVariant();
    this.insTabItems = this.getTabItems();
    this.getActiveTabLabelIndex();
  }

  componentDidLoad() {
    this.insTabHeaders = this.getTabHeaders();
    this.setActiveTab(this.activeTabIndex);
    this.setDisabledTabs();
    this.setActiveTabItem(this.activeTabIndex);
    this.setScrollableHeaders();
    this.observe();
    this.queueMeasure();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insTabEl);
    }
  }

  componentDidUpdate() {
    // v6 re-renders on state changes and the <li>s are re-created; the legacy strip never re-renders.
    this.insTabHeaders = this.getTabHeaders();
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    document.removeEventListener('click', this.documentClickHandler);
    document.removeEventListener('keydown', this.documentKeyHandler);
  }

  @Method()
  async activateTab(place: number){
    let index = place - 1;
    this.insTabChange.emit({
      event: this.insTabItems[index],
      index: index,
      label: this.headerLabel(index)
    });
    this.setActiveTab(index);
    this.setActiveTabItem(index);
  }

  @Listen('insTabDisableToggle')
  tabItemDisableToggledHandler(event: CustomEvent<boolean>){
    if (this.v6) { this.itemRevision++; return; }
    let tabIndex = this.insTabItems.indexOf(event.target);
    if (this.insTabHeaders[tabIndex]) {
      if (event.detail){
        this.insTabHeaders[tabIndex].classList.add('disabled');
      } else {
        this.insTabHeaders[tabIndex].classList.remove('disabled');
      }
    }
  }

  @Listen('insTabError')
  checkForErrors(event: CustomEvent<boolean>){
    if (this.v6) { this.itemRevision++; return; }
    let errorIndex = this.insTabItems.indexOf(event.target);
    if (this.insTabHeaders[errorIndex]) {
      if (event.detail){
        this.insTabHeaders[errorIndex].classList.add('has-error');
      } else {
        this.insTabHeaders[errorIndex].classList.remove('has-error');
      }
    }
  }

  @Listen('insTabItemChange')
  tabItemChangedHandler(event: CustomEvent<{ prop: string }>) {
    if (!this.v6) return;
    const index = this.insTabItems.indexOf(event.target);
    if (index === -1) return;
    if (event.detail.prop === 'active') {
      // the SPA drives :active from the route (browser back, deep link); mirror it in the strip
      if ((event.target as any).active && index !== this.activeTabIndex) {
        this.setActiveTab(index);
        this.queueMeasure();
      }
      return;
    }
    this.itemRevision++;
    this.queueMeasure();
  }

  /* ---- render ------------------------------------------------------------------------------ */

  renderLegacy() {
    return (
      <div class="ins-tab">
        <ul class="ins-tab-headers" onMouseOver={() => this.setScrollableHeaders()}>
          {this.insTabItems.map((item, index) => {
            return (
              <li
                class={`ins-tab-header ${item.hasError ? 'has-error' : ''}`}
                onClick={e => this.onchangeTabHandler(e, index)}>
                {item.icon ? <span class={`${item.icon}`}></span>: ''} {item.icon && !item.label ? '' : <span>{this.setTabLabel(item, index)}</span>}
              </li>
            )
          })}
        </ul>
        <slot />
      </div>
    )
  }

  renderV6() {
    const visible = this.visibleIndices();
    const overflow = this.overflowIndices();
    const revision = this.itemRevision; // read so a count/label change re-renders the headers
    return (
      <div class="ins-tab iia-tabs" data-revision={revision}>
        <ul class="ins-tab-headers iia-tabs__strip" role="tablist">
          {this.insTabItems.map((item, index) => {
            const icon = this.tabIcon(item, index);
            const active = index === this.activeTabIndex;
            return (
              <li
                class={`ins-tab-header iia-tabs__tab${active ? ' active' : ''}${item.hasError ? ' has-error' : ''}${item.disabled ? ' disabled' : ''}`}
                role="tab"
                aria-selected={active ? 'true' : 'false'}
                hidden={visible.indexOf(index) === -1}
                onClick={e => this.onchangeTabHandler(e, index)}>
                {icon ? <i class={`iia-tabs__icon ${icon}`} aria-hidden="true"></i> : null}
                <span class="ins-tab-header__label">{this.setTabLabel(item, index)}</span>
                {this.hasCount(item) ? <span class="iia-tabs__count">{item.count}</span> : null}
              </li>
            )
          })}
          <li class="iia-tabs__more" hidden={overflow.length === 0}>
            <button
              type="button"
              class={`iia-tabs__more-trigger ${this.moreOpen ? 'is-open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={this.moreOpen ? 'true' : 'false'}
              onClick={e => this.toggleMore(e)}>
              <span class="ins-tab-header__label">{this.moreLabel}</span>
              <span class="iia-tabs__count">{overflow.length}</span>
              <i class="iia-tabs__more-caret icon-caret-down" aria-hidden="true"></i>
            </button>
            {this.moreOpen
              ? <ul class="iia-tabs__menu" role="menu">
                  {overflow.map((index) => {
                    const item = this.insTabItems[index];
                    const icon = this.tabIcon(item, index);
                    return (
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          class={`iia-tabs__menu-item ${item.hasError ? 'has-error' : ''} ${item.disabled ? 'disabled' : ''}`}
                          disabled={!!item.disabled}
                          onClick={e => this.onchangeTabHandler(e, index)}>
                          {icon ? <i class={`iia-tabs__icon ${icon}`} aria-hidden="true"></i> : null}
                          <span class="ins-tab-header__label">{this.setTabLabel(item, index)}</span>
                          {this.hasCount(item) ? <span class="iia-tabs__count">{item.count}</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              : null}
          </li>
        </ul>
        <slot />
      </div>
    )
  }

  render() {
    return this.v6 ? this.renderV6() : this.renderLegacy();
  }
}
