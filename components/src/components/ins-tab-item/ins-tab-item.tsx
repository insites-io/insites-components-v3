import { h, Component, Element, Method, Prop, Event, EventEmitter, Watch } from "@stencil/core";

@Component({ tag: 'ins-tab-item' })
export class InsTabItem {

  @Element() InsTabItemEl: HTMLElement;

  @Event() insTabError: EventEmitter;
  @Event() insTabDisableToggle: EventEmitter;
  @Event() insTabLoad: EventEmitter;
  /**
   * Fired when label, icon, count or active changes after load, so the parent <ins-tab> redraws
   * the header it renders for this item (TW#26778152). The parent reads these props once at
   * load; without this a count arriving from an async fetch never reached the strip.
   */
  @Event() insTabItemChange: EventEmitter<{ prop: string }>;

  @Prop({ mutable: true }) active: boolean;
  @Prop({ mutable: true }) label: string = "";
  @Prop({ mutable: true }) icon: string = "";
  /**
   * Optional badge on the tab header (the CRM record pages show a record count per tab). Only a
   * number, or a non-empty string, renders; null/undefined/'' render no chip. Only drawn by the
   * v6 strip; the legacy header ignores it.
   */
  @Prop({ mutable: true }) count: any = null;
  @Prop({ mutable: true }) noPadding: boolean;
  @Prop({ mutable: true }) disabled: boolean;
  @Prop({ mutable: true }) hasError: boolean;

  @Method()
  async deactivate() {
    this.active = false;
  }

  @Method()
  async activate() {
    this.active = true;
  }

  @Watch('hasError')
  watchHandler() {
    this.insTabError.emit(this.hasError);
  }

  @Watch('disabled')
  disabledWatcher() {
    this.insTabDisableToggle.emit(this.disabled);
  }

  @Watch('label')
  labelWatcher() { this.insTabItemChange.emit({ prop: 'label' }); }

  @Watch('icon')
  iconWatcher() { this.insTabItemChange.emit({ prop: 'icon' }); }

  @Watch('count')
  countWatcher() { this.insTabItemChange.emit({ prop: 'count' }); }

  @Watch('active')
  activeWatcher() { this.insTabItemChange.emit({ prop: 'active' }); }

  componentDidLoad() {
    this.insTabLoad.emit();
  }

  render() {
    return (
      <div class={`${this.noPadding ? 'no-padding' : ''}${this.active ? ' active' : ''}`}>
        <slot />
      </div>
    )
  }
}
