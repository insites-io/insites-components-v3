import { h, Component, State, Prop, Element, Method, Event, EventEmitter, Listen, Host } from "@stencil/core";
import { PHOSPHOR_SHELL_ICONS } from '../../utils/phosphor-shell-icons';

/**
 * IIA v6 shell header (TW#26371963) is an ADDITIVE variant of this component.
 *
 * `variant="v6"` renders the Admin Shell v1.5 top bar: 56px dark chrome carrying the
 * rail toggle, logo, the support pill, the environment chip with the instance
 * switcher, view-frontend, theme toggle, help menu and account menu, plus the 40px
 * breadcrumb bar beneath it, the keyboard-shortcuts dialog and the production
 * confirmation. The default render is unchanged. `toggleSidebar()` keeps its
 * contract because adminScripts and ins-sidebar-item both call it.
 *
 * The instance switcher is presentational this release: the roster comes from
 * `instances` (JSON) or, absent that, the single current instance built from the
 * instance-* attributes. There is no Console endpoint that lists a user's
 * instances yet, so Switch emits `insInstanceSwitch` and navigates nowhere.
 *
 * Tooltips use the shared `data-tip` mechanism rather than a nested component; the
 * design's 150ms delay / instant hide / suppress-after-click live in CSS on the
 * `iia-hdr` scope.
 */
@Component({ tag: 'ins-header' })
export class InsHeader {
  @Element() insHeaderEl: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) supportLink: string;
  @Prop({ mutable: true }) hasMenuToggle: boolean = true;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  // ---- v6 ---------------------------------------------------------------
  /** '' keeps the original rendering. 'v6' is the Admin Shell v1.5 header. */
  @Prop({ mutable: true }) variant: string = '';
  @Prop() logoSrc: string = '';
  @Prop() logoAlt: string = 'Insites';
  @Prop() homeHref: string = '#/';
  /** 'staging' | 'production' — this instance's tier. */
  @Prop() environment: string = 'staging';
  @Prop() instanceName: string = '';
  @Prop() instanceDomain: string = '';
  @Prop() instanceId: string = 'current';
  /** Optional JSON roster: [{ id, name, env, domain }]. Absent: the current instance alone. */
  @Prop() instances: string = '';
  @Prop() userName: string = '';
  @Prop() userEmail: string = '';
  @Prop() profileHref: string = '#/my-profile';
  @Prop() logoutHref: string = '/admin/sessions/logout';
  @Prop() docsHref: string = 'https://docs.insites.io/';
  @Prop() consoleHref: string = 'https://console.insites.io/';
  @Prop() frontendHref: string = '/';
  @Prop() themeEndpoint: string = '/insites/core/themes';
  @Prop() lockEndpoint: string = '/api/sessions';
  @Prop() lockFormName: string = 'modules/insites_core/lock_admin';
  /** Show the "Show help panels" restore row in the account menu. */
  @Prop() helpRestore: boolean = true;
  /** Whether help panels are currently dismissed (restore row is actionable). Read from the preference
   *  store on load; a host may still set it. */
  @Prop({ mutable: true }) helpPanelsDismissed: boolean = false;
  /** Administrator-preferences endpoint: holds the dismissed help panels and the production-switch
   *  "Don't show me again" choice, per administrator, across devices. */
  @Prop() preferencesEndpoint: string = '/insites/core/administrator-preferences';
  /** Presence label on the support pill. */
  @Prop() supportPresence: string = 'Online';
  @Prop() supportReplyLine: string = 'Replies in ~2h';

  @Event() insInstanceSwitch: EventEmitter<{ from: string; to: string; env: string }>;
  @Event() insThemeChange: EventEmitter<{ theme: string }>;
  @Event() insLockScreen: EventEmitter<void>;
  @Event() insHelpRestore: EventEmitter<void>;
  @Event() insShortcutsOpen: EventEmitter<void>;
  @Event() insSupportOpen: EventEmitter<void>;

  @State() sidebarMini: boolean;
  @State() hasSidebar: boolean;
  @State() insAdminEl: HTMLElement;
  @State() insNotificationsEl: HTMLInsNotificationsElement;
  @State() insSidebarEl: HTMLInsSidebarElement;

  insNavEl: HTMLElement;
  @State() fullScreenState: boolean;

  // v6 state
  @State() dark: boolean = false;
  @State() envOpen: boolean = false;
  @State() helpOpen: boolean = false;
  @State() userOpen: boolean = false;
  @State() shortcutsOpen: boolean = false;
  @State() prodConfirm: { id: string; name: string } | null = null;
  @State() prodDontShow: boolean = false;
  /** The one toast the shell shows (design: green tick, message, timer bar). */
  @State() toast: { text: string; kind: string; id: number } | null = null;
  private toastTimer: any = null;
  private static readonly PREF_HELP = 'help_panels:dismissed';
  private static readonly PREF_PROD_WARNING = 'switcher:skip_production_warning';
  @State() envQuery: string = '';
  @State() crumbs: Array<{ label: string; link?: string; app?: boolean; withSubmenu?: boolean }> = [];
  @State() hash: string = (typeof window !== 'undefined' && window.location.hash) || '';
  @State() mobile: boolean = false;   // < 768
  @State() narrow: boolean = false;   // < 1024
  @State() tight: boolean = false;    // < 640
  @State() unread: number = 0;
  @State() umHoverY: number = 0; @State() umHoverH: number = 40; @State() umHoverOn: boolean = false;
  @State() hmHoverY: number = 0; @State() hmHoverH: number = 40; @State() hmHoverOn: boolean = false;
  @State() envHoverY: number = 0; @State() envHoverH: number = 52; @State() envHoverOn: boolean = false;
  @State() envFocusIdx: number = -1;

  private mqMobile: MediaQueryList; private mqNarrow: MediaQueryList; private mqTight: MediaQueryList; private mqOverlay: MediaQueryList;
  private onMq = () => { this.mobile = this.mqMobile.matches; this.narrow = this.mqNarrow.matches; this.tight = this.mqTight.matches; };
  /**
   * Design: two rail states. `expanded` is the desktop preference; below 1280px the rail is always
   * the 64px column and an expanded rail is a drawer over the content. Crossing 1280 never loses
   * the desktop preference: entering overlay collapses the rail, leaving it restores whatever the
   * user last chose at desktop width. Toggles made inside overlay mode drive the drawer only.
   */
  private deskExpanded = true;
  private onOverlay = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      this.deskExpanded = !this.sidebarMini;
      if (!this.sidebarMini) this.toggleSidebar();
    } else if (this.sidebarMini === this.deskExpanded) {
      this.toggleSidebar();
    }
  };
  private envListEl: HTMLElement | null = null;
  private umListEl: HTMLElement | null = null;
  private hmListEl: HTMLElement | null = null;
  private envMenuEl: HTMLElement | null = null;
  private lastFocus: HTMLElement | null = null;

  get isV6() { return this.variant === 'v6'; }

  componentWillLoad() {
    this.sidebarMini = false;
    this.fullScreenState = false;
    this.insAdminEl = document.querySelector('body');
    this.insNotificationsEl = document.querySelector('ins-notifications');
    this.insSidebarEl = document.querySelector('ins-sidebar');

    if (this.isV6) {
      this.dark = document.documentElement.getAttribute('data-theme') === 'dark';
      this.sidebarMini = document.body.classList.contains('mini');
      this.mqMobile = window.matchMedia('(max-width: 767px)');
      this.mqNarrow = window.matchMedia('(max-width: 1023px)');
      this.mqTight = window.matchMedia('(max-width: 639px)');
      this.mqOverlay = window.matchMedia('(max-width: 1279px)');
      [this.mqMobile, this.mqNarrow, this.mqTight].forEach(m => m.addEventListener('change', this.onMq));
      this.mqOverlay.addEventListener('change', this.onOverlay);
      this.onMq();
      this.deskExpanded = this.mqOverlay.matches ? true : !this.sidebarMini;
      try {
        const stored = JSON.parse(window.localStorage.getItem('ins_breadcrumbs') || 'null');
        if (Array.isArray(stored)) this.crumbs = stored;
      } catch (e) { /* ignore */ }
    }
  }

  componentDidLoad() {
    let $this = this;
    this.insNavEl = document.querySelector('.full-width-navs') as HTMLElement;

    if (!this.isV6) {
      window.onresize = function() {
        $this.toggleMinimise();
      };
    } else {
      this.bindIntercom();
      this.readPreferences();
      // ins-sidebar's own load check stamps body.mini below 1260px without telling anyone, and may run
      // before componentWillLoad read it; re-sync, then apply the 1280px overlay rule on top.
      this.sidebarMini = document.body.classList.contains('mini');
      if (this.sidebarMini && this.insSidebarEl) this.insSidebarEl.minimise();
      if (this.mqOverlay) {
        if (this.mqOverlay.matches) { if (!this.sidebarMini) this.toggleSidebar(); }
        else this.deskExpanded = !this.sidebarMini;
      }
    }

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insHeaderEl);
    }
  }

  disconnectedCallback(){
    if (this.isV6) {
      [this.mqMobile, this.mqNarrow, this.mqTight].forEach(m => m && m.removeEventListener('change', this.onMq));
      if (this.mqOverlay) this.mqOverlay.removeEventListener('change', this.onOverlay);
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
    if (this.insNavEl && this.hasClass(this.insNavEl, 'active')) {
      this.insNavEl.classList.remove('active');
      const ell = this.insHeaderEl.querySelector('.ellipsis');
      if (ell) ell.classList.remove('active');
    }

    this.sidebarMini = !this.sidebarMini;
    if (this.isV6 && this.mqOverlay && !this.mqOverlay.matches) this.deskExpanded = !this.sidebarMini;
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
      this.insAdminEl.classList.toggle('mini', this.sidebarMini);
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
    if (this.insNavEl) this.insNavEl.classList.toggle('active');
    const ell = this.insHeaderEl.querySelector('.ellipsis');
    if (ell) ell.classList.toggle('active');
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

  // ---------------------------------------------------------------------------
  // v6 behaviour
  // ---------------------------------------------------------------------------

  /** Breadcrumb bar follows ins-renderer's route: the rail's chain, available before any SPA has mounted. */
  @Listen('insRouteChange', { target: 'document' })
  onRouteChange(e: CustomEvent<{ crumbs: any[] }>) {
    if (!this.isV6) return;
    this.crumbs = Array.isArray(e.detail && e.detail.crumbs) ? e.detail.crumbs : [];
  }

  /** …and then the page's own trail wins. Every module SPA calls ins-breadcrumbs.updateCrumbs() with the real
   *  route (Home › CRM › Contacts › …), which is deeper and fresher than the rail's chain, and it fires on every
   *  in-app navigation the rail never sees. Its own rendering is hidden under the v6 shell; this bar draws it. */
  @Listen('insBreadcrumbsChange', { target: 'document' })
  onBreadcrumbsChange(e: CustomEvent<{ crumbs: any[] }>) {
    if (!this.isV6) return;
    if (Array.isArray(e.detail && e.detail.crumbs)) this.crumbs = e.detail.crumbs;
  }

  /** The dashboard route (`#/`) never routes through the rail, so the bar also watches the hash. */
  @Listen('hashchange', { target: 'window' })
  onHashChange() {
    if (this.isV6) this.hash = window.location.hash || '';
  }

  @Listen('keydown', { target: 'document' })
  onDocKey(e: KeyboardEvent) {
    if (!this.isV6) return;
    const t = e.target as HTMLElement;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (e.key === 'Escape') {
      if (this.prodConfirm) { this.prodConfirm = null; return; }
      if (this.shortcutsOpen) { this.shortcutsOpen = false; this.restoreFocus(); return; }
      if (this.envOpen || this.helpOpen || this.userOpen) { this.closeMenus(); this.restoreFocus(); return; }
      return;
    }
    if (typing) return;
    if (e.key === '[') { e.preventDefault(); this.toggleSidebar(); }
    else if (e.key === '?') { e.preventDefault(); this.openShortcuts(); }
  }

  @Listen('mousedown', { target: 'document' })
  onDocMouseDown(e: MouseEvent) {
    if (!this.isV6) return;
    if (!(this.envOpen || this.helpOpen || this.userOpen)) return;
    const t = e.target as Node;
    if (this.insHeaderEl.contains(t)) return;
    this.closeMenus();
  }

  private closeMenus() {
    this.envOpen = false; this.helpOpen = false; this.userOpen = false;
    this.umHoverOn = false; this.hmHoverOn = false; this.envHoverOn = false; this.envFocusIdx = -1;
  }

  private restoreFocus() {
    if (this.lastFocus && document.contains(this.lastFocus)) this.lastFocus.focus();
    this.lastFocus = null;
  }

  private rememberFocus(e?: Event) {
    this.lastFocus = (e && e.currentTarget as HTMLElement) || (document.activeElement as HTMLElement);
  }

  /** Only one header popover is open at a time (design). */
  private toggleMenu(which: 'env' | 'help' | 'user', e?: Event) {
    const was = which === 'env' ? this.envOpen : which === 'help' ? this.helpOpen : this.userOpen;
    this.closeMenus();
    if (!was) {
      this.rememberFocus(e);
      if (which === 'env') { this.envOpen = true; this.envQuery = ''; requestAnimationFrame(() => this.envMenuEl && this.envMenuEl.focus()); }
      if (which === 'help') this.helpOpen = true;
      if (which === 'user') this.userOpen = true;
    }
    this.suppressTip(e);
  }

  /** Design: a header tooltip hides the instant its icon is clicked, and stays hidden until the pointer leaves. */
  private suppressTip(e?: Event) {
    const btn = e && (e.currentTarget as HTMLElement);
    if (!btn || !btn.hasAttribute('data-tip')) return;
    btn.setAttribute('data-tip-off', '');
    const clear = () => { btn.removeAttribute('data-tip-off'); btn.removeEventListener('mouseleave', clear); };
    btn.addEventListener('mouseleave', clear);
  }

  private openShortcuts(e?: Event) {
    this.closeMenus();
    this.rememberFocus(e);
    this.shortcutsOpen = true;
    this.insShortcutsOpen.emit();
  }

  private csrfHeaders() {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    return {
      'X-CSRF-Token': meta ? meta.content : '',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /** Single owner of the theme flip. Mirrors adminScripts: html + renderer iframe, then persist. */
  private toggleDark = (e?: Event) => {
    const dark = !this.dark;
    this.dark = dark;
    const theme = dark ? 'dark' : 'light';
    const root = document.documentElement;
    root.classList.add('transition');
    window.setTimeout(() => root.classList.remove('transition'), 1000);
    root.setAttribute('data-theme', theme);
    const iframe = document.getElementById('insRendererFrame') as HTMLIFrameElement;
    try {
      const idoc = iframe && (iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document));
      if (idoc) idoc.documentElement.setAttribute('data-theme', theme);
    } catch (err) { /* cross-origin frame: nothing to do */ }
    this.insThemeChange.emit({ theme });
    fetch(this.themeEndpoint, { method: 'POST', headers: this.csrfHeaders(), body: JSON.stringify({ theme }), credentials: 'same-origin' }).catch(() => {});
    this.suppressTip(e);
  };

  /**
   * Locks the admin session: emits `insLockScreen`, ends the session through `lockEndpoint` and shows the
   * host's lock screen. The v1.5 design has no lock row, so the v6 chrome renders none; a host that keeps
   * the lock feature calls this method from its own trigger.
   */
  @Method()
  async lockScreen(): Promise<void> {
    this.closeMenus();
    this.insLockScreen.emit();
    await fetch(this.lockEndpoint, { method: 'DELETE', headers: this.csrfHeaders(), body: JSON.stringify({ form_configuration_name: this.lockFormName }), credentials: 'same-origin' })
      .then(r => {
        if (r.status === 204) {
          const wrap = document.getElementById('lockScreenWrap');
          if (wrap) wrap.classList.remove('unlocked');
          document.body.classList.add('locked');
        }
      }).catch(() => {});
  }

  private openSupport = (e?: Event) => {
    this.closeMenus();
    this.insSupportOpen.emit();
    const ic = (window as any).Intercom;
    if (typeof ic === 'function') ic('show');
    this.suppressTip(e);
  };

  private bindIntercom() {
    const ic = (window as any).Intercom;
    if (typeof ic !== 'function') return;
    try { ic('onUnreadCountChange', (n: number) => { this.unread = n || 0; }); } catch (err) { /* ignore */ }
  }

  // ---- administrator preferences (help panels, production warning) --------

  private async readPref(key: string): Promise<string | null> {
    try {
      const r = await fetch(`${this.preferencesEndpoint}?key=${encodeURIComponent(key)}`, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
      if (!r.ok) return null;
      const j = await r.json();
      const row = j && j.items && Array.isArray(j.items.results) ? j.items.results[0] : null;
      return row && row.value != null ? String(row.value) : null;
    } catch (e) { return null; }
  }

  private writePref(key: string, value: string) {
    return fetch(this.preferencesEndpoint, {
      method: 'POST', credentials: 'same-origin', headers: this.csrfHeaders(),
      body: JSON.stringify({ payload: { key, value } }),
    }).catch(() => { /* the in-memory state already reflects the choice */ });
  }

  private async readPreferences() {
    const [help, prod] = await Promise.all([this.readPref(InsHeader.PREF_HELP), this.readPref(InsHeader.PREF_PROD_WARNING)]);
    if (help != null) {
      try { const list = JSON.parse(help); this.helpPanelsDismissed = Array.isArray(list) && list.length > 0; } catch (e) { /* keep host value */ }
    }
    if (prod != null) this.prodDontShow = prod === 'true';
  }

  /** A help panel on the page was dismissed: light the restore row and confirm with the design's toast. */
  @Listen('insHelpDismiss', { target: 'document' })
  onHelpDismiss(e: CustomEvent<{ key: string; message: string }>) {
    if (!this.isV6) return;
    this.helpPanelsDismissed = true;
    this.showToast((e.detail && e.detail.message) || 'Help hidden for you. Restore it from your account menu, under Show help panels.');
  }

  private restoreHelp = () => {
    if (!this.helpPanelsDismissed) return;
    this.helpPanelsDismissed = false;
    this.closeMenus();
    this.writePref(InsHeader.PREF_HELP, '[]');
    this.insHelpRestore.emit();
    this.showToast('All dismissed help panels restored');
  };

  private setProdDontShow = (on: boolean) => {
    this.prodDontShow = on;
    this.writePref(InsHeader.PREF_PROD_WARNING, on ? 'true' : 'false');
  };

  // ---- toast (design: green tick, message, timer bar; docks to the bottom on phones) ----

  private showToast(text: string, kind: string = 'success') {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { text, kind, id: Date.now() };
    this.toastTimer = setTimeout(() => { this.toast = null; }, 4000);
  }

  private hideToast = () => {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = null;
  };

  // ---- instance roster ---------------------------------------------------

  private roster(): Array<{ id: string; name: string; env: string; domain: string }> {
    let list: any[] = [];
    if (this.instances) {
      try { const parsed = JSON.parse(this.instances); if (Array.isArray(parsed)) list = parsed; } catch (e) { list = []; }
    }
    if (!list.length) {
      list = [{ id: this.instanceId || 'current', name: this.instanceName || this.instanceDomain || 'This instance', env: this.environment, domain: this.instanceDomain }];
    }
    return list;
  }

  private envGroups() {
    const q = this.envQuery.trim().toLowerCase();
    const all = this.roster().filter(i => !q || (i.name || '').toLowerCase().includes(q) || (i.domain || '').toLowerCase().includes(q));
    const prod = all.filter(i => i.env === 'production');
    const stg = all.filter(i => i.env !== 'production');
    const groups = [];
    if (prod.length) groups.push({ label: 'Production', items: prod });
    if (stg.length) groups.push({ label: 'Staging', items: stg });
    return groups;
  }

  private requestSwitch = (inst: { id: string; name: string; env: string }) => {
    if (inst.id === this.instanceId) return;
    if (inst.env === 'production' && !this.prodDontShow) {
      this.prodConfirm = { id: inst.id, name: inst.name };
      return;
    }
    this.doSwitch(inst.id, inst.env);
  };

  private doSwitch(to: string, env: string) {
    this.prodConfirm = null;
    this.closeMenus();
    // Presentational this release: no Console instance-list API exists yet (see spec README). The toast
    // ("Now in <instance>.") fires only when a roster row other than this instance was chosen, so it stays
    // dormant until Console supplies one.
    this.insInstanceSwitch.emit({ from: this.instanceId, to, env });
    const target = this.roster().find(i => i.id === to);
    if (target && to !== this.instanceId) this.showToast(`Now in ${target.name}.`);
  }

  private envMenuKeyDown = (e: KeyboardEvent) => {
    const rows = this.envMenuEl ? Array.from(this.envMenuEl.querySelectorAll('[role="menuitemradio"]')) as HTMLElement[] : [];
    if (!rows.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const cur = rows.indexOf(document.activeElement as HTMLElement);
      let next = cur + (e.key === 'ArrowDown' ? 1 : -1);
      if (next < 0) next = rows.length - 1; if (next >= rows.length) next = 0;
      rows[next].focus();
    } else if (e.key === 'Enter') {
      const cur = document.activeElement as HTMLElement;
      if (rows.includes(cur)) { e.preventDefault(); cur.click(); }
    }
  };

  private pillTransition() {
    const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    return motionOK ? 'transform 240ms cubic-bezier(0.2,0,0,1),opacity 150ms cubic-bezier(0,0,0.2,1)' : 'opacity 150ms cubic-bezier(0,0,0.2,1)';
  }

  private slidePill(list: HTMLElement | null, row: HTMLElement, set: (y: number, h: number) => void) {
    if (!list) return;
    const y = row.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    set(y, row.offsetHeight);
  }

  private initials() {
    const n = (this.userName || '').trim();
    if (!n) return '';
    return n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  private static isHomeCrumb(x: any) {
    if (!x) return false;
    // A module crumb with a submenu has an empty link, so emptiness alone never means home.
    const link = String(x.link || '').replace(/^#/, '');
    return /dashboard/i.test(link) || /^(home|dashboard)$/i.test(String(x.label || '').trim());
  }

  componentDidRender() {
    if (!this.isV6) return;
    // Design: the breadcrumb bar lives in the content column beside the rail. The bar is positioned from
    // this host; the shell pads its content column down while a bar is showing.
    const shell = document.querySelector('.iia-shell--v6');
    if (shell) shell.classList.toggle('iia-shell--crumbs', !!this.crumbView());
  }

  private static crumbPath(link: any) {
    // Crumb links arrive as "/crm/contacts", "#/crm/contacts" or "" (a module heading with a submenu).
    const s = String(link || '').replace(/^#/, '').replace(/\/+$/, '');
    if (!s || s === '#') return '';
    return s.startsWith('/') ? s : '/' + s;
  }

  private crumbView() {
    // Design: the bar exists only off the dashboard and reads Home › module › section › …. The bar draws its
    // own Home, so a leading home entry is dropped, and the leaf the v5 pages record twice (their own
    // "hide the last crumb" trick) is collapsed. Every entry with a route is a link, except the one that IS
    // the current page; a module heading (withSubmenu, no route) is plain text, as in the v5 bar.
    const hash = this.hash.replace(/^#/, '');
    if (hash === '' || hash === '/' || /^\/dashboard\/?$/i.test(hash)) return null;
    const raw = (this.crumbs || []).filter(Boolean);
    const c = raw.filter((x, i) => {
      if (i === 0 && InsHeader.isHomeCrumb(x)) return false;
      const prev = raw[i - 1];
      return !(prev && prev.label === x.label);
    });
    if (!c.length) return null;
    if (c.length === 1 && InsHeader.isHomeCrumb(c[0])) return null;
    const here = InsHeader.crumbPath(hash);
    return c.map((x, i) => {
      const path = InsHeader.crumbPath(x.link);
      const routable = !!path && !x.withSubmenu;
      const current = i === c.length - 1 && (!routable || path === here);
      return { label: String(x.label || ''), path, routable, current };
    });
  }

  private goHome = (e: Event) => { e.preventDefault(); window.location.hash = '#/'; };
  private goCrumb = (e: Event, path: string) => {
    e.preventDefault();
    if (path) window.location.hash = '#' + path;
  };

  private icon(name: string, size = 16, cls = '') {
    const g = PHOSPHOR_SHELL_ICONS[name];
    if (!g) return null;
    return <svg viewBox="0 0 256 256" width={size} height={size} fill="currentColor" aria-hidden="true" class={cls}><path d={g.r}></path></svg>;
  }

  // ---------------------------------------------------------------------------
  // v6 render
  // ---------------------------------------------------------------------------

  renderV6() {
    const open = !this.sidebarMini;
    const envProd = this.environment === 'production';
    const chip = this.mobile ? (envProd ? 'PRD' : 'STG') : (envProd ? 'Production' : 'Staging');
    const envLabel = envProd ? 'Production' : 'Staging';
    const groups = this.envGroups();
    const roster = this.roster();
    const searchOn = roster.length > 5;
    const noMatches = searchOn && !!this.envQuery.trim() && groups.length === 0;
    const crumbs = this.crumbView();
    const infoText = (this.narrow ? 'Tap an instance to switch to it. ' : '') + (envProd
      ? 'Production is live. Changes here reach real visitors and send real emails.'
      : 'Staging is a test copy. Changes never reach the live site and no emails are sent.');
    const shortcutRows = [
      { label: 'Collapse or expand the menu', keys: '[' },
      { label: 'Close menus and panels', keys: 'Esc' },
      { label: 'Keyboard shortcuts', keys: '?' },
      { label: 'Move between instances, switcher open', keys: '↑ ↓' },
      { label: 'Select an instance, switcher open', keys: 'Enter' },
    ];
    let rowIdx = 0;

    return (
      <Host class={{ 'iia-hdr-host': true, 'iia-hdr-host--raised': this.envOpen || this.userOpen }}>
        <header class={{ 'iia-hdr': true, 'iia-hdr--no-chat': this.mobile }} data-screen-label="Top bar">
          {/* left: rail toggle + logo */}
          <div class="iia-hdr__left">
            <button type="button" class="iia-hdr__toggle" data-tip={open ? 'Collapse menu' : 'Expand menu'}
                    aria-label={open ? 'Collapse menu' : 'Expand menu'} aria-expanded={String(open)} aria-controls="iia-rail"
                    onClick={(e) => { this.toggleSidebar(); this.suppressTip(e); }}>
              <i class={open ? 'icon-menu-collapse' : 'icon-menu-expand'} aria-hidden="true"></i>
            </button>
            <a class="iia-hdr__logo" href={this.homeHref} aria-label="Home">
              {this.logoSrc ? <img src={this.logoSrc} alt={this.logoAlt} /> : <span class="iia-hdr__logo-text">{this.logoAlt}</span>}
            </a>
          </div>

          {/* centre: support pill (>= 768) */}
          {!this.mobile ? (
            <button type="button" class="iia-chat" aria-haspopup="dialog" aria-label={`Open support chat, ${this.unread} unread messages`} onClick={this.openSupport}>
              <i class="icon-message-circle" aria-hidden="true"></i>
              <span>Ask us anything</span>
              <span class="iia-chat__presence"><span class="iia-chat__dot" aria-hidden="true"></span>{this.supportPresence}</span>
              {this.unread > 0 ? <span class="iia-chat__badge iia-chat__badge--lg" aria-hidden="true">{this.unread}</span> : null}
            </button>
          ) : null /* below 768px the grid is `auto 1fr` with two children; a placeholder here would wrap the right cluster onto a second row */}

          {/* right cluster */}
          <div class="iia-hdr__right">
            <div class="iia-env">
              <button type="button" class="iia-env__trigger" data-env-trigger="true" data-tip="Switch instance"
                      aria-haspopup="menu" aria-expanded={String(this.envOpen)}
                      aria-label={`Switch instance, current: ${this.instanceName || this.instanceDomain}, ${envLabel}`}
                      onClick={(e) => this.toggleMenu('env', e)}>
                <span class={{ 'iia-env__chip': true, 'iia-env__chip--production': envProd }}>{chip}</span>
                <svg viewBox="0 0 256 256" width="12" height="12" fill="currentColor" aria-hidden="true" class="iia-env__caret"><path d="M181.66 170.34a8 8 0 0 1 0 11.32l-48 48a8 8 0 0 1-11.32 0l-48-48a8 8 0 0 1 11.32-11.32L128 212.69l42.34-42.35a8 8 0 0 1 11.32 0Zm-96-84.68L128 43.31l42.34 42.35a8 8 0 0 0 11.32-11.32l-48-48a8 8 0 0 0-11.32 0l-48 48a8 8 0 0 0 11.32 11.32Z"></path></svg>
              </button>

              {this.envOpen ? [
                <div class="iia-scrim iia-scrim--menu" aria-hidden="true" onClick={() => this.closeMenus()}></div>,
                <div role="menu" aria-label="Instances" tabIndex={-1} class={{ 'iia-switcher': true, 'iia-switcher--docked': this.tight }}
                     ref={el => this.envMenuEl = el} onKeyDown={this.envMenuKeyDown}>
                  <div class="iia-switcher__title">Switch instance</div>
                  {searchOn ? (
                    <div class="iia-switcher__search">
                      <div class="iia-switcher__searchbox">
                        <i class="icon-search-1" aria-hidden="true"></i>
                        <input value={this.envQuery} onInput={(e) => { this.envQuery = (e.target as HTMLInputElement).value; this.envHoverOn = false; }} placeholder="Search instances" aria-label="Search instances" />
                      </div>
                    </div>
                  ) : null}
                  <div class="iia-switcher__list iia-railscroll" ref={el => this.envListEl = el} onMouseLeave={() => this.envHoverOn = false}>
                    <div class="iia-switcher__pill" aria-hidden="true" style={{ height: `${this.envHoverH}px`, transform: `translateY(${this.envHoverY}px)`, opacity: this.envHoverOn ? '1' : '0', transition: this.pillTransition() }}></div>
                    {noMatches ? <div class="iia-switcher__empty">No instances match "{this.envQuery}". Try part of the name or URL.</div> : null}
                    {groups.map((grp, gi) => (
                      <div role="group" aria-label={grp.label} class={{ 'iia-switcher__group': true, 'iia-switcher__group--first': gi === 0, 'iia-switcher__group--production': grp.label === 'Production' }}>
                        <div class="iia-switcher__grouplabel">{grp.label}</div>
                        {grp.items.map((inst) => {
                          const current = inst.id === this.instanceId;
                          const prod = inst.env === 'production';
                          const idx = rowIdx++;
                          return (
                            <div role="menuitemradio" tabIndex={0} aria-checked={String(current)}
                                 class={{ 'iia-switcher__row': true, 'is-current': current, 'is-production': prod, 'is-staging': !prod }}
                                 style={{ animationDelay: `${Math.min(idx, 8) * 24}ms` }}
                                 onMouseEnter={(e) => this.slidePill(this.envListEl, e.currentTarget as HTMLElement, (y, hh) => { this.envHoverY = y; this.envHoverH = hh; this.envHoverOn = true; })}
                                 onClick={() => this.requestSwitch(inst)}>
                              <span class="iia-switcher__text">
                                <span class="iia-switcher__name">{inst.name}</span>
                                <a class="iia-switcher__domain" href={`https://${inst.domain}`} target="_blank" rel="noopener noreferrer" title={`Open ${inst.domain}`} aria-label={`Open ${inst.domain} in a new tab`} onClick={(e) => e.stopPropagation()}>
                                  <span>{inst.domain}</span><i class="icon-arrow-up-right" aria-hidden="true"></i>
                                </a>
                              </span>
                              {current
                                ? <span class="iia-switcher__current" title="Current instance" aria-label="Current instance"><span class="iia-switcher__check"><i class="icon-check-2" aria-hidden="true"></i></span></span>
                                : <span class="iia-switcher__switch" onClick={(e) => { e.stopPropagation(); this.requestSwitch(inst); }}>
                                    <ins-button outlined size="small" label="Switch" aria-label={`Switch to ${inst.name}`}></ins-button>
                                  </span>}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div class="iia-switcher__foot">{infoText} <a href="https://docs.insites.io/developers-guide/staging-vs-production" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Learn more</a></div>
                </div>
              ] : null}
            </div>

            <a class="iia-hdr__btn" href={this.frontendHref} target="_blank" rel="noopener noreferrer" data-tip="View frontend" aria-label="View frontend, opens in a new tab">
              {this.icon('globe')}
            </a>

            {!this.mobile ? (
              <button type="button" class="iia-hdr__btn" data-tip={this.dark ? 'Light mode' : 'Dark mode'} aria-label="Toggle dark mode" aria-pressed={String(this.dark)} onClick={this.toggleDark}>
                {this.icon(this.dark ? 'sun' : 'moon')}
              </button>
            ) : null}

            {this.mobile ? (
              <button type="button" class="iia-hdr__btn" data-tip="Help & support" aria-haspopup="dialog" aria-label="Open support chat" onClick={this.openSupport}>
                <span class="iia-hdr__badgewrap"><i class="icon-message-circle" aria-hidden="true"></i>{this.unread > 0 ? <span class="iia-chat__badge" aria-hidden="true">{this.unread}</span> : null}</span>
              </button>
            ) : null}

            {!this.mobile ? (
              <div class="iia-hdr__menuwrap">
                <button type="button" class="iia-hdr__btn" data-tip="Help" aria-haspopup="menu" aria-expanded={String(this.helpOpen)} aria-label="Help menu" onClick={(e) => this.toggleMenu('help', e)}>
                  {this.icon('question')}
                </button>
                {this.helpOpen ? (
                  <div role="menu" aria-label="Help" class="iia-menu iia-menu--help" ref={el => this.hmListEl = el} onMouseLeave={() => this.hmHoverOn = false}>
                    <div class="iia-menu__pill" aria-hidden="true" style={{ height: `${this.hmHoverH}px`, transform: `translateY(${this.hmHoverY}px)`, opacity: this.hmHoverOn ? '1' : '0', transition: this.pillTransition() }}></div>
                    <a role="menuitem" class="iia-menu__row" href={this.docsHref} target="_blank" rel="noopener noreferrer" onMouseEnter={(e) => this.slidePill(this.hmListEl, e.currentTarget as HTMLElement, (y, hh) => { this.hmHoverY = y; this.hmHoverH = hh; this.hmHoverOn = true; })}>
                      <i class="icon-book-open" aria-hidden="true"></i>Documentation<i class="icon-arrow-up-right iia-menu__ext" aria-hidden="true"></i>
                    </a>
                    <a role="menuitem" class="iia-menu__row" href={this.consoleHref} target="_blank" rel="noopener noreferrer" onMouseEnter={(e) => this.slidePill(this.hmListEl, e.currentTarget as HTMLElement, (y, hh) => { this.hmHoverY = y; this.hmHoverH = hh; this.hmHoverOn = true; })}>
                      <i class="icon-terminal" aria-hidden="true"></i>Insites Console<i class="icon-arrow-up-right iia-menu__ext" aria-hidden="true"></i>
                    </a>
                    <button type="button" role="menuitem" class="iia-menu__row" onClick={(e) => this.openShortcuts(e)} onMouseEnter={(e) => this.slidePill(this.hmListEl, e.currentTarget as HTMLElement, (y, hh) => { this.hmHoverY = y; this.hmHoverH = hh; this.hmHoverOn = true; })}>
                      <i class="icon-command" aria-hidden="true"></i>Keyboard shortcuts<span class="iia-menu__kbd">?</span>
                    </button>
                    <button type="button" role="menuitem" class="iia-menu__row" onClick={this.openSupport} onMouseEnter={(e) => this.slidePill(this.hmListEl, e.currentTarget as HTMLElement, (y, hh) => { this.hmHoverY = y; this.hmHoverH = hh; this.hmHoverOn = true; })}>
                      <i class="icon-message-circle" aria-hidden="true"></i>Message support
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div class="iia-hdr__menuwrap iia-hdr__account">
              <button type="button" class="iia-hdr__avatarbtn" data-tip="Account" aria-label={`Account menu, ${this.userName}`} aria-haspopup="menu" aria-expanded={String(this.userOpen)} onClick={(e) => this.toggleMenu('user', e)}>
                <span class="iia-avatar">{this.initials()}</span>
              </button>
              {this.userOpen ? (
                <div role="menu" aria-label="Account" class="iia-menu iia-menu--account">
                  <div class="iia-menu__head">
                    <span class="iia-avatar iia-avatar--lg">{this.initials()}</span>
                    <div class="iia-menu__who">
                      <div class="iia-menu__name">{this.userName}</div>
                      <div class="iia-menu__email">{this.userEmail}</div>
                    </div>
                  </div>
                  <div class="iia-menu__list" ref={el => this.umListEl = el} onMouseLeave={() => this.umHoverOn = false}>
                    <div class="iia-menu__pill" aria-hidden="true" style={{ height: `${this.umHoverH}px`, transform: `translateY(${this.umHoverY}px)`, opacity: this.umHoverOn ? '1' : '0', transition: this.pillTransition() }}></div>
                    <a role="menuitem" class="iia-menu__row" href={this.profileHref} onClick={() => this.closeMenus()} onMouseEnter={(e) => this.slidePill(this.umListEl, e.currentTarget as HTMLElement, (y, hh) => { this.umHoverY = y; this.umHoverH = hh; this.umHoverOn = true; })}>
                      {this.icon('user', 16, 'iia-menu__glyph')}Profile settings
                    </a>
                    {this.helpRestore ? (
                      <button type="button" role="menuitem" class={{ 'iia-menu__row': true, 'is-disabled': !this.helpPanelsDismissed }}
                              aria-disabled={String(!this.helpPanelsDismissed)} title={this.helpPanelsDismissed ? 'Show the help panels again' : 'Help panels are already showing'}
                              onClick={this.restoreHelp} onMouseEnter={(e) => this.slidePill(this.umListEl, e.currentTarget as HTMLElement, (y, hh) => { this.umHoverY = y; this.umHoverH = hh; this.umHoverOn = true; })}>
                        {this.icon('info', 16, 'iia-menu__glyph')}Show help panels
                      </button>
                    ) : null}
                    {this.mobile ? [
                      <button type="button" role="menuitem" class="iia-menu__row" onClick={this.toggleDark} onMouseEnter={(e) => this.slidePill(this.umListEl, e.currentTarget as HTMLElement, (y, hh) => { this.umHoverY = y; this.umHoverH = hh; this.umHoverOn = true; })}>
                        {this.icon(this.dark ? 'sun' : 'moon', 16, 'iia-menu__glyph')}{this.dark ? 'Light mode' : 'Dark mode'}
                      </button>,
                      <a role="menuitem" class="iia-menu__row" href={this.docsHref} target="_blank" rel="noopener noreferrer" onMouseEnter={(e) => this.slidePill(this.umListEl, e.currentTarget as HTMLElement, (y, hh) => { this.umHoverY = y; this.umHoverH = hh; this.umHoverOn = true; })}>
                        <i class="icon-book-open iia-menu__fonticon" aria-hidden="true"></i>Documentation{this.icon('arrow-up-right', 12, 'iia-menu__ext')}
                      </a>,
                      <a role="menuitem" class="iia-menu__row" href={this.consoleHref} target="_blank" rel="noopener noreferrer" onMouseEnter={(e) => this.slidePill(this.umListEl, e.currentTarget as HTMLElement, (y, hh) => { this.umHoverY = y; this.umHoverH = hh; this.umHoverOn = true; })}>
                        <i class="icon-terminal iia-menu__fonticon" aria-hidden="true"></i>Insites Console{this.icon('arrow-up-right', 12, 'iia-menu__ext')}
                      </a>,
                      <button type="button" role="menuitem" class="iia-menu__row" onClick={this.openSupport} onMouseEnter={(e) => this.slidePill(this.umListEl, e.currentTarget as HTMLElement, (y, hh) => { this.umHoverY = y; this.umHoverH = hh; this.umHoverOn = true; })}>
                        <i class="icon-message-circle iia-menu__fonticon" aria-hidden="true"></i>Message support
                      </button>,
                    ] : null}
                    {/* The v5 rail footer's "Lock screen" row is not in the v1.5 design and is not rendered. The action
                        stays reachable through the lockScreen() method for a host that wants to wire it. TW#26371963. */}
                    <a role="menuitem" class="iia-menu__row" href={this.logoutHref} onMouseEnter={(e) => this.slidePill(this.umListEl, e.currentTarget as HTMLElement, (y, hh) => { this.umHoverY = y; this.umHoverH = hh; this.umHoverOn = true; })}>
                      {this.icon('sign-out', 16, 'iia-menu__glyph')}Log out
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* breadcrumb bar: hidden on the dashboard */}
        {crumbs ? (
          <div class="iia-crumbs" data-screen-label="Breadcrumb bar">
            <nav aria-label="Breadcrumb" class="iia-crumbs__nav">
              <a href="#/" class="iia-crumbs__home" onClick={this.goHome}><i class="icon-home" aria-hidden="true"></i>Home</a>
              {crumbs.map((c) => [
                <i class="icon-chevron-right iia-crumbs__sep" aria-hidden="true"></i>,
                c.current
                  ? <span aria-current="page" class="iia-crumbs__current">{c.label}</span>
                  : c.routable
                    ? <a href={'#' + c.path} class="iia-crumbs__link" onClick={(e) => this.goCrumb(e, c.path)}>{c.label}</a>
                    : <span class="iia-crumbs__text">{c.label}</span>,
              ])}
            </nav>
          </div>
        ) : null}

        {/* keyboard shortcuts */}
        {this.shortcutsOpen ? (
          <div class="iia-scrim iia-scrim--overlay" onClick={() => { this.shortcutsOpen = false; this.restoreFocus(); }}>
            <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" class="iia-dialog iia-dialog--shortcuts" onClick={(e) => e.stopPropagation()}>
              <div class="iia-dialog__head">
                <span class="iia-dialog__title">Keyboard shortcuts</span>
                <button type="button" class="iia-dialog__close" aria-label="Close keyboard shortcuts" onClick={() => { this.shortcutsOpen = false; this.restoreFocus(); }}><i class="icon-close-1" aria-hidden="true"></i></button>
              </div>
              <div class="iia-dialog__rows">
                {shortcutRows.map(sr => (
                  <div class="iia-dialog__row"><span>{sr.label}</span><kbd>{sr.keys}</kbd></div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* production confirmation */}
        {this.prodConfirm ? (
          <div class="iia-scrim iia-scrim--overlay iia-scrim--center" onClick={() => this.prodConfirm = null}>
            <div role="alertdialog" aria-modal="true" aria-labelledby="iia-prod-switch-title" class="iia-dialog iia-dialog--prod" onClick={(e) => e.stopPropagation()}>
              <div class="iia-dialog__body">
                <i class="icon-alert-triangle iia-dialog__warn" aria-hidden="true"></i>
                <h2 id="iia-prod-switch-title" class="iia-dialog__h2">Switch to {this.prodConfirm.name}?</h2>
                <p class="iia-dialog__p">{this.prodConfirm.name} is <strong>the live production instance</strong>. Visitors see changes <strong>as soon as you save them</strong>, and emails send for real.</p>
                <ins-checkbox label="Don't show me again" checked={this.prodDontShow} onInsCheck={(e: any) => this.setProdDontShow(!!(e.detail && (e.detail.checked ?? e.detail)))}></ins-checkbox>
                <div class={{ 'iia-dialog__actions': true, 'iia-dialog__actions--stack': this.tight }}>
                  <button type="button" class="iia-btn iia-btn--outline" onClick={() => this.prodConfirm = null}><i class="icon-x" aria-hidden="true"></i>Cancel</button>
                  <button type="button" class="iia-btn iia-btn--solid" onClick={() => this.doSwitch(this.prodConfirm.id, 'production')}><i class="icon-refresh-cw" aria-hidden="true"></i>Switch to production</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* toast: DS Toast markup (success), 4s timer bar, below the header on desktop, docked bottom on phones */}
        {this.toast ? (
          <div class="iia-toast-region" role="status" aria-live="polite">
            <div class={`iia-toast ins-toast ins-toast--${this.toast.kind}`} key={String(this.toast.id)}>
              <i class="icon-check-circle ins-toast__icon" aria-hidden="true"></i>
              <div class="ins-toast__body"><p class="ins-toast__msg iia-toast__msg">{this.toast.text}</p></div>
              <button type="button" class="ins-toast__close" aria-label="Dismiss notification" onClick={this.hideToast}><i class="icon-x" aria-hidden="true"></i></button>
              <span class="iia-toast__timer" aria-hidden="true"></span>
            </div>
          </div>
        ) : null}
      </Host>
    );
  }

  render() {
    if (this.isV6) return this.renderV6();

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
