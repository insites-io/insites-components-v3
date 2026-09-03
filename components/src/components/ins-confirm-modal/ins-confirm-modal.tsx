import { h, Component, Element, Prop, State, Event, EventEmitter, Method, Watch, Listen } from "@stencil/core";

let confirmModalIds = 0;

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

  @State() typedValue: string = "";

  @Event() insConfirm: EventEmitter<void>;
  @Event() insClose: EventEmitter<void>;
  @Event() didLoad: EventEmitter<void>;

  @Watch('open')
  openChanged(newValue: boolean) {
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
    return this.typedValue.trim().toLowerCase() === this.confirmWord.trim().toLowerCase();
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
    return (
      <div
        class={`ins-confirm-modal-backdrop ${this.open ? 'open' : ''}`}
        onClick={this.handleBackdropClick}
      >
        <div
          class="ins-confirm-modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={this.headingId}
        >
          <h2 class="ins-confirm-modal-heading" id={this.headingId}>{this.heading}</h2>
          <div class="ins-confirm-modal-body">
            <slot />
          </div>
          <div class="ins-confirm-modal-field">
            <label class="ins-confirm-modal-label" htmlFor={this.inputId}>
              Type {this.confirmWord} to confirm
            </label>
            <input
              class="ins-confirm-modal-input"
              id={this.inputId}
              type="text"
              autocomplete="off"
              spellcheck={false}
              value={this.typedValue}
              onInput={this.handleInput}
              ref={(el?: HTMLInputElement) => { this.inputEl = el; }}
            />
          </div>
          <div class="ins-confirm-modal-footer">
            <button
              type="button"
              class="ins-confirm-modal-cancel"
              onClick={this.handleCancel}
            >
              {this.cancelButtonLabel}
            </button>
            <button
              type="button"
              class="ins-confirm-modal-confirm"
              disabled={!this.confirmMatches}
              onClick={this.handleConfirm}
            >
              {this.confirmButtonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
