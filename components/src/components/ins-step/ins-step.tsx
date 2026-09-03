import { h, Component, Prop, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-step' })
export class InsStep {
  @Event() insStepClick: EventEmitter<void>;

  @Prop({ mutable: true }) indicator: string = "";
  @Prop({ mutable: true }) icon: string = "";
  @Prop({ mutable: true }) description: string = "";
  @Prop({ mutable: true }) active: boolean = false;
  @Prop({ mutable: true }) complete: boolean = false;
  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) hasError: boolean = false;

  render() {
    return (
      <div class={`ins-step
        ${this.hasError ? 'has-error' : ''}
        ${this.active ? 'active' : ''}
        ${this.disabled ? 'disabled' : ''}
        ${this.complete ? 'completed' : ''}`}

        onClick={() => this.disabled ? '' : this.insStepClick.emit()}>

        <div class="ins-step_progress-bar"></div>
        <div class="ins-step_details">
          <div class={`ins-step_indicator
            ${ this.icon ? "ins-step_indicator-icon" : ""}`}>

            { this.icon
              ? <span class={this.icon}></span>
              : <span>{this.indicator}</span>
            }

            { this.icon
              ? <i class={`complete-icon ${this.icon}`}></i>
              : <i class="complete-icon icon-check"></i>
            }

            { this.indicator || this.icon ? "" :
              <div class="ins-step_dot"></div>
            }
          </div>

          { this.description
            ? <div class="ins-step_description">
                { this.description }
              </div>
            : ""
          }
        </div>

      </div>
    );
  }
}
