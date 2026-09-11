import { h, Component, Prop, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-input-search-option' })

export class InsInputSearchOption {
  @Event() insInputSearchOptionClicked: EventEmitter<{ value: string; label: string }>;

  @Prop({mutable: true}) label: string = 'Option';
  @Prop({mutable: true}) value: string = '';
  @Prop({mutable: true}) activated: boolean = false;

  insInputSearchOptionClickHandler() {
    this.insInputSearchOptionClicked.emit({
      value: this.value,
      label: this.label,
    });
  }

  render() {
    return (
      <div class={`
        ins-input-search-option-wrap
        ${this.activated ? 'selected': '' }
        ${!this.value ? 'no-value': ''}`}
        onMouseDown={() => this.insInputSearchOptionClickHandler()}>
        {this.label}
      </div>
    );
  }
}
