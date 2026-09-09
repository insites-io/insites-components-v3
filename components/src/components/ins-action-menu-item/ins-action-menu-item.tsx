import { h, Component, Element, Prop, State, Event, EventEmitter, Listen, Host } from "@stencil/core";

let actionMenuItemIds = 0;

@Component({
  tag: 'ins-action-menu-item',
  styleUrl: './ins-action-menu-item.scss'
})

export class InsActionMenuItem {
  @Element() insActionMenuItemEl: HTMLElement;

  @Event() insSelect: EventEmitter<{ label: string; value: string }>;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) label: string = '';
  @Prop({ mutable: true }) icon: string = '';
  @Prop({ mutable: true }) value: string = '';
  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) danger: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  // Renders a 1px rule between item groups instead of a button. No label, no event, skipped by arrow keys.
  @Prop({ mutable: true }) divider: boolean = false;
  // Secondary text right-aligned after the label, in the small muted style. The design's channel flyouts
  // show the value as the label ("shane@insites.io") with the slot here ("Email 1", "Work", "Mobile").
  @Prop({ mutable: true }) slotLabel: string = '';

  @State() subOpen: boolean = false;
  @State() hasSubmenu: boolean = false;

  private submenuId: string = `ins-action-menu-submenu-${++actionMenuItemIds}`;
  private focusFirstChildOnRender: boolean = false;
  private childObserver: MutationObserver | null = null;

  componentWillLoad() {
    if (!this.value) this.value = this.label;
    this.refreshHasSubmenu();
  }

  connectedCallback() {
    // Frameworks add nested items after this element mounts (the CRM's channel rows arrive with the record),
    // so keep hasSubmenu in step with the light DOM rather than reading it once.
    if (typeof MutationObserver === 'undefined' || this.childObserver) return;
    this.childObserver = new MutationObserver(() => this.refreshHasSubmenu());
    this.childObserver.observe(this.insActionMenuItemEl, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    if (this.childObserver) {
      this.childObserver.disconnect();
      this.childObserver = null;
    }
  }

  componentDidLoad() {
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]) {
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insActionMenuItemEl);
    }
  }

  componentDidRender() {
    if (this.focusFirstChildOnRender) {
      this.focusFirstChildOnRender = false;
      this.focusFirstChild();
    }
  }

  @Listen('insActionMenuReset')
  handleReset(): void {
    this.subOpen = false;
  }

  private refreshHasSubmenu(): void {
    this.hasSubmenu = !!this.insActionMenuItemEl.querySelector('ins-action-menu-item');
  }

  private handleClick = (): void => {
    if (this.disabled) return;
    if (this.hasSubmenu) {
      this.toggleSubmenu(!this.subOpen);
    } else {
      this.insSelect.emit({ label: this.label, value: this.value });
    }
  };

  private handleButtonKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowRight' || !this.hasSubmenu || this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.subOpen) {
      this.focusFirstChild();
    } else {
      this.focusFirstChildOnRender = true;
      this.toggleSubmenu(true);
    }
  };

  private handleSubmenuKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowLeft') return;
    event.preventDefault();
    event.stopPropagation();
    this.subOpen = false;
    const button = this.insActionMenuItemEl.querySelector(':scope > .ins-action-menu-item__button') as HTMLButtonElement | null;
    if (button) button.focus();
  };

  private toggleSubmenu(open: boolean): void {
    if (open) this.closeSiblings();
    this.subOpen = open;
  }

  private closeSiblings(): void {
    const parent = this.insActionMenuItemEl.parentElement;
    if (!parent) return;
    Array.from(parent.children).forEach(sibling => {
      if (sibling !== this.insActionMenuItemEl && sibling.tagName === 'INS-ACTION-MENU-ITEM') {
        sibling.dispatchEvent(new CustomEvent('insActionMenuReset'));
      }
    });
  }

  private focusFirstChild(): void {
    const submenu = this.insActionMenuItemEl.querySelector(':scope > .ins-action-menu-item__submenu');
    if (!submenu) return;
    const items = Array.from(submenu.children).filter(child => child.tagName === 'INS-ACTION-MENU-ITEM');
    for (const item of items) {
      const button = item.querySelector(':scope > .ins-action-menu-item__button') as HTMLButtonElement | null;
      if (button && !button.disabled) {
        button.focus();
        return;
      }
    }
  }

  render() {
    if (this.divider) {
      return (
        <Host role="none" class="is-divider">
          <div class="ins-action-menu-item__divider" role="separator" aria-orientation="horizontal"></div>
        </Host>
      );
    }

    return (
      <Host
        role="none"
        class={{ 'has-submenu': this.hasSubmenu, 'is-open': this.subOpen }}
      >
        <button
          type="button"
          class={`ins-action-menu-item__button ${this.danger ? 'danger' : ''}`}
          role="menuitem"
          disabled={this.disabled}
          aria-haspopup={this.hasSubmenu ? 'menu' : undefined}
          aria-expanded={this.hasSubmenu ? (this.subOpen ? 'true' : 'false') : undefined}
          aria-controls={this.hasSubmenu ? this.submenuId : undefined}
          onClick={this.handleClick}
          onKeyDown={this.handleButtonKeydown}
        >
          {this.icon
            ? <i class={`ins-action-menu-item__icon ${this.icon}`} aria-hidden="true"></i>
            : null}
          <span class="ins-action-menu-item__label">{this.label}</span>
          {this.slotLabel
            ? <span class="ins-action-menu-item__slot">{this.slotLabel}</span>
            : null}
          {this.hasSubmenu
            ? <i class="ins-action-menu-item__chevron icon-chevron-right" aria-hidden="true"></i>
            : null}
        </button>

        <div
          class="ins-action-menu-item__submenu"
          role="menu"
          id={this.submenuId}
          aria-label={this.label ? this.label : undefined}
          hidden={!this.hasSubmenu || !this.subOpen}
          onKeyDown={this.handleSubmenuKeydown}
        >
          <slot />
        </div>
      </Host>
    );
  }
}
