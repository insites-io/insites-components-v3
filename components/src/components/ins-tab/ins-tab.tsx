import { h, Component, Element, Event, Method, EventEmitter, Prop, State, Listen } from "@stencil/core";

@Component({ tag: 'ins-tab' })

export class InsTab {
  @Element() insTabEl: HTMLElement;
  @Event() insTabChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) tabs: any = []; // NOTE: @Prop types compile into Stencil runtime metadata — do not change without a deliberate behaviour review
  @State() activeTab: string = "";
  @State() activeTabIndex: number = 0;
  @State() insTabItems: any[] = [];
  @State() insTabHeaders: HTMLElement[] = [];
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  onchangeTabHandler(event: MouseEvent, index: number) {
    if (
      !this.insTabItems[index].disabled &&
      !this.insTabItems[index].active
    ) {
      this.setActiveTab(index);
      this.setActiveTabItem(index);
      this.insTabChange.emit({
        event: event,
        index: index,
        label: this.insTabHeaders[index]?.innerText?.trim()
      });
    }
  }

  getTabItemsEl() {
    return this.insTabEl.querySelectorAll(":scope ins-tab-item");
  }

  getTabHeadersEl() {
    return this.insTabEl.querySelectorAll(":scope > .ins-tab > .ins-tab-headers > .ins-tab-header");
  }

  getDefaulTabLabel(index: number) {
    return `Tab ${index + 1}`;
  }

  getTabHeaders() {
    let tabHeaders = this.getTabHeadersEl();
    let headers = [];

    for (let i = 0; i < tabHeaders.length; i++) {
      let item = tabHeaders[i] as HTMLElement;
      headers.push(item);
    }

    return headers;
  }

  getTabItems() {
    let tabItems = this.getTabItemsEl();
    let options = [];

    for (let i = 0; i < tabItems.length; i++) {
      if (tabItems[i].closest('ins-tab') === this.insTabEl){
        let item = tabItems[i] as any;
        options.push(item);
      }
    }

    return options;
  }

  getActiveTabLabelIndex() {
    for (let i = 0; i < this.insTabItems.length; i++) {
    let item = this.insTabItems[i] as any;

      if (item.active) {
        this.activeTab = item.label ?
          item.label.value :
          this.getDefaulTabLabel(i);
        this.activeTabIndex = i;
        break;
      }
    }
  }

  setActiveTab(index: number) {
    this.insTabHeaders.forEach(item => {
      item.classList.remove('active');
    });
    let el = this.insTabHeaders[index];
    if (el) el.classList.add('active');
  }

  setDisabledTabs() {
    let indexes = [];
    this.insTabItems.forEach((item, index) => {
      if (item.attributes.disabled) {
        indexes.push(index);
      }
    });

    this.insTabHeaders.forEach((item, index) => {
      if (indexes.indexOf(index) !== -1) {
        item.classList.add('disabled');
      } else {
        item.classList.remove('disabled');
      }
    });
  }

  setActiveTabItem(index: number) {
    this.insTabItems.forEach(item => {
      item.deactivate();
    });
    this.insTabItems[index]?.activate();
  }

  setScrollableHeaders() {
    let scrollWidth = 0 as number;
    let insTabContainer = this.insTabEl.querySelector('.ins-tab-headers');
    let scrollWidthContainer = insTabContainer.clientWidth;

    this.insTabHeaders.forEach(item => {
      scrollWidth += item.clientWidth;
    });

    if (scrollWidth > scrollWidthContainer) {
      insTabContainer.classList.add('scrollable');
    } else {
      insTabContainer.classList.remove('scrollable');
    }
  }

  setTabLabel(item: any, index: number) {
    return item.label ?
      item.label :
      this.getDefaulTabLabel(index);
  }

  setTabIcon(item) {
    return item.icon ?
     item.icon : '';
  }

  componentWillLoad() {
    this.insTabItems = this.getTabItems();
    this.getActiveTabLabelIndex();
  }

  componentDidLoad() {
    this.insTabHeaders = this.getTabHeaders();
    this.setActiveTab(this.activeTabIndex);
    this.setDisabledTabs();
    this.setActiveTabItem(this.activeTabIndex);
    this.setScrollableHeaders();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insTabEl);
    }
  }

  @Method()
  async activateTab(place: number){
    let index = place - 1;
    this.insTabChange.emit({
      event: this.insTabItems[index],
      index: index,
      label: this.insTabHeaders[index].innerText.trim()
    });
    this.setActiveTab(index);
    this.setActiveTabItem(index);
  }

  @Listen('insTabDisableToggle')
  tabItemDisableToggledHandler(event: CustomEvent<boolean>){
    let tabIndex = this.insTabItems.indexOf(event.target);
    if (this.insTabHeaders[tabIndex]) {
      if (event.detail){
        this.insTabHeaders[tabIndex].classList.add('disabled');
      } else {
        this.insTabHeaders[tabIndex].classList.remove('disabled');
      }
    }
  }

  @Listen('insTabError')
  checkForErrors(event: CustomEvent<boolean>){
    let errorIndex = this.insTabItems.indexOf(event.target);
    if (this.insTabHeaders[errorIndex]) {
      if (event.detail){
        this.insTabHeaders[errorIndex].classList.add('has-error');
      } else {
        this.insTabHeaders[errorIndex].classList.remove('has-error');
      }
    }
  }

  render() {
    return (
      <div class="ins-tab">
        <ul class="ins-tab-headers" onMouseOver={() => this.setScrollableHeaders()}>
          {this.insTabItems.map((item, index) => {
            return (
              <li
                class={`ins-tab-header ${item.hasError ? 'has-error' : ''}`}
                onClick={e => this.onchangeTabHandler(e, index)}>
                {item.icon ? <span class={`${item.icon}`}></span>: ''} {item.icon && !item.label ? '' : <span>{this.setTabLabel(item, index)}</span>}
              </li>
            )
          })}
        </ul>
        <slot />
      </div>
    )
  }
}
