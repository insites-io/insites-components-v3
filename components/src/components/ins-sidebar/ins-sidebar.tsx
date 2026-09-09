import { h, Component, Prop, Event, EventEmitter, State, Method, Listen, Element, Host } from "@stencil/core";

/**
 * IIA v6 shell rail (TW#26371963) is an ADDITIVE variant of this component.
 *
 * `variant="v6"` renders the Admin Shell v1.5 rail: 216px expanded / 64px collapsed
 * (56px below 768px), shared sliding hover pill, 2px active marker, Phosphor
 * outline-to-fill icons, hover flyouts for sub-menus. The default render, the hash
 * routing, `minimise()`/`maximise()` and the `routePage` listener are unchanged,
 * so every module partial that emits <ins-sidebar-item> keeps working with no
 * edit, which is the decision recorded on that task. Child items detect the
 * variant through `closest('ins-sidebar[variant="v6"]')`.
 *
 * Collapsed state still rides `body.mini` + `minimised`, because ins-sidebar-item
 * and the legacy ins-header toggle both key off those. The v6 CSS reads the
 * `iia-rail--collapsed` host class that mirrors `minimised`.
 */
@Component({ tag: 'ins-sidebar' })
export class InsSidebar {
  @Element() insSidebarEl: HTMLElement;
  @Event() insSidebarAction: EventEmitter<any>;
  @Event() didLoad: EventEmitter<void>;
  /** v6: fires when a rail flyout opens or closes. */
  @Event() insFlyoutChange: EventEmitter<{ open: boolean; label: string }>;

  @Prop() hasLoad: string;
  @Prop({ mutable: true }) fullLogo: string;
  @Prop({ mutable: true }) iconLogo: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  /** '' keeps the original rendering. 'v6' is the Admin Shell v1.5 rail. */
  @Prop({ mutable: true }) variant: string = '';

  @State() minimised: boolean = false;
  @State() noFooter: boolean = false;

  // v6 state
  @State() hoverY: number = 0;
  @State() hoverH: number = 32;
  @State() hoverOn: boolean = false;
  @State() flyoutFor: HTMLInsSidebarItemElement | null = null;
  @State() flyoutTop: number = 0;
  @State() flyoutLeft: number = 64;
  @State() flyHoverY: number = 0;
  @State() flyHoverH: number = 30;
  @State() flyHoverOn: boolean = false;
  @State() flyoutSubs: Array<{ el: HTMLInsSidebarItemElement; label: string; external: boolean; active: boolean }> = [];
  @State() narrow: boolean = false;

  baseURL = "https://components.insites.io/assets/images";
  sidebarItemEls: NodeListOf<HTMLInsSidebarItemElement>;
  insRenderer: HTMLInsRendererElement;
  insHeaderUserEl: HTMLInsHeaderUserElement;
  reroute: boolean = false;
  private flyCloseTimer: any = null;
  private flyoutEl: HTMLElement | null = null;
  private scrollerEl: HTMLElement | null = null;
  private narrowMq: MediaQueryList | null = null;
  private onNarrow = (e: MediaQueryListEvent | MediaQueryList) => { this.narrow = e.matches; };

  get isV6() { return this.variant === 'v6'; }

  componentWillLoad(){
    this.checkDeviceWidth();
    let hasFooter = this.insSidebarEl.querySelector('ins-sidebar-footer');
    let classBody = document.querySelector('body').classList;

    // check if mobile view
    for (let counter = 0; counter < classBody.length; counter++) {
      if (classBody[counter] === 'mini') {
        this.minimised = true;
        break;
      }
    }

    if (!hasFooter){
      this.noFooter = true;
    }

    if (this.isV6) {
      // Below 1024px the design opens flyouts on tap, not hover.
      this.narrowMq = window.matchMedia('(max-width: 1023px)');
      this.narrow = this.narrowMq.matches;
      this.narrowMq.addEventListener('change', this.onNarrow);
    }
  }

  componentDidLoad(){
    this.sidebarItemEls = this.insSidebarEl.querySelectorAll('ins-sidebar-item');
    this.insRenderer = document.querySelector('ins-renderer');
    this.insHeaderUserEl = document.querySelector('ins-header-user');

    this.checkHash(true);

    window.onhashchange = async () => {
      await this.checkHash();
      if (this.isV6) this.refreshFlyoutSubs();
    };

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insSidebarEl);
    }
  }

  disconnectedCallback(){
    if (this.narrowMq) this.narrowMq.removeEventListener('change', this.onNarrow);
    clearTimeout(this.flyCloseTimer);
  }

  checkDeviceWidth(){
    const mq = window.matchMedia("(min-width: 1260px)");
    if (!mq.matches) {
      document.body.classList.add('no-transition');
      document.body.classList.add('mini');

      setTimeout(() => {
        document.body.classList.remove('no-transition');
      }, 1000)
    }
  }

  @Listen('routePage')
  routePageHandler(event: CustomEvent) {
    this.updateRoute(event.detail.crumbs, event.detail.redirect);
    if (this.isV6) this.closeFlyout();
  }

  async updateRoute(crumbs: any[], redirect: boolean) {
    let noRedirect = !redirect;

    if (this.reroute){
      let queryStrings = window.location.hash.split("?")[1].split("&");
      queryStrings.forEach(item => {

        if (item.includes("reroute=")){
          crumbs[0].link = item.substring(8, item.length);

        } else if (item.includes("reroutelabel=")){
          crumbs[0].label = decodeURIComponent(item.substring(13, item.length));
        }

      });
      this.reroute = false;
    }

    await this.insRenderer.updateRoute(crumbs, noRedirect, true);
  }

  async goToMyProfilePage(deeplink: boolean){
    let insHeaderUserEl = document.querySelector('ins-header-user');
    if (!deeplink) await this.hideSidebarItems();

    // v6 renders the account menu inside ins-header, so ins-header-user may be absent.
    const profileLink = insHeaderUserEl ? insHeaderUserEl.profileLink : '#/my-profile';
    const app = insHeaderUserEl ? insHeaderUserEl.app : false;

    this.updateRoute([{
      link: profileLink,
      app: app,
      label: 'My Profile',
      withSubmenu: false
    }], false);
  }

  async hideSidebarItems(){
    for (let i = 0; i < this.sidebarItemEls.length; ++i) {
      await this.sidebarItemEls[i].deactivate();
    }
  }

  async activateSidebarFromCrumbs(){
    let currentCrumbs = window.localStorage.getItem('ins_breadcrumbs');
    if (!currentCrumbs) return;
    let parsedCrumbs = JSON.parse(currentCrumbs);
    let reversed = parsedCrumbs.reverse();

    for (const crumb of reversed){
      let currentHash = crumb.app
      ? crumb.formattedRoute
      : crumb.link;

      if (await this.matchHash(currentHash, true)){
        break
      }
    }
  }

  checkIfRoot(show: boolean){
    let currentHash = window.location.hash;
    if (currentHash === "" || currentHash === "#/"){
      if (show) this.showLandingPage();
      return false;
    }
    return currentHash;
  }

  showLandingPage(){
    for (let i = 0; i < this.sidebarItemEls.length; i++) {
      if (this.sidebarItemEls[i].landingPage){
        this.sidebarItemEls[i].routePageHandler("landing");
        break;
      }
    }
  }

  async matchHash(currentHash, deeplink){
    for (let i = 0; i < this.sidebarItemEls.length; i++) {
      let formattedRoute = await this.sidebarItemEls[i].formatRoute();

      if (currentHash === formattedRoute){
        await this.loadRoute(this.sidebarItemEls[i], deeplink);
        return true;

      } else if (formattedRoute
        && currentHash?.includes(formattedRoute)
        && currentHash?.includes("?reroute=")
        && this.sidebarItemEls[i].app
      ){
        this.reroute = true;
        await this.loadRoute(this.sidebarItemEls[i], deeplink);
        return true;
      }
    }

    return false
  }

  async loadRoute(sidebarItem: any, deeplink: boolean){
    if (!deeplink){
      sidebarItem.routePageHandler();
    } else {
      sidebarItem.activate();
    }

    return true;
  }

  async checkHash(deeplink?: boolean){
    let route = this.checkIfRoot(true);
    if (route === "#/app/my-profile" ||
      (this.insHeaderUserEl && this.insHeaderUserEl.profileLink === route)
    ){
      await this.goToMyProfilePage(deeplink);

    } else if (route) {
      if (!await this.matchHash(route, false) && deeplink){
        await this.activateSidebarFromCrumbs();
      }
    }
  }

  @Listen('insSidebarFooterButtonEvent')
  insSidebarFooterButtonEventHandler(event: CustomEvent) {
    let tgt = event.target as any;
    if(tgt.attributes.open) {
      let open = tgt.attributes.open.value;
      let insSidebarItem = this.insSidebarEl
        .querySelector(`ins-sidebar-item[footer-link="${open}"]`) as any;

      const mq = window.matchMedia("(min-width: 1260px)");
      if (mq.matches && insSidebarItem) insSidebarItem.showSubMenu();
    }
  }

  @Listen('didHover')
  didHoverEventHandler(event: CustomEvent) {
    // The legacy tooltip elements do not exist in the v6 render.
    if (this.isV6) return;
    const insSidebarContainerEl = this.insSidebarEl.querySelector('.ins-sidebar') as HTMLElement;
    if (!insSidebarContainerEl) return;
    const insSidebarTooltipEl = insSidebarContainerEl.querySelector('.ins-sidebar-item-tooltip') as HTMLElement;
    if (!insSidebarTooltipEl) return;
    const insSidebarItemLabelEl = insSidebarTooltipEl.querySelector('.ins-sidebar-item-label') as HTMLElement;

    insSidebarTooltipEl.style.left = event.detail.x + 2 + 'px';
    insSidebarTooltipEl.style.top = event.detail.y + 8 + 'px';
    insSidebarItemLabelEl.textContent = event.detail.label;
    insSidebarContainerEl.classList.toggle('show-tooltip', event.detail.state);
  }

  @Method()
  async deactivateSidebarItems(){
    for (let i = 0; i < this.sidebarItemEls.length; ++i) {
      await this.sidebarItemEls[i].deactivate();
    }
  }

  @Method()
  async minimise(){
    this.minimised = true;
    if (this.isV6) this.closeFlyout();
  }

  @Method()
  async maximise(){
    this.minimised = false;
  }

  /** v6: whether the rail is collapsed. */
  @Method()
  async isCollapsed(){
    return this.minimised;
  }

  sidebarActionEventHandler(event: any){
    this.insSidebarAction.emit(event);
  }

  getIcon(){
    return this.iconLogo ? this.iconLogo : `${this.baseURL}/insites_logo_icon.svg`;
  }

  getLogo(){
    return this.fullLogo ? this.fullLogo : `${this.baseURL}/Insites_logo.svg`
  }

  // ---------------------------------------------------------------------------
  // v6: hover pill, flyouts
  // ---------------------------------------------------------------------------

  /** Called by top-level ins-sidebar-item on pointer enter (v6). */
  @Method()
  async railItemEnter(itemEl: HTMLElement){
    if (!this.isV6 || !this.scrollerEl) return;
    const row = itemEl.querySelector('.iia-rail-item__link') as HTMLElement || itemEl;
    const y = row.getBoundingClientRect().top - this.scrollerEl.getBoundingClientRect().top + this.scrollerEl.scrollTop;
    this.hoverY = y;
    this.hoverH = row.offsetHeight || 32;
    this.hoverOn = true;
    // Below 1024px a tap also fires mouseenter; opening here would let the click that
    // follows immediately toggle the flyout shut again, so hover-open is desktop only.
    if (!this.narrow) {
      const host = itemEl.closest('ins-sidebar-item') as HTMLInsSidebarItemElement;
      if (host && host.withSubmenu) this.openFlyout(host);
      else this.scheduleFlyoutClose();
    }
  }

  @Method()
  async railItemLeave(){
    if (!this.isV6) return;
    this.hoverOn = false;
    if (!this.narrow) this.scheduleFlyoutClose();
  }

  /** Called by a top-level ins-sidebar-item with a submenu when clicked (v6). */
  @Method()
  async toggleFlyout(host: HTMLInsSidebarItemElement){
    if (this.flyoutFor === host) this.closeFlyout();
    else this.openFlyout(host);
  }

  @Method()
  async closeFlyout(){
    clearTimeout(this.flyCloseTimer);
    if (this.flyoutFor) {
      this.flyoutFor = null;
      this.flyoutSubs = [];
      this.flyHoverOn = false;
      this.insFlyoutChange.emit({ open: false, label: '' });
    }
  }

  private scheduleFlyoutClose(){
    clearTimeout(this.flyCloseTimer);
    // 60ms grace so the pointer can travel from the row into the flyout (design README).
    this.flyCloseTimer = setTimeout(() => this.closeFlyout(), 60);
  }

  private openFlyout(host: HTMLInsSidebarItemElement){
    clearTimeout(this.flyCloseTimer);
    const link = host.querySelector('.iia-rail-item__link') as HTMLElement || host;
    const r = link.getBoundingClientRect();
    const railRight = this.insSidebarEl.getBoundingClientRect().right;
    // Keep the panel on screen: clamp so max-height (min(70vh,460px)) fits below.
    const maxH = Math.min(window.innerHeight * 0.7, 460);
    const top = Math.max(8, Math.min(r.top, window.innerHeight - maxH - 8));
    this.flyoutLeft = railRight;
    this.flyoutTop = top;
    this.flyoutFor = host;
    this.refreshFlyoutSubs();
    this.flyHoverOn = false;
    this.insFlyoutChange.emit({ open: true, label: host.label });
  }

  private refreshFlyoutSubs(){
    if (!this.flyoutFor) return;
    const subs = Array.from(this.flyoutFor.querySelectorAll(':scope > ins-sidebar-item, :scope > div > ins-sidebar-item')) as HTMLInsSidebarItemElement[];
    const hash = window.location.hash;
    this.flyoutSubs = subs
      .filter(s => s.label && s.label !== '')
      .map(s => ({
        el: s,
        label: s.label,
        external: !!s.externalLink,
        active: !!s.link && hash === s.link,
      }));
  }

  private flyoutEnter = () => { clearTimeout(this.flyCloseTimer); };
  private flyoutLeave = () => { this.flyHoverOn = false; if (!this.narrow) this.scheduleFlyoutClose(); };

  private flySubEnter = (e: MouseEvent) => {
    const row = e.currentTarget as HTMLElement;
    if (!this.flyoutEl) return;
    const y = row.getBoundingClientRect().top - this.flyoutEl.getBoundingClientRect().top + this.flyoutEl.scrollTop;
    this.flyHoverY = y;
    this.flyHoverH = row.offsetHeight || 30;
    this.flyHoverOn = true;
  };

  private flySubGo = (e: MouseEvent, sub: HTMLInsSidebarItemElement) => {
    if (sub.externalLink) return; // plain anchor, opens in a new tab
    e.preventDefault();
    // Route through the child item so crumbs, activation and the renderer behave exactly as before.
    sub.routePageHandler(e);
    this.closeFlyout();
  };

  private flyoutKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); this.closeFlyout(); }
  };

  @Listen('keydown', { target: 'document' })
  docKeyDown(e: KeyboardEvent){
    if (!this.isV6) return;
    if (e.key === 'Escape' && this.flyoutFor) this.closeFlyout();
  }

  @Listen('mousedown', { target: 'document' })
  docMouseDown(e: MouseEvent){
    if (!this.isV6 || !this.flyoutFor) return;
    const t = e.target as HTMLElement;
    if (this.insSidebarEl.contains(t) || (this.flyoutEl && this.flyoutEl.contains(t))) return;
    this.closeFlyout();
  }

  private pillTransition(){
    const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    return motionOK
      ? 'transform 240ms cubic-bezier(0.2,0,0,1),opacity 150ms cubic-bezier(0,0,0.2,1)'
      : 'opacity 150ms cubic-bezier(0,0,0.2,1)';
  }

  renderV6(){
    const collapsed = this.minimised;
    const flyLabel = this.flyoutFor ? this.flyoutFor.label : '';
    return (
      <Host class={{ 'iia-rail': true, 'iia-rail--collapsed': collapsed, 'iia-rail--flyout-open': !!this.flyoutFor }}
            role="navigation" aria-label="Modules">
        <div class="iia-rail__scroll iia-railscroll" ref={el => this.scrollerEl = el}
             onMouseLeave={() => this.railItemLeave()}>
          <div class="iia-rail__pill" aria-hidden="true"
               style={{ height: `${this.hoverH}px`, transform: `translateY(${this.hoverY}px)`, opacity: this.hoverOn ? '1' : '0', transition: this.pillTransition() }}></div>
          <slot />
        </div>
        <div class="iia-rail__fade" aria-hidden="true"></div>

        {this.flyoutFor ? (
          <div class="iia-flyout iia-railscroll" role="menu" aria-label={flyLabel}
               ref={el => this.flyoutEl = el}
               style={{ left: `${this.flyoutLeft}px`, top: `${this.flyoutTop}px` }}
               onMouseEnter={this.flyoutEnter} onMouseLeave={this.flyoutLeave} onKeyDown={this.flyoutKeyDown}>
            <div class="iia-flyout__pill" aria-hidden="true"
                 style={{ height: `${this.flyHoverH}px`, transform: `translateY(${this.flyHoverY}px)`, opacity: this.flyHoverOn ? '1' : '0', transition: this.pillTransition() }}></div>
            <div class="iia-flyout__label">{flyLabel}</div>
            {this.flyoutSubs.map((sub, i) => (
              <a role="menuitem"
                 class={{ 'iia-flyout__item': true, 'is-active': sub.active }}
                 href={sub.external ? (sub.el.link || '#') : (sub.el.link || '#')}
                 target={sub.external ? '_blank' : undefined}
                 rel={sub.external ? 'noopener noreferrer' : undefined}
                 style={{ animationDelay: `${Math.min(i, 8) * 18}ms` }}
                 onMouseEnter={this.flySubEnter}
                 onClick={(e) => this.flySubGo(e, sub.el)}>
                <span class="iia-flyout__marker" aria-hidden="true"></span>
                {sub.label}
                {sub.external ? <i class="icon-external-link iia-flyout__ext" aria-hidden="true"></i> : null}
              </a>
            ))}
          </div>
        ) : null}
      </Host>
    );
  }

  render() {
    if (this.isV6) return this.renderV6();

    return (
      <div class="ins-sidebar">
        <div class="ins-sidebar-item-tooltip">
          <span class="ins-sidebar-item-label"></span>
        </div>
        <div class={`sidebar ${this.noFooter ? 'no-footer':''}`}>
          <div class="insites-logo-wrap">
          { this.minimised
              ? <img src={ this.getIcon() } />
              : <img src={ this.getLogo() } />
            }
          </div>

          <div class="sidebar-items-wrap">
            <slot />
          </div>
        </div>
      </div>
    )
  }
}
