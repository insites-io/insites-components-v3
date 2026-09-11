import { h, Component, Prop } from "@stencil/core";

@Component({ tag: 'ins-select-group' })
export class InsSelectGroup {
  @Prop({mutable: true}) label: string = "Options Group"
  render() {
    return (
      <div class="ins-select-group">
        <div class="ins-select-group_label">{this.label}</div>
        <div class="ins-select-group_options">
          <slot />
        </div>
      </div>
    );
  }
}
