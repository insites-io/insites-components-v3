import { h, Component, Prop, Event, EventEmitter, Method } from "@stencil/core";

@Component({ tag: 'ins-input-select-option' })

export class InsInputSelectOption {
  @Event() insInputSelectOptionClicked: EventEmitter<{ value: string; label: string }>;

  @Prop({mutable: true}) label: string = 'Option';
  @Prop({mutable: true}) value: string = '';
  @Prop({mutable: true}) disabled: boolean = false;
  @Prop({mutable: true}) default: boolean = false;
  @Prop({mutable: true}) activated: boolean = false;
  @Prop({mutable: true}) hidden: boolean = false;

  insInputSelectOptionClickHandler(){
    if (!this.disabled){
      this.insInputSelectOptionClicked.emit({
        value: this.value,
        label: this.label,
      });
    }
  }

  @Method() async activate(){
    this.activated = true;
  }

  @Method() async deactivate(){
    this.activated = false;
  }

  @Method() async hideOption(){
    this.hidden = true;
  }

  @Method() async showOption(){
    this.hidden = false;
  }

	render() {
    return (
      <div class={`
        ins-select-option-wrap
        ${!this.value ? 'no-value': ''}
        ${this.activated ? 'selected': ''}
        ${this.hidden ? 'hidden': ''}
        ${this.disabled ? 'disabled': ''} `}
        onClick={() => this.insInputSelectOptionClickHandler()}>
        {this.label}
      </div>
    );
	}
}
