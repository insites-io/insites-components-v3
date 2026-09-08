import { h, Component, Element, Prop, State, Event, EventEmitter, Method, Watch, Listen } from "@stencil/core";

let confirmModalIds = 0;

/**
 * Type-to-confirm destructive dialog (IIA v6 CRM record pages).
 *
 * Design: div[role="dialog"] > div[data-screen-label="Delete confirmation"] in
 * CRM Company v1.0 and CRM Contact v1.4 (handoff-confirm-delete.md, handoff.md section 5).
 * Reference implementation: module-v6-crm ConfirmDeleteModal.vue.
 *
 * The confirm button is never `disabled`. It dims to 0.45 with aria-disabled and the
 * handler returns early until the field reads the confirm word, so it stays focusable
 * and screen readers can reach the requirement text. The typed word is compared trimmed
 * and case-insensitively, so "delete" passes for "DELETE".
 *
 * Lead copy (the bold spans, the "are you sure" lines) comes in through the default slot.
 * The kept-records note can come through the slot too, or through the `keptNote` prop.
 */
@Component({
  tag: 'ins-confirm-modal',
  styleUrl: './ins-confirm-modal.scss'
})
export class InsConfirmModal {
  private instanceId: number = ++confirmModalIds;
  private inputId: string = `ins-confirm-modal-input-${this.instanceId}`;
  private headingId: string = `ins-confirm-modal-heading-${this.instanceId}`;
  private inputEl?: HTMLInputElement;
  private previousFocus: HTMLElement | null = null;

  @Element() insConfirmModalEl: HTMLElement;

  @Prop({ mutable: true }) heading: string;
  @Prop({ mutable: true }) confirmWord: string = "DELETE";
  @Prop({ mutable: true }) confirmButtonLabel: string = "Delete";
  @Prop({ mutable: true }) cancelButtonLabel: string = "Cancel";
  @Prop({ mutable: true }) open: boolean = false;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  /** aria-label for the dialog, e.g. "Delete company". When empty the dialog is labelled by its heading. */
  @Prop({ mutable: true }) dialogLabel: string;
  /** Optional "what is kept" note rendered below the lead copy with a positive check icon. */
  @Prop({ mutable: true }) keptNote: string;
  /** Overrides the default prompt line: Please enter "{confirmWord}" to proceed. */
  @Prop({ mutable: true }) confirmPrompt: string;
  /** Icon-font class on the confirm button. Empty string hides the icon. */
  @Prop({ mutable: true }) confirmButtonIcon: string = "icon-trash";
  /** Icon-font class on the cancel button. Empty string hides the icon. */
  @Prop({ mutable: true }) cancelButtonIcon: string = "icon-x";

  @State() typedValue: string = "";

  @Event() insConfirm: EventEmitter<void>;
  @Event() insClose: EventEmitter<void>;
  @Event() didLoad: EventEmitter<void>;

  @Watch('open')
  openChanged(newValue: boolean) {
    this.typedValue = "";
    if (newValue) {
      this.moveFocusToInput();
    } else {
      this.restoreFocus();
    }
  }

  @Listen('keydown', { target: 'document' })
  handleDocumentKeydown(event: KeyboardEvent) {
    if (this.open && event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
    }
  }

  @Method()
  async show(): Promise<void> {
    this.open = true;
  }

  @Method()
  async hide(): Promise<void> {
    this.close(false);
  }

  componentDidLoad() {
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]) {
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insConfirmModalEl);
    }
    if (this.open) this.moveFocusToInput();
  }

  disconnectedCallback() {
    this.previousFocus = null;
  }

  private get confirmMatches(): boolean {
    return this.typedValue.trim().toLowerCase() === (this.confirmWord || "").trim().toLowerCase();
  }

  private get promptText(): string {
    if (this.confirmPrompt) return this.confirmPrompt;
    return `Please enter "${this.confirmWord}" to proceed.`;
  }

  private moveFocusToInput() {
    const active = document.activeElement;
    if (active instanceof HTMLElement && !this.insConfirmModalEl.contains(active)) {
      this.previousFocus = active;
    }
    window.requestAnimationFrame(() => {
      if (this.open && this.inputEl) this.inputEl.focus();
    });
  }

  private restoreFocus() {
    if (this.previousFocus && document.contains(this.previousFocus)) {
      this.previousFocus.focus();
    }
    this.previousFocus = null;
  }

  private close(emitClose: boolean) {
    if (!this.open) return;
    this.open = false;
    this.typedValue = "";
    if (emitClose) this.insClose.emit();
  }

  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.typedValue = target.value;
  };

  private handleInputKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleConfirm();
    }
  };

  private handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) this.close(true);
  };

  private handleCancel = () => {
    this.close(true);
  };

  private handleConfirm = () => {
    if (!this.confirmMatches) return;
    this.open = false;
    this.typedValue = "";
    this.insConfirm.emit();
  };

  render() {
    const ready = this.confirmMatches;
    const dialogA11y = this.dialogLabel
      ? { 'aria-label': this.dialogLabel }
      : { 'aria-labelledby': this.headingId };

    return (
      <div
        class={`ins-confirm-modal-backdrop ${this.open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        {...dialogA11y}
        onClick={this.handleBackdropClick}
      >
        <div class="ins-confirm-modal-panel crm-confirmcard" data-screen-label="Delete confirmation">
          <i class="ins-confirm-modal-icon icon-alert-triangle" aria-hidden="true"></i>
          <h2 class="ins-confirm-modal-heading" id={this.headingId}>{this.heading}</h2>
          <div class="ins-confirm-modal-body">
            <slot />
          </div>
          {this.keptNote
            ? <div class="ins-confirm-modal-kept">
                <i class="ins-confirm-modal-kept-icon icon-check-circle-1" aria-hidden="true"></i>
                <span class="ins-confirm-modal-kept-text">{this.keptNote}</span>
              </div>
            : null}
          <div class="ins-confirm-modal-field">
            <label class="ins-confirm-modal-label" htmlFor={this.inputId}>
              {this.promptText}
            </label>
            <input
              class="ins-confirm-modal-input"
              id={this.inputId}
              type="text"
              autocomplete="off"
              spellcheck={false}
              value={this.typedValue}
              onInput={this.handleInput}
              onKeyDown={this.handleInputKeydown}
              ref={(el?: HTMLInputElement) => { this.inputEl = el; }}
            />
          </div>
          <div class="ins-confirm-modal-footer crm-confirmbtns">
            <button
              type="button"
              class="ins-confirm-modal-cancel"
              onClick={this.handleCancel}
            >
              {this.cancelButtonIcon ? <i class={`ins-confirm-modal-btn-icon ${this.cancelButtonIcon}`} aria-hidden="true"></i> : null}
              {this.cancelButtonLabel}
            </button>
            <button
              type="button"
              class="ins-confirm-modal-confirm"
              aria-disabled={ready ? 'false' : 'true'}
              onClick={this.handleConfirm}
            >
              {this.confirmButtonIcon ? <i class={`ins-confirm-modal-btn-icon ${this.confirmButtonIcon}`} aria-hidden="true"></i> : null}
              {this.confirmButtonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
