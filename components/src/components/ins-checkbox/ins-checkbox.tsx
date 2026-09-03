import { h, Component, Prop, Event, EventEmitter, Method, Element } from "@stencil/core";

@Component({ tag: "ins-checkbox" })
export class InsCheckbox {
  @Element() insCheckboxEl: HTMLElement;
  @Event() insCheck: EventEmitter;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable: true}) checked: boolean;
  @Prop({mutable: true}) disabled: boolean;
  @Prop({mutable: true}) value: string;
  @Prop({mutable: true}) trueValue: string = "";
  @Prop({mutable: true}) falseValue: string = "";
  @Prop({mutable: true}) label: string;
  @Prop({mutable: true}) name: string = "";
  @Prop({mutable: true}) tooltip: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insCheckboxEl);
    }
  }

  onValueChangeHandler(){
    let toEmit = this.value;

    if (this.checked && this.trueValue){
      toEmit = this.trueValue;
    } else if (!this.checked && this.falseValue){
      toEmit = this.falseValue;
    }

    this.insValueChange.emit(toEmit);
  }

  onCheckHandler(){
    this.checked = !this.checked;
    this.insCheck.emit({
      name: this.name,
      checked: this.checked,
      value: this.value,
      trueValue: this.trueValue,
      falseValue: this.falseValue
    });

    this.onValueChangeHandler();
  }

  @Method()
  async updateCheckState(state: boolean){
    this.checked = state;
  }

  @Method()
  async setValue(value: string, trueValue: string, falseValue: string){
    this.value = value;
    this.trueValue = trueValue;
    this.falseValue = falseValue;
    this.onValueChangeHandler();
  }

  @Method()
  async getValue(){
    return {
      value: this.value,
      trueValue: this.trueValue,
      falseValue: this.falseValue
    }
  }

  render() {
    return (
      <div class="ins-checkbox-wrap ins-radio-checkbox">
        <label>
          <input type="checkbox"
            name={this.name ? this.name : ''}
            disabled={this.disabled}
            class="ripple-check"
            onChange={() => this.onCheckHandler()}
            checked={this.checked}
            value={this.value}
            true-value={this.trueValue}
            false-value={this.falseValue} />

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
    )
  }
}
