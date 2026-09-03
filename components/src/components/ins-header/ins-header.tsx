import { h, Component, State, Prop, Element, Method, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-header' })
export class InsHeader {
  @Element() insHeaderEl: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) supportLink: string;
  @Prop({ mutable: true }) hasMenuToggle: boolean = true;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @State() sidebarMini: boolean;
  @State() hasSidebar: boolean;
  @State() insAdminEl: HTMLElement;
  @State() insNotificationsEl: HTMLInsNotificationsElement;
  @State() insSidebarEl: HTMLInsSidebarElement;

  insNavEl: HTMLElement;
  @State() fullScreenState: boolean;

  componentWillLoad() {
    this.sidebarMini = false;
    this.fullScreenState = false;
    this.insAdminEl = document.querySelector('body');
    this.insNotificationsEl = document.querySelector('ins-notifications');
    this.insSidebarEl = document.querySelector('ins-sidebar');
  }

  componentDidLoad() {
    let $this = this;
    this.insNavEl = document.querySelector('.full-width-navs') as HTMLElement;

    window.onresize = function() {
      $this.toggleMinimise();
    };

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insHeaderEl);
    }
  }

  toggleMinimise() {
    const mq = window.matchMedia( "(max-width: 1260px)" );
    if (mq.matches) {
      if (this.insAdminEl) this.insAdminEl.classList.add('mini');
      if (!this.sidebarMini && this.insSidebarEl) {
        this.sidebarMini = true;
        this.insSidebarEl.minimise();
      }
    } else if (this.sidebarMini) {
      this.toggleSidebar();
    }
  }

  @Method()
  async toggleSidebar(){
    if (this.hasClass(this.insNavEl, 'active')) {
      this.insNavEl.classList.remove('active');
      this.insHeaderEl.querySelector('.ellipsis').classList.remove('active');
    }

    this.sidebarMini = !this.sidebarMini;
    if (this.insSidebarEl){
      this.sidebarMini
        ? this.insSidebarEl.minimise()
        : this.insSidebarEl.maximise();
    }

    this.insAdminEl.classList.add('loading');
    setTimeout(() => {
      this.insAdminEl.classList.remove('loading');
    }, 450);

    if (this.insAdminEl){
      this.insAdminEl.classList.toggle('mini');
    }

    let insAdminEl = document.querySelector('body');
    let submenuWrapEls = document.querySelectorAll('ins-sidebar-item');
    let footerMenus = document.querySelectorAll('ins-sidebar-footer-menu');

    if (insAdminEl.className.includes('mini')){
      for (let i = 0; i < submenuWrapEls.length; ++i) {
        let submenuWrap = submenuWrapEls[i];
        submenuWrap.hideSubMenu();
      }
      for (let i = 0; i < footerMenus.length; ++i) {
        let footerMenu = footerMenus[i];
        footerMenu.hideMenu();
      }
    }

  }

  @Method()
  async toggleNav(){
    if (!this.hasClass(this.insAdminEl, 'mini')) {
      this.toggleSidebar();
    }
    this.insNavEl.classList.toggle('active');
    this.insHeaderEl.querySelector('.ellipsis').classList.toggle('active');
  }

  toggleFullScreen(){
    let doc = document as any;

    if (this.fullScreenState) {
      if (doc.cancelFullScreen) {
        doc.cancelFullScreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitCancelFullScreen) {
        doc.webkitCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      let el = doc.documentElement;
      let rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      rfs.call(el);
    }

    this.fullScreenState = !this.fullScreenState;
  }

  toggleNotifications(){
    this.insNotificationsEl.toggleNotificationshandler();
  }

  checkURL(url: string){
      if (url.includes('https://')){
          return url;
      } else if (url.includes('http://')){
          return url;
      } else {
          return `//${url}`;
      }
  }

  goToSupportLink() {
    window.open(this.checkURL(this.supportLink))
  }

  hasClass(element: HTMLElement, cls: string){
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }

  render() {
    return (
      <div class="ins-header-wrap">
        {this.insSidebarEl && this.hasMenuToggle ?
        <button id="insSidebarToggler" class="burger"
          onClick={() => this.toggleSidebar()}>
          <span></span>
          <span></span>
          <span></span>
        </button> : ''}

        <div class="full-width-navs">
          <div class="ins-header-buttons">
            <button class="icon-nav" onClick={() => this.toggleFullScreen()}>
              {this.fullScreenState ?
              <i class="icon-minimize-1" title="Minimise View"></i> :
              <i class="icon-maximize" title="Maximise View"></i>}
            </button>

            {this.supportLink ?
              <button class="icon-nav"
                onClick={() => this.goToSupportLink()}>
                <i class="icon-support-1" title="Open Support Page"></i>
              </button>
            : ''}

            {/* TODO: include on styleguide */}

            {this.insNotificationsEl ?
              <button class="icon-nav" onClick={() => this.toggleNotifications()}>
                <i class="icon-notification-1" title="Open Notifications"></i>
              </button>
            : ''}
          </div>

          <slot />
        </div>

        <div class="minified-navs">
          <button id="insHeaderToggler" class="ellipsis" onClick={() => this.toggleNav()}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    )
  }
}
