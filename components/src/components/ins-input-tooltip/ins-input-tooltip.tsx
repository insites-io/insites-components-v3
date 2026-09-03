import { h, Component, Prop, Element } from "@stencil/core";
import tippy from 'tippy.js';

@Component({
  tag: 'ins-input-tooltip',
  styleUrl: './ins-input-tooltip.scss'
})

export class InsInputTooltip {
  @Element() el: HTMLElement;
  @Prop({mutable: true}) content: string = "";
  @Prop({mutable: true}) trigger: string = "click";
  @Prop({mutable: true}) label: string = "";
  @Prop({mutable: true}) icon: string = "";

  componentDidLoad(){
    let tooltipEl = this.el.querySelector('.ins-input-tooltip') as HTMLElement;
    tippy(tooltipEl, {
      content: this.content,
      allowHTML: true,
      hideOnClick: true,
      trigger: this.trigger,
      interactive: true
    });
  }

  render() {
    return (
      this.label && this.icon ?
      <div class={`ins-input-tooltip`}>
        <span class="tooltip-label">
          <span>{!!this.icon ? <i class={`${this.icon}`}></i> : ''} {!!this.label ? this.label : ''}</span>
        </span>
      </div>
      : <span class={`ins-input-tooltip`}>?</span>
    );
  }
}
