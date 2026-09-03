import { h, Component, State, Prop, Listen, Element, Event, EventEmitter } from "@stencil/core";
declare var $;
@Component({ tag: 'ins-instances' })
export class InsInstances {
  @Element() el: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) logoLink: string = "";
  @Prop({ mutable: true }) instance: string = "";
  @Prop({ mutable: true }) instanceLink: string = "";
  @Prop({ mutable: true }) newTab: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @State() dropDownState: boolean;
  @State() hasItems: boolean;
  @State() activeSubItem: boolean;

  @Listen('activeSubItem')
  activeSubItemHandler(){
    this.activeSubItem = false;
  }

  @Listen('routeInstance')
  routeInstanceHandler(event: CustomEvent<{ instance: string; logoLink: string; withSubItem: boolean }>){
    this.instance = event.detail.instance;
    this.logoLink = event.detail.logoLink;

    this.activeSubItem = event.detail.withSubItem;
  }

  componentWillLoad(){
    if (this.el.querySelectorAll('ins-instances-item').length > 0) {
      this.hasItems = true;
    }
  }

  componentDidLoad() {
    if ((window as any).$){
      $('#instancesLogo').on('error', function () {
        $(this).attr('src', 'https://lh4.googleusercontent.com/-k147BY0tZM8/AAAAAAAAAAI/AAAAAAAAARY/NL7bNLj_cV8/photo.jpg?sz=32');
      });
    }

    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.el);
    }
  }

  toggleDropDown(){
    this.dropDownState = !this.dropDownState;
  }

  relocate(link: string){
    link = (link) ? link : '/';

    if (this.newTab) {
      window.open(link, '_blank');
      return;
    }

    window.location.assign(link);
  }

  render() {
    return (
      <div class={`ins-instances-wrap ${this.activeSubItem ? 'sub-item-active' : ''}`}>
        <div class={`active-instance ${this.hasItems ? 'has-items' : ''}`}>
          <img src={this.logoLink ? this.logoLink : ''} />

          <button>
            <span class="active-instance-label">
              {this.instance ? this.instance : 'Label'}
            </span>
          </button>

          <div class="icons-wrap">
            <i class="icon-keyboard-arrow-up"></i>
            <i class="icon-keyboard-arrow-up down"></i>
          </div>
        </div>

        { this.hasItems ?
          <div class="ins-instances-options">
            <ins-card steady>
              <ins-input placeholder="Search" icon="icon-search"></ins-input>
              <div class="scroll-wrap">
                <slot />
              </div>
            </ins-card>
          </div>
        : '' }
      </div>
    )
  }
}
