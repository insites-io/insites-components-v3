import { h, Component, Prop, Event, EventEmitter, Element, State, Method, Watch } from "@stencil/core";

@Component({ tag: "ins-button-group" })

export class InsButtonGroup {
  @Element() insButtonGroupEl: HTMLElement;
  @Event() insClick: EventEmitter<{action: string; label: string; index: number}>;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) activeOption: string = "";
  @Prop({ mutable: true }) options: string = "";
  @Prop({ mutable: true }) size: string = 'normal';
  @Prop({ mutable: true }) color: string = 'blue';
  @Prop({ mutable: true }) disabled: boolean;
  @Prop({ mutable: true }) activeIndex: number = 0;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @State() buttonOptions: string[] = []

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insButtonGroupEl);
    }
  }

  @Method()
  async getActiveOption() {
    return {
      index: this.activeIndex,
      label: this.buttonOptions[this.activeIndex]
    }
  }

  @Method()
  async setActiveOption(option: string) {
    if (this.buttonOptions.indexOf(option) !== -1) {
      this.activeIndex = this.buttonOptions.indexOf(option);
    }
  }

  @Watch('activeIndex')
  activeIndexHandler() {
    let list = Array.from(this.insButtonGroupEl.querySelectorAll('button'));
    list.forEach((element) => {
      element.classList.remove('active');
    });
    list[this.activeIndex].classList.add('active');
  }

  buttonActionHandler(action: string, label: string, index: number) {
    this.activeIndex = index;
    this.insClick.emit({ action, label, index });
  }

  componentWillLoad() {
    if (this.options) {
      this.options.split(',').map((item) => {
        this.buttonOptions.push(item.trim());
      });
    }

    if (this.buttonOptions.indexOf(this.activeOption) !== -1) {
      this.activeIndex = this.buttonOptions.indexOf(this.activeOption);
    }
  }

  render() {
    return(
      <div class={`ins-button-group ${this.size}`}>
        {
          this.buttonOptions.map((item, index) => {
            return (
              <button
                type="button"
                disabled={this.disabled}
                onClick={() => this.buttonActionHandler('buttonItemClick', item, index)}
                class={`${this.activeIndex === index ? 'active' : ''} ${this.color}`}>
                {item}
              </button>
            )
          })
        }
      </div>
    )
  }
}
