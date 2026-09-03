import { h, Component, Prop, Event, EventEmitter, State, Method, Element } from '@stencil/core';

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
  // @Prop({ context: 'formatUrl' }) formatUrl: any = () => {};
  // @Prop({ context: 'addRippleEffect' }) addRippleEffect: any;

  @State() submenuVisible: boolean;
  @State() isActive: boolean;
  @State() formattedRoute: string;

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
    // await this.hideSiblingsMenu();

    let body = document.querySelector('body');
    body.style.overflowY = null;

    if (this.app) {
      document.querySelector('body').style.overflowY = 'hidden';
    }

    const mq = window.matchMedia("(max-width: 1260px)");
    let menuBar = document.querySelector('ins-sidebar') as any;
    if (mq.matches) {
      document.querySelector('body').classList.add('mini');
      menuBar.minimise();
    }

    return { crumbs }
  }

  toggleMenuNav() {
    let insHeaderEl = document.querySelector('ins-header') as any,
        menuNav = insHeaderEl.querySelector('.full-width-navs');

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
    this.toggleSidebar();
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
  }

  componentDidLoad(){
    let target = this.insSidebarItemEl.querySelector('.ins-ripple-button') as HTMLElement;
    this.insSidebarItemEl.addEventListener('click', e => {
      e.stopPropagation();
      let tgt = e.target as any;
      let parent = tgt.parentNode;
      if (!parent.classList.contains('btn-nav')){
        this.addRippleEffect(e, target);
      }
    });

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insSidebarItemEl);
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

  render(){

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
