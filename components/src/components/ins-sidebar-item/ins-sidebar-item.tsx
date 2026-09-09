import { h, Component, Prop, Event, EventEmitter, State, Method, Element, Host } from '@stencil/core';
import { glyphForLegacyIcon } from '../../utils/phosphor-shell-icons';

/**
 * IIA v6 rail item (TW#26371963). No new props: when the closest <ins-sidebar>
 * carries variant="v6" this item renders the Admin Shell v1.5 row instead of the
 * legacy one. Its public API and every method the module partials and the hash
 * router rely on are unchanged, so the ten module rail partials and the two
 * migration-seeded instance partials keep working untouched.
 *
 * In v6 a top-level item with a submenu does NOT render its children inline; the
 * parent rail reads them and shows a flyout. Nested items render nothing
 * themselves, but stay in the DOM so routing, crumbs and activation keep working
 * through routePageHandler()/activate() exactly as before.
 *
 * The icon: the legacy `icon="icon-…"` class is resolved centrally to a Phosphor
 * glyph (utils/phosphor-shell-icons). Unmapped classes fall back to the font icon,
 * so an unknown module still renders.
 */
@Component({ tag: 'ins-sidebar-item' })
export class InsSidebarItem {
  @Element() insSidebarItemEl: HTMLElement;
  @Event() routePage: EventEmitter<{ crumbs: any[]; redirect: boolean }>;
  @Event() didLoad: EventEmitter<void>;
  @Event() didHover: EventEmitter<{ x: number; y: number; label: string; state: boolean }>;
  @Prop() hasLoad: string;

  @Prop({mutable: true}) link: any = '';
  @Prop({mutable: true}) footerLink: string = '';
  @Prop({mutable: true}) icon: any = 'no-icon';
  @Prop({mutable: true}) app: boolean = false;
  @Prop({mutable: true}) externalLink: boolean = false;
  @Prop({mutable: true}) externalLinkIcon: string = 'icon-external-link-1';
  @Prop({mutable: true}) withSubmenu: boolean = false;
  @Prop({mutable: true}) label: string = 'Label';
  @Prop({mutable: true}) landingPage: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({ mutable: true }) tooltip: boolean = false;

  @State() submenuVisible: boolean;
  @State() isActive: boolean;
  @State() formattedRoute: string;
  @State() v6: boolean = false;
  @State() v6Nested: boolean = false;
  @State() v6Collapsed: boolean = false;
  /** Mirrors the rail's iia-rail--flyout-open class so aria-expanded re-renders when the rail opens a flyout. */
  @State() v6FlyoutOpen: boolean = false;

  private railEl: HTMLInsSidebarElement | null = null;
  private railObserver: MutationObserver | null = null;

  @Method()
  async routePageHandler(e?: Event | string){
    let redirect = false;

    if (e) {
      if (e === "landing") redirect = true
      else (e as Event).preventDefault();
    }

    this.activate();
    let gettingCrumbs = true;
    let currentClosesEl = this.insSidebarItemEl.parentElement.closest('ins-sidebar-item');

    let crumbs = [];

    let crumb = {
      link: this.link,
      app: this.app,
      withSubmenu: this.withSubmenu,
      label: this.label,
      formattedRoute: this.formattedRoute
    }

    crumbs.push(crumb);

    while (gettingCrumbs){
      if (currentClosesEl){
        let crumb = {
          link: currentClosesEl.link,
          app: currentClosesEl.app,
          withSubmenu: currentClosesEl.withSubmenu,
          label: currentClosesEl.label,
          formattedRoute: this.formattedRoute
        };
        crumbs.push(crumb);
        currentClosesEl = currentClosesEl.parentElement.closest('ins-sidebar-item');
      } else { gettingCrumbs = false }
    }
    crumbs.reverse();

    this.toggleMenuNav();
    this.routePage.emit({ crumbs, redirect });

    let body = document.querySelector('body');
    body.style.overflowY = null;

    if (this.app) {
      document.querySelector('body').style.overflowY = 'hidden';
    }

    const mq = window.matchMedia("(max-width: 1260px)");
    let menuBar = document.querySelector('ins-sidebar') as any;
    if (mq.matches && menuBar) {
      document.querySelector('body').classList.add('mini');
      menuBar.minimise();
    }

    return { crumbs }
  }

  toggleMenuNav() {
    let insHeaderEl = document.querySelector('ins-header') as any;
    // The v6 header has no .full-width-navs; the legacy one may be absent too.
    if (!insHeaderEl) return;
    let menuNav = insHeaderEl.querySelector('.full-width-navs');
    if (!menuNav) return;

    if (this.hasClass(menuNav, 'active')) {
      insHeaderEl.toggleNav();
    }
  }

  hasClass(element: Element, cls: string){
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }

  toggleSidebar() {
    let insAdminEl = document.querySelector('body');
    let menuBar = document.querySelector("ins-header") as any;
    if (menuBar && insAdminEl.className.includes('mini')) {
        menuBar.toggleSidebar();
    }
  }

  @Method()
  async showSubMenu(){
    let insAdminEl = document.querySelector('body');

    if (this.withSubmenu && insAdminEl.className.includes('mini')) {
      await this.hideSiblingsMenu();
    }

    this.submenuVisible = true;
    // v6 flyouts are opened by the rail on hover/click; do not un-collapse the rail here.
    if (!this.v6) this.toggleSidebar();
    return true;
  }

  @Method()
  async hideSubMenu(){
    this.submenuVisible = false;
    return true;
  }

  @Method()
  async activate(){
    await this.deactivateSiblings();
    let checkIfSubMenu = this.insSidebarItemEl.closest('.submenu-wrap');
    if (!checkIfSubMenu && this.v6) {
      // v6 renders no .submenu-wrap; the parent is simply the closest ancestor item.
      const parentItem = this.insSidebarItemEl.parentElement && this.insSidebarItemEl.parentElement.closest('ins-sidebar-item') as any;
      if (parentItem) await parentItem.activateParent();
      return true;
    }
    if (checkIfSubMenu) {
      let parent = checkIfSubMenu.closest('ins-sidebar-item');
      await parent.activateParent();

      const mq = window.matchMedia("(min-width: 1260px)");
      if (mq.matches) parent.showSubMenu();
    }
    return true;
  }

  @Method()
  async activateParent(){
    this.isActive = true;
    return true;
  }

  @Method()
  async deactivate(){
    this.isActive = false;
    return true;
  }

  async hideSiblingsMenu(){
    let submenuWrapEls = this.insSidebarItemEl.closest('ins-sidebar').querySelectorAll('ins-sidebar-item') as any;

    for (let i = 0; i < submenuWrapEls.length; ++i) {
      await submenuWrapEls[i].hideSubMenu();
    }
  }

  async deactivateSiblings(){
    let submenuWrapEls = this.insSidebarItemEl.closest('ins-sidebar')
      .querySelectorAll('ins-sidebar-item') as any;

    for (let i = 0; i < submenuWrapEls.length; ++i) {
      await submenuWrapEls[i].deactivate();
    }

    this.isActive = true;
    return true;
  }

  addRippleEffect(startingPoint: MouseEvent, target: HTMLElement){

    let rect = target.getBoundingClientRect();
    let ripple = target.querySelector('.ripple-wave') as HTMLSpanElement;

    if (!ripple) {
      ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px';
      target.appendChild(ripple);
    }

    ripple.classList.remove('show');
    let top = startingPoint.pageY - (rect.top + window.scrollY) - ripple.offsetHeight / 2;

    let left = startingPoint.pageX - rect.left - ripple.offsetWidth / 2;
    ripple.style.top = top + 'px';
    ripple.style.left = left + 'px';
    ripple.classList.add('show');

    setTimeout(() => {
      if (target.contains(ripple)){
        target.removeChild(ripple);
      }
    }, 1250);

    return false;
  }

  componentWillLoad(){
    this.formattedRoute = this.locFormatRoute();
    this.railEl = this.insSidebarItemEl.closest('ins-sidebar[variant="v6"]') as HTMLInsSidebarElement;
    this.v6 = !!this.railEl;
    if (this.v6) {
      this.v6Nested = !!(this.insSidebarItemEl.parentElement && this.insSidebarItemEl.parentElement.closest('ins-sidebar-item'));
      this.v6Collapsed = this.railEl.classList.contains('iia-rail--collapsed');
    }
  }

  componentDidLoad(){
    if (!this.v6) {
      let target = this.insSidebarItemEl.querySelector('.ins-ripple-button') as HTMLElement;
      this.insSidebarItemEl.addEventListener('click', e => {
        e.stopPropagation();
        let tgt = e.target as any;
        let parent = tgt.parentNode;
        if (target && !parent.classList.contains('btn-nav')){
          this.addRippleEffect(e, target);
        }
      });
    } else if (this.railEl) {
      // The rail may have rendered its classes between our willLoad and now.
      this.v6Collapsed = this.railEl.classList.contains('iia-rail--collapsed');
      this.v6FlyoutOpen = this.railEl.classList.contains('iia-rail--flyout-open');
      // Mirror the rail's classes: collapsed drives label visibility, flyout-open drives aria-expanded.
      this.railObserver = new MutationObserver(() => {
        this.v6Collapsed = this.railEl.classList.contains('iia-rail--collapsed');
        this.v6FlyoutOpen = this.railEl.classList.contains('iia-rail--flyout-open');
      });
      this.railObserver.observe(this.railEl, { attributes: true, attributeFilter: ['class'] });
    }

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insSidebarItemEl);
    }
  }

  disconnectedCallback(){
    if (this.railObserver) this.railObserver.disconnect();
  }

  connectedCallback(){
    // The v6 rail regroups its items into wrapper divs, which moves this element once. Re-arm the
    // class observer so collapse and flyout state keep flowing after the move.
    if (this.railObserver && this.railEl) {
      this.v6Collapsed = this.railEl.classList.contains('iia-rail--collapsed');
      this.v6FlyoutOpen = this.railEl.classList.contains('iia-rail--flyout-open');
      this.railObserver.observe(this.railEl, { attributes: true, attributeFilter: ['class'] });
    }
  }

  @Method()
  async formatRoute() {
    return this.locFormatRoute();
  }

  formatUrl(e: string){
    return e.toLowerCase()
        .replace(/ +(?= )/g, '')
        .replace(/- | - | -| /gi, '-')
        .replace(/-+(?=)/g, '-');
  }

  locFormatRoute() {
    if (this.app) {
      let subItem = this.insSidebarItemEl.closest('ins-sidebar-item[with-submenu]') as any;
      let formattedUrl = (subItem) ? `${subItem.label}/${this.label}` : this.label;
      formattedUrl = this.formatUrl(formattedUrl);
      return '#/app/' + formattedUrl;
    }
    return this.link;
  }

  mouseLeaveHandler(){
    let insAdminEl = document.querySelector('body');

    if (insAdminEl && insAdminEl.className.includes('mini')) {
      this.hideSubMenu();
    }
  }

  toggleTooltip(event: MouseEvent, state: boolean){
    this.didHover.emit({
      x: (event.target as HTMLElement).getBoundingClientRect().right, y:  (event.target as HTMLElement).getBoundingClientRect().top, label: this.label, state: state
    });
  }

  // ---------------------------------------------------------------------------
  // v6
  // ---------------------------------------------------------------------------

  private v6Click = (e: MouseEvent) => {
    if (this.withSubmenu) {
      e.preventDefault();
      if (this.railEl) this.railEl.toggleFlyout(this.insSidebarItemEl as any);
      return;
    }
    // Plain and `app` items: let the anchor navigate. The legacy render has no click handler on
    // these either; ins-sidebar's onhashchange matches the new hash to this item and routes it.
    // Calling routePageHandler(event) here preventDefault-ed the anchor and killed navigation.
    if (this.externalLink) return;
    // Two cases produce no hashchange the rail could resolve: Dashboard (`href="#"`, and no item
    // carries landing-page on the seeded index menu) and a re-click on the current page. Route
    // those here without the event, so the anchor still navigates and the marker still moves.
    const target = this.app ? this.formattedRoute : (this.link || '#');
    if (target === '#' || target === '' || target === window.location.hash) this.routePageHandler();
  };

  private v6KeyDown = (e: KeyboardEvent) => {
    if (this.withSubmenu && (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (this.railEl) this.railEl.toggleFlyout(this.insSidebarItemEl as any);
    }
  };

  renderV6(){
    // Nested items are rendered by the parent rail's flyout; keep them in the DOM but unrendered.
    if (this.v6Nested || !this.label) {
      return <Host class="iia-rail-item--nested" hidden></Host>;
    }

    const glyph = glyphForLegacyIcon(this.icon);
    const isDashboard = this.icon === 'icon-dashboard' || this.landingPage;
    const collapsed = this.v6Collapsed;
    const href = this.externalLink ? (this.link || '#') : (this.app ? this.formattedRoute : (this.link || '#'));

    return (
      <Host class={{ 'iia-rail-item': true, 'is-active': !!this.isActive, 'has-submenu': !!this.withSubmenu, 'iia-rail-item--dashboard': isDashboard }}
            onMouseEnter={() => this.railEl && this.railEl.railItemEnter(this.insSidebarItemEl)}>
        <span class="iia-rail-item__marker" aria-hidden="true"></span>
        <a class="iia-rail-item__link"
           href={href}
           target={this.externalLink ? '_blank' : undefined}
           rel={this.externalLink ? 'noopener noreferrer' : undefined}
           aria-label={this.label}
           aria-current={this.isActive ? 'page' : undefined}
           aria-haspopup={this.withSubmenu ? 'menu' : undefined}
           aria-expanded={this.withSubmenu ? (this.v6FlyoutOpen && this.isActiveFlyout() ? 'true' : 'false') : undefined}
           onClick={this.v6Click}
           onKeyDown={this.v6KeyDown}>
          <span class="iia-rail-item__group">
            <span class="iia-rail-item__icon">
              {glyph
                ? [
                    <svg viewBox="0 0 256 256" width="16" height="16" fill="currentColor" aria-hidden="true" class="iia-rail-item__glyph iia-rail-item__glyph--reg"><path d={glyph.r}></path></svg>,
                    glyph.f
                      ? <svg viewBox="0 0 256 256" width="16" height="16" fill="currentColor" aria-hidden="true" class="iia-rail-item__glyph iia-rail-item__glyph--fill"><path d={glyph.f}></path></svg>
                      : null,
                  ]
                : <i class={`${this.icon} iia-rail-item__fonticon`} aria-hidden="true"></i>}
            </span>
            <span class={{ 'iia-rail-item__label': true, 'is-hidden': collapsed }}>{this.label}</span>
          </span>
          {this.withSubmenu && !collapsed
            ? <svg viewBox="0 0 256 256" width="10" height="10" fill="currentColor" aria-hidden="true" class="iia-rail-item__chevron"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg>
            : null}
        </a>
        {/* Children stay in the light DOM for routing; the flyout renders them. */}
        <div class="iia-rail-item__children" hidden><slot /></div>
      </Host>
    );
  }

  private isActiveFlyout(){
    // The rail exposes which item owns the open flyout through the flyout label; cheap check by label.
    const fly = this.railEl && this.railEl.querySelector('.iia-flyout') as HTMLElement;
    return !!(fly && fly.getAttribute('aria-label') === this.label);
  }

  render(){
    if (this.v6) return this.renderV6();

    if (this.withSubmenu) {
      return (
        <div class={`ins-sidebar-item-wrap
          ${this.isActive ? 'active': ''}
          ${this.icon ? '' : 'no-icon'}` }
          onMouseEnter={(event) => this.toggleTooltip(event, true)}
          onMouseLeave={(event) => this.toggleTooltip(event, false)}>

          <div class="ins-ripple-button">

            <a onClick={() => this.showSubMenu()}
              class="ins-ripple-link">

              <i class={`fas ${this.icon}`}></i>
              <span class="ins-sidebar-item-label">{this.label}</span>
              <i class="fas icon-chevron-right"></i>
            </a>
          </div>

          <div class="relative-wrap">
            <div class={`submenu-wrap ${this.submenuVisible ? 'is-active':''}`}
              onMouseLeave={() => this.mouseLeaveHandler()}>

              <div class="btn-nav-wrap">
                <button class="btn-nav" onClick={() => this.hideSubMenu()}>
                  <i class="fas icon-chevron-left"></i>
                  <span>{this.label}</span>
                </button>
              </div>
              <slot />
            </div>
          </div>
        </div>
      )
    } else {
      if (this.label !== ""){
        return (
          <div class={`ins-sidebar-item-wrap
            ${this.isActive ? 'active': ''}
            ${this.icon ? '' : 'no-icon'}`}
            onMouseEnter={(event) => this.toggleTooltip(event, true)}
            onMouseLeave={(event) => this.toggleTooltip(event, false)}>

            <div class="ins-ripple-button">
              {this.app ?
                <a class="ins-ripple-link"
                  href={`${this.formattedRoute}`}>

                  <i class={`fas ${this.icon}`}></i>
                  <span class="ins-sidebar-item-label">{this.label}</span>
                </a>
                : this.externalLink ?
                  <a class="ins-ripple-link updated"
                    href={`${this.formattedRoute}`} target="_blank">

                    <i class={`fas ${this.icon}`}></i>
                    <span class="ins-sidebar-item-label">{this.label}<span class={`ext-icon ${this.externalLinkIcon}`}></span></span>
                  </a>
                  :
                  <a class="ins-ripple-link"
                  href={this.link ? this.link : ''}>

                  <i class={`fas ${this.icon}`}></i>
                  <span class="ins-sidebar-item-label">{this.label}</span>
                </a>
              }
            </div>
          </div>
        )
      }
    }
  }
}
