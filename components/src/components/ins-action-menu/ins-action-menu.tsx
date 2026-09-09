import { h, Component, Element, Prop, State, Event, EventEmitter, Method, Listen, Host } from "@stencil/core";

let actionMenuIds = 0;

@Component({
  tag: 'ins-action-menu',
  styleUrl: './ins-action-menu.scss'
})

export class InsActionMenu {
  @Element() insActionMenuEl: HTMLElement;

  @Event() insOpenChange: EventEmitter<{ open: boolean }>;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) triggerIcon: string = 'icon-more-vertical';
  @Prop({ mutable: true }) triggerLabel: string = '';
  @Prop({ mutable: true }) ariaLabelText: string = 'Actions';
  @Prop({ mutable: true }) position: string = 'bottom-end';
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  // Visual treatment. '' keeps the original rendering. 'record' is the IIA v6 record-page kebab
  // (CRM Contact v1.4 / Company v1.0): 36px bordered trigger, 240px card panel, flyouts to the left.
  @Prop({ mutable: true }) variant: string = '';
  // There is deliberately no hover-to-open option for nested items. The CRM Company v1.0 handover
  // tested hover and rejected it as an accessibility failure, and pairing hover with click is worse
  // than either alone: entering the row opens the flyout, so the click that follows toggles it shut.
  // Submenus open on click or ArrowRight only. See TW#26673778.
  // data-tip tooltip on the trigger, drawn by the shared button[data-tip] rule in insites.css.
  @Prop({ mutable: true }) triggerTip: string = '';

  @State() open: boolean = false;

  private panelId: string = `ins-action-menu-panel-${++actionMenuIds}`;
  private focusFirstOnRender: boolean = false;

  private documentClickHandler = (event: MouseEvent): void => {
    const target = event.target as Node;
    if (!this.insActionMenuEl.contains(target)) this.setOpen(false);
  };

  componentDidLoad() {
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]) {
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insActionMenuEl);
    }
  }

  componentDidRender() {
    if (this.focusFirstOnRender) {
      this.focusFirstOnRender = false;
      const buttons = this.getLevelButtons(this.getPanel());
      if (buttons.length) buttons[0].focus();
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.documentClickHandler);
  }

  @Method()
  async closeMenu(): Promise<void> {
    this.setOpen(false);
  }

  @Listen('insSelect')
  handleItemSelect(): void {
    this.setOpen(false, true);
  }

  @Listen('keydown')
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.open) {
        event.preventDefault();
        event.stopPropagation();
        this.setOpen(false, true);
      }
      return;
    }

    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(event.key) === -1) return;

    const target = event.target as HTMLElement;

    if (!this.open) {
      if (event.key === 'ArrowDown' && target.classList.contains('ins-action-menu__trigger')) {
        event.preventDefault();
        this.setOpen(true);
      }
      return;
    }

    this.moveFocus(event, target);
  }

  private setOpen(open: boolean, focusTrigger: boolean = false): void {
    if (this.open === open) {
      if (focusTrigger) this.focusTrigger();
      return;
    }

    this.open = open;

    if (open) {
      document.addEventListener('click', this.documentClickHandler);
      this.focusFirstOnRender = true;
    } else {
      document.removeEventListener('click', this.documentClickHandler);
      this.resetSubmenus();
      if (focusTrigger) this.focusTrigger();
    }

    this.insOpenChange.emit({ open });
  }

  private moveFocus(event: KeyboardEvent, target: HTMLElement): void {
    const itemEl = target.closest('ins-action-menu-item');
    const container = itemEl ? itemEl.parentElement : this.getPanel();
    const buttons = this.getLevelButtons(container);
    if (!buttons.length) return;

    event.preventDefault();
    const currentIndex = buttons.indexOf(target as HTMLButtonElement);
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex < 0 ? buttons.length - 1 : (currentIndex - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttons.length - 1;
        break;
      default:
        return;
    }

    buttons[nextIndex].focus();
  }

  private getPanel(): HTMLElement | null {
    return this.insActionMenuEl.querySelector('.ins-action-menu__panel');
  }

  // Divider items render no button, so they fall out of the focus order here on their own.
  private getLevelButtons(container: Element | null): HTMLButtonElement[] {
    if (!container) return [];
    const buttons: HTMLButtonElement[] = [];
    Array.from(container.children).forEach(child => {
      if (child.tagName !== 'INS-ACTION-MENU-ITEM') return;
      const button = child.querySelector(':scope > .ins-action-menu-item__button') as HTMLButtonElement | null;
      if (button && !button.disabled) buttons.push(button);
    });
    return buttons;
  }

  private focusTrigger(): void {
    const trigger = this.insActionMenuEl.querySelector('.ins-action-menu__trigger') as HTMLElement | null;
    if (trigger) trigger.focus();
  }

  private resetSubmenus(): void {
    this.insActionMenuEl.querySelectorAll('ins-action-menu-item').forEach(item => {
      item.dispatchEvent(new CustomEvent('insActionMenuReset'));
    });
  }

  render() {
    return (
      <Host class={{
        'ins-action-menu--record': this.variant === 'record'
      }}>
        <div class="ins-action-menu">
          <button
            type="button"
            class={`ins-action-menu__trigger ${this.triggerLabel ? 'has-label' : 'icon-only'}`}
            aria-haspopup="menu"
            aria-expanded={this.open ? 'true' : 'false'}
            aria-controls={this.panelId}
            aria-label={this.triggerLabel ? undefined : this.ariaLabelText}
            data-tip={this.triggerTip ? this.triggerTip : undefined}
            onClick={() => this.setOpen(!this.open)}
          >
            {this.triggerIcon
              ? <i class={`ins-action-menu__trigger-icon ${this.triggerIcon}`} aria-hidden="true"></i>
              : null}
            {this.triggerLabel
              ? <span class="ins-action-menu__trigger-label">{this.triggerLabel}</span>
              : null}
          </button>

          <div
            class={`ins-action-menu__panel position--${this.position}`}
            role="menu"
            id={this.panelId}
            aria-label={this.triggerLabel ? this.triggerLabel : this.ariaLabelText}
            hidden={!this.open}
          >
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
