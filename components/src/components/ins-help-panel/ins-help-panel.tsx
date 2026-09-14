import { h, Component, Prop, State, Element, Event, EventEmitter, Listen, Host } from "@stencil/core";

/**
 * ins-help-panel — the IIA v6 shell's dismissible help panel (Admin Shell v1.5 design, TW#26371963).
 *
 * A card that explains the screen it sits on, with a small graphic, a heading, a body and a
 * "Dismiss permanently" control. Dismissal is stored per administrator through the
 * administrator-preferences endpoint, so a panel dismissed once stays dismissed on every device.
 * The account menu's "Show help panels" row (ins-header) restores every dismissed panel at once.
 *
 * Storage: one preference row, key `help_panels:dismissed`, value a JSON array of panel keys.
 * The header reads the same row to decide whether its restore row is live, and clears it on restore.
 *
 *   <ins-help-panel panel-key="dashboard" heading="…" body="…"></ins-help-panel>
 *
 * Copy comes from the page (`heading` / `body`, or the default slot for richer body content); the
 * shell owns the frame, the graphic, the persistence and the restore round trip.
 */
@Component({ tag: 'ins-help-panel' })
export class InsHelpPanel {
  @Element() el: HTMLElement;

  /** Stable key for this panel, e.g. "dashboard". Required; without it nothing can be remembered. */
  @Prop() panelKey: string = '';
  @Prop() heading: string = '';
  /** Plain-text body. Use the default slot instead for markup. */
  @Prop() body: string = '';
  /** 'dashboard' draws the design's animated cards graphic; 'none' draws no graphic. */
  @Prop() graphic: string = 'dashboard';
  @Prop() preferencesEndpoint: string = '/insites/core/administrator-preferences';
  /** Toast copy shown by the header when the panel is dismissed. */
  @Prop() dismissedMessage: string = 'Help hidden for you. Restore it from your account menu, under Show help panels.';

  /** Fired on dismiss, bubbling to the document, so ins-header can light its restore row and toast. */
  @Event({ bubbles: true, composed: true }) insHelpDismiss: EventEmitter<{ key: string; message: string }>;

  @State() loaded: boolean = false;
  @State() dismissed: boolean = false;

  static readonly PREF_KEY = 'help_panels:dismissed';

  async componentWillLoad() {
    await this.readState();
  }

  /** ins-header emits this after clearing the stored list. */
  @Listen('insHelpRestore', { target: 'document' })
  onRestore() {
    this.dismissed = false;
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

  static parseList(value: any): string[] {
    try {
      const v = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(v) ? v.map(String) : [];
    } catch (e) { return []; }
  }

  private async readList(): Promise<string[]> {
    try {
      const r = await fetch(`${this.preferencesEndpoint}?key=${encodeURIComponent(InsHelpPanel.PREF_KEY)}`, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
      if (!r.ok) return [];
      const j = await r.json();
      const row = j && j.items && Array.isArray(j.items.results) ? j.items.results[0] : null;
      return row ? InsHelpPanel.parseList(row.value) : [];
    } catch (e) { return []; }
  }

  private async readState() {
    if (!this.panelKey) { this.loaded = true; return; }
    const list = await this.readList();
    this.dismissed = list.indexOf(this.panelKey) !== -1;
    this.loaded = true;
  }

  private dismiss = async () => {
    if (!this.panelKey) return;
    this.dismissed = true;
    this.insHelpDismiss.emit({ key: this.panelKey, message: this.dismissedMessage });
    const list = await this.readList();
    if (list.indexOf(this.panelKey) === -1) list.push(this.panelKey);
    fetch(this.preferencesEndpoint, {
      method: 'POST', credentials: 'same-origin', headers: this.csrfHeaders(),
      body: JSON.stringify({ payload: { key: InsHelpPanel.PREF_KEY, value: JSON.stringify(list) } }),
    }).catch(() => { /* the panel is hidden for this session either way */ });
  };

  private dashboardGraphic() {
    // The design's "Dashboard cards with one metric highlighted" (AdminShell v1.5, L338–350), animated by the
    // .iia-dash-* keyframes in the shell stylesheet.
    return (
      <svg width="96" height="72" viewBox="0 0 96 72" fill="none" class="iia-help__graphic" role="img" aria-label="Dashboard cards with one metric highlighted">
        <rect x="3" y="9" width="43" height="54" rx="5" fill="var(--ins-ui-1)" stroke="var(--ins-ui-3)" stroke-width="2"></rect>
        <rect class="iia-dash-el iia-dash-wipe" x="11" y="18" width="18" height="4" rx="2" fill="var(--ins-ui-3)"></rect>
        <rect class="iia-dash-el iia-dash-bar" style={{ animationDelay: '.15s' }} x="11" y="42" width="5" height="10" rx="2" fill="var(--ins-ui-3)"></rect>
        <rect class="iia-dash-el iia-dash-bar" style={{ animationDelay: '.27s' }} x="20" y="36" width="5" height="16" rx="2" fill="var(--ins-ui-3)"></rect>
        <rect class="iia-dash-el iia-dash-bar" style={{ animationDelay: '.39s' }} x="29" y="44" width="5" height="8" rx="2" fill="var(--ins-ui-3)"></rect>
        <rect class="iia-dash-el iia-dash-bar" style={{ animationDelay: '.56s' }} x="38" y="28" width="5" height="24" rx="2" fill="var(--ins-main)"></rect>
        <rect x="53" y="9" width="40" height="24" rx="5" fill="var(--ins-ui-1)" stroke="var(--ins-ui-3)" stroke-width="2"></rect>
        <rect class="iia-dash-el iia-dash-wipe" style={{ animationDelay: '.7s' }} x="61" y="19" width="13" height="5" rx="2.5" fill="var(--ins-main)"></rect>
        <rect x="53" y="39" width="40" height="24" rx="5" fill="var(--ins-ui-1)" stroke="var(--ins-ui-3)" stroke-width="2"></rect>
        <rect class="iia-dash-el iia-dash-wipe" style={{ animationDelay: '.82s' }} x="61" y="49" width="19" height="5" rx="2.5" fill="var(--ins-ui-3)"></rect>
      </svg>
    );
  }

  render() {
    if (!this.loaded || this.dismissed) return <Host hidden></Host>;
    return (
      <Host>
        <section class="iia-help" data-screen-label="Help panel">
          {this.graphic === 'none' ? null : this.dashboardGraphic()}
          <div class="iia-help__text">
            {this.heading ? <div class="iia-help__heading">{this.heading}</div> : null}
            {this.body ? <p class="iia-help__body">{this.body}</p> : <div class="iia-help__body"><slot></slot></div>}
          </div>
          <button type="button" class="iia-help__dismiss" title="Dismiss permanently" aria-label="Dismiss this help panel permanently" onClick={this.dismiss}>
            <i class="icon-x" aria-hidden="true"></i>
          </button>
        </section>
      </Host>
    );
  }
}
