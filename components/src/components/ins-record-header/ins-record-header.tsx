import { h, Component, Element, Prop, Host } from "@stencil/core";

/**
 * IIA v6 record identity header (TW#26778152).
 *
 * The card at the top of a record page: avatar (image, or initials on the brand colour),
 * the record's name as the page h1, a subtitle line, an optional website link, a row of
 * short facts, status/category pills, a metric strip and an actions area. It is the CRM
 * Contact v1.4 / Company v1.0 `section.crm-hdr` moved into the bundle so every module's
 * record page draws the same header from one place instead of each SPA carrying its own
 * SubHeader markup.
 *
 * Content that differs per record type comes in through slots, all light DOM:
 *   - `pills`    extra chips after the status pill (category, type…)
 *   - `metrics`  an <ins-metric-tile-group variant="strip"> (or any strip); inline on wide
 *                headers, on its own full-width row from 1180px down
 *   - `actions`  buttons / <ins-action-menu>; pinned top-right below 600px
 *   - `extra`    anything that used to sit under the old SubHeader (toggles, mid display)
 *
 * Styling is in insites.css ("IIA v6 record header layer"), tokens only. The host is an
 * inline-size container so the breakpoints follow the header's own width, not the viewport,
 * the same way the CRM record page does it.
 */
@Component({ tag: 'ins-record-header' })
export class InsRecordHeader {
  @Element() el: HTMLElement;

  /** Record name. Rendered as the page h1 and used for the initials. */
  @Prop({ mutable: true }) name: string = '';
  /** Avatar image URL. When empty the initials of `name` render on the brand colour. */
  @Prop({ mutable: true }) image: string = '';
  /** Hide the avatar entirely (records with no natural portrait: an event, a product, a form). */
  @Prop({ mutable: true }) noAvatar: boolean = false;
  /** Icon-font class shown in the avatar circle instead of initials (e.g. icon-calendar for an event). */
  @Prop({ mutable: true }) icon: string = '';
  /** One line under the name: a role, a company, a date range. Plain text. */
  @Prop({ mutable: true }) subtitle: string = '';
  /** External link shown under the subtitle, opened in a new tab. */
  @Prop({ mutable: true }) website: string = '';
  /** Text for the website link; defaults to the URL. */
  @Prop({ mutable: true }) websiteText: string = '';
  /** Short facts rendered as a separated row ("Sydney · 12 Oct · 240 capacity"). JSON array or comma-separated string. */
  @Prop({ mutable: true }) facts: any = [];
  /** Status pill label (Active, Enabled, Draft…). Empty renders no pill. */
  @Prop({ mutable: true }) status: string = '';
  /**
   * Status pill colour: green | red | orange | yellow | blue | grey, or one of the status words the old
   * <ins-tag> accepted (enabled, active, published, valid, positive, open, new → green; disabled, archived,
   * error, invalid, negative, closed → red; pending, flagged → orange). Anything else falls back to grey.
   */
  @Prop({ mutable: true }) statusColor: string = 'grey';
  /** Small muted text before the status pill (the old SubHeader `tagInfo`). */
  @Prop({ mutable: true }) statusInfo: string = '';
  /** Dim the header (archived / disabled record). */
  @Prop({ mutable: true }) archived: boolean = false;

  private hasSlot(name: string): boolean {
    return !!this.el.querySelector(`[slot="${name}"]`);
  }

  private initials(): string {
    const parts = (this.name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] || '' : '';
    return (first + last).toUpperCase();
  }

  private factList(): string[] {
    const f = this.facts;
    if (Array.isArray(f)) return f.filter((x) => x !== null && x !== undefined && String(x).trim() !== '').map(String);
    if (typeof f === 'string' && f.trim()) {
      try {
        const parsed = JSON.parse(f);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch (e) { /* not JSON: fall through to comma split */ }
      return f.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  private href(url: string): string {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  private colorClass(): string {
    const aliases: Record<string, string> = {
      enabled: 'green', active: 'green', published: 'green', valid: 'green', positive: 'green', open: 'green', new: 'green', success: 'green',
      disabled: 'red', archived: 'red', error: 'red', invalid: 'red', negative: 'red', closed: 'red', danger: 'red',
      pending: 'orange', flagged: 'orange', warning: 'orange', draft: 'orange',
      info: 'blue', primary: 'blue',
    };
    const allowed = ['green', 'red', 'orange', 'yellow', 'blue', 'grey'];
    const raw = (this.statusColor || '').toLowerCase().trim();
    const c = aliases[raw] || raw;
    return `ins-record-header__pill--${allowed.indexOf(c) === -1 ? 'grey' : c}`;
  }

  render() {
    const facts = this.factList();
    const showAvatar = !this.noAvatar;
    const hasPills = !!this.status || this.hasSlot('pills');
    return (
      <Host class={{ 'ins-record-header': true, 'is-archived': this.archived, 'has-metrics': this.hasSlot('metrics'), 'has-actions': this.hasSlot('actions') }}>
        <section class="ins-record-header__card">
          {showAvatar
            ? <span
                class={{ 'ins-record-header__avatar': true, 'has-image': !!this.image }}
                aria-hidden="true"
                style={this.image ? { backgroundImage: `url(${this.image})` } : undefined}>
                {!this.image && this.icon ? <i class={this.icon}></i> : null}
                {!this.image && !this.icon ? this.initials() : null}
              </span>
            : null}

          <div class="ins-record-header__identity">
            <div class="ins-record-header__text">
              <h1 class="ins-record-header__name">{this.name}</h1>
              {this.subtitle ? <div class="ins-record-header__subtitle">{this.subtitle}</div> : null}
              {this.website
                ? <a class="ins-record-header__website" href={this.href(this.website)} target="_blank" rel="noopener">
                    <span>{this.websiteText || this.website}</span><i class="icon-external-link" aria-hidden="true"></i>
                  </a>
                : null}
              {facts.length
                ? <div class="ins-record-header__facts">
                    {facts.map((f) => <span class="ins-record-header__fact">{f}</span>)}
                  </div>
                : null}
            </div>
            {hasPills
              ? <div class="ins-record-header__pills">
                  {this.statusInfo ? <span class="ins-record-header__status-info">{this.statusInfo}</span> : null}
                  {this.status ? <span class={`ins-record-header__pill ${this.colorClass()}`}>{this.status}</span> : null}
                  <slot name="pills" />
                </div>
              : null}
          </div>

          <div class="ins-record-header__metrics">
            <slot name="metrics" />
          </div>
          <div class="ins-record-header__actions">
            <slot name="actions" />
          </div>
        </section>
        <div class="ins-record-header__extra">
          <slot name="extra" />
          <slot />
        </div>
      </Host>
    );
  }
}
