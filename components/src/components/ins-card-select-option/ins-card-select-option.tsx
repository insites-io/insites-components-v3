import { h, Component, Prop, Event, EventEmitter, Method } from "@stencil/core";

@Component({
  tag: 'ins-card-select-option',
  styleUrl: "./ins-card-select-option.scss"
})

export class InsCardSelectOption {
  @Event() insCardSelectOptionClicked: EventEmitter;

  @Prop({mutable: true}) value: string = '';
  @Prop({mutable: true}) disabled: boolean = false;
  @Prop({mutable: true}) default: boolean = false;
  @Prop({mutable: true}) activated: boolean = false;
  @Prop({mutable: true}) hidden: boolean = false;

  insCardSelectOptionClickHandler(){
    this.insCardSelectOptionClicked.emit({
      value: this.value
    });
  }

  @Method() async activate(){
    this.activated = true;
  }

  @Method() async deactivate(){
    this.activated = false;
  }

  @Method() async toggle() {
    this.activated = !this.activated;
  }

	render() {
    return (
      <div class={`
        ins-card-option-wrap
        ${!this.value ? 'no-value': ''}
        ${this.activated ? 'selected': ''}`}
        onClick={() => this.insCardSelectOptionClickHandler()}>
        <slot />
      </div>
    );
	}
}
