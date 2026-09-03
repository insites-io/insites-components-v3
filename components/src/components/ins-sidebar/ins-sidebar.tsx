import { h, Component, Prop, Event, EventEmitter, State, Method, Listen, Element } from "@stencil/core";

@Component({ tag: 'ins-sidebar' })
export class InsSidebar {
  @Element() insSidebarEl: HTMLElement;
  @Event() insSidebarAction: EventEmitter<any>;
  @Event() didLoad: EventEmitter<void>;

  @Prop() hasLoad: string;
  @Prop({ mutable: true }) fullLogo: string;
  @Prop({ mutable: true }) iconLogo: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @State() minimised: boolean = false;
  @State() noFooter: boolean = false;

  baseURL = "https://components.insites.io/assets/images";
  sidebarItemEls: NodeListOf<HTMLInsSidebarItemElement>;
  insRenderer: HTMLInsRendererElement;
  insHeaderUserEl: HTMLInsHeaderUserElement;
  reroute: boolean = false;

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
  }

  componentDidLoad(){
    this.sidebarItemEls = this.insSidebarEl.querySelectorAll('ins-sidebar-item');
    this.insRenderer = document.querySelector('ins-renderer');
    this.insHeaderUserEl = document.querySelector('ins-header-user');

    this.checkHash(true);

    window.onhashchange = async () => {
      await this.checkHash();
    };

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insSidebarEl);
    }
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

    this.updateRoute([{
      link: insHeaderUserEl.profileLink,
      app: insHeaderUserEl.app,
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
      if (mq.matches) insSidebarItem.showSubMenu();
    }
  }

  @Listen('didHover')
  didHoverEventHandler(event: CustomEvent) {
    const insSidebarContainerEl = this.insSidebarEl.querySelector('.ins-sidebar') as HTMLElement;
    const insSidebarTooltipEl = insSidebarContainerEl.querySelector('.ins-sidebar-item-tooltip') as HTMLElement;
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
  }

  @Method()
  async maximise(){
    this.minimised = false;
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

  render() {
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
