import { h, Component, Prop, Event, EventEmitter, Element, Method } from "@stencil/core";

@Component({ tag: "ins-radio" })
export class InsRadio {
  @Element() insRadioEl: HTMLElement;
  @Event() insCheck: EventEmitter;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable:true}) checked: boolean;
  @Prop({mutable:true}) disabled: boolean;
  @Prop({mutable:true}) value: any;
  @Prop({mutable:true}) staticValue: any;
  @Prop({mutable:true}) name: any;
  @Prop({mutable:true}) label: any;
  @Prop({mutable: true}) tooltip: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  localChecked: boolean = false;

  @Method()
  async setValue(value: any, static_value: any){
    this.value = value;
    this.staticValue = static_value;
  }

  @Method()
  async setChecked(){
    this.localChecked = true;
    this.checked = true;
    this.onSelectHandler();
  }

  @Method()
  async getValue(){
    return this.staticValue ? this.staticValue : this.value;
  }

  componentWillLoad(){
    this.checkValue();
  }

  componentWillUpdate(){
    this.checkValue();
  }

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insRadioEl);
    }
  }

  checkValue(){
    if (this.value === this.staticValue){
      this.localChecked = true;
    } else if (this.checked){
      this.localChecked = true;
    } else this.localChecked = false;
  }

  onSelectHandler(){
    this.insCheck.emit({
      name: this.name,
      value: this.value,
    });

    if (this.staticValue){
      this.insValueChange.emit(this.staticValue);
    } else this.insValueChange.emit(this.value);
  }

  render() {
    return (
      <div class="ins-radio ins-radio-checkbox">
        <label>
          <input class="ripple-check radio"
            onChange={() => this.onSelectHandler()}
            type="radio"
            value={this.staticValue ? this.staticValue : this.value}
            name={this.name}
            disabled={this.disabled}
            checked={this.localChecked} />

            { this.label
              ? <span class="ins-checkbox-radio-label">
                  {this.label}
                </span>
              : ''
            }
        </label>

        {this.tooltip
          ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
          : ''
        }
      </div>
    );
  }
}
