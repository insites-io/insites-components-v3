import { h, Component, Prop, Element, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-info-table' })
export class InsInfoTable {
  @Element() insInfoTableEl: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) noWrap: boolean = false;
  @Prop({ mutable: true }) heading: string;
  @Prop({ mutable: true }) loadingScreen: boolean = false;
  @Prop({ mutable: true }) loaderTitle: any = "Just a moment";
  @Prop({ mutable: true }) loaderMessage: any = "We are processing your request";
  @Prop({ mutable: true }) loaderIcon: any = "processing";
  @Prop({ mutable: true }) tableData: any = [];
  @Prop({ mutable: true }) emptyValue: string = '-';
  @Prop({ mutable: true }) textOverflow: string = 'ellipsis';
  @Prop({ mutable: true }) renderHtml: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insInfoTableEl);
    }
  }

  renderTableItems(item: Record<string, any>){
    let myValue, myKey;
    for (let key in item) {
      myKey = key;
      myValue = item[key];
  }
    return (
      <div class="ift-row">
        <div class={`ift-cell ift-label ${this.textOverflow === "ellipsis" ? 'overflow-ellipsis' : ''}`}>
          {
            this.renderHtml ? <div class="ift-html" innerHTML={myKey}></div>
            : myKey ? myKey : this.emptyValue
          }
        </div>
        <div class={`ift-cell ift-content ${this.textOverflow === "ellipsis" ? 'overflow-ellipsis' : ''}`}>
          {
            this.renderHtml ? <div class="ift-html" innerHTML={myValue ? myValue : this.emptyValue}></div>
            : myValue ? myValue : this.emptyValue
          }
        </div>
      </div>)
  }

  buildInfoTable() {
    return (
    <div class="ift-table-content">
    {this.heading ? <div class="ift-table-wrap__title">{this.heading}</div> : ''}
      <div class="ift-table">
        {
          this.tableData.length ?
            this.tableData.map(this.renderTableItems.bind(this))
            :
            <div class="ift-row">
              <div class="ift-cell no-data">No Data</div>
            </div>
        }
        </div>
    </div>)
  }

  render() {
    return (
      <div class={`ift-table-wrap ${this.noWrap ? 'no-wrap' : ''}`}>
        {this.loadingScreen ?
          <div class={`loading-screen`}>
            <ins-loader
              state-title={this.loaderTitle}
              state-message={this.loaderMessage}
              state-icon={this.loaderIcon}>
            </ins-loader>
          </div>
          : this.buildInfoTable()}
      </div>
    )
  }
}
