import { h, Component, Prop, Event, EventEmitter, Element, State } from "@stencil/core";

@Component({ tag: "ins-button" })
export class InsButton {
  @Element() insButtonEl: HTMLElement;
  @Event() insClick: EventEmitter<{label: string; data: string}>;
  @Event() insClickOption: EventEmitter<{label: string | null; option: string}>;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) color: string = 'blue';
  @Prop({ mutable: true }) label: string = 'BUTTON';
  @Prop({ mutable: true }) icon: string = '';
  @Prop({ mutable: true }) iconRight: string = '';
  @Prop({ mutable: true }) size: string = 'normal';
  @Prop({ mutable: true }) data: string = '';
  @Prop({ mutable: true }) type: string = '';
  @Prop({ mutable: true }) options: string = '';
  @Prop({ mutable: true }) optionsOnly: boolean = false;

  @Prop({ mutable: true }) dropdown: boolean = false;
  @Prop({ mutable: true }) solid: boolean = false;
  @Prop({ mutable: true }) outlined: boolean = false;

  @Prop({ mutable: true }) disabled: boolean = false;
  @Prop({ mutable: true }) cursor: string  = '';
  @Prop({ mutable: true }) textTransform: string  = '';
  @Prop({ mutable: true }) loading: boolean  = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  buttonOptions: string[] = [];
  target: HTMLElement;

  @State() toggleOption = false;
  @State() dropUp = false;

  btnOnClickHandler(e?: MouseEvent, target?: HTMLElement) {
    if (e && target) this.rippleHandler(e, target);
    if (this.dropdown && this.buttonOptions.length){
      this.toggleOptions();
    } else {
      this.toggleOption = false;
      this.insClick.emit({
        label: this.label,
        data: this.data
      });
    }
  }

  optionOnClickHandler(option: string) {
    this.toggleOption = false;
    this.insClickOption.emit({
      label: this.optionsOnly ? null : this.label,
      option
    });
  }

  addRippleEffect(startingPoint: MouseEvent, target: HTMLElement){
    let rect = target.getBoundingClientRect();
    let ripple = target.querySelector('.ripple-wave') as HTMLSpanElement;

    if (!ripple) {
      ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px';
      target.appendChild(ripple);
    }

    ripple.classList.remove('show');
    let top = startingPoint.pageY - (rect.top + window.scrollY) - ripple.offsetHeight / 2;

    let left = startingPoint.pageX - rect.left - ripple.offsetWidth / 2;
    ripple.style.top = top + 'px';
    ripple.style.left = left + 'px';
    ripple.classList.add('show');

    setTimeout(() => {
      if (target.contains(ripple)){
        target.removeChild(ripple);
      }
    }, 1250);

    return false;
  }


  componentWillLoad() {
    this.checkOptions();
  }

  componentDidLoad() {
    this.checkTarget();
    this.closeMenu();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insButtonEl);
    }
  }

  componentWillUpdate(){
    this.checkOptions();
  }

  componentDidUpdate() {
    this.checkTarget();
  }

  rippleHandler(e: MouseEvent, target: HTMLElement){
    if (!this.disabled && !this.loading) {
      if (!target) this.checkTarget();
      this.addRippleEffect(e, target);
    }
  }

  checkTarget(){
    this.target = this.insButtonEl.querySelector('button') as HTMLElement;
    if (this.options){
      this.target = this.insButtonEl.querySelector('.ins-button-options-wrap') as HTMLElement;
    }
  }

  checkOptions(){
    if (this.options) this.buttonOptions = this.options.split(',');
  }

  toggleOptions(){
    if(!this.disabled){

      this.dropUp = false;
      let pos = this.insButtonEl.getBoundingClientRect();
      if ((window.innerHeight - pos.bottom) < 90) {
        this.dropUp = true;
      }

      this.toggleOption = !this.toggleOption;
    }
  }

  closeMenu() {
    window.addEventListener('click', event => {
      let clickedEl = event.target as HTMLElement;
      let closestEl = clickedEl.closest('ins-button');

      if (closestEl !== this.insButtonEl){
        if (this.toggleOption) {
          this.toggleOption = false;
        }
      }
    })
  }

  renderLabelIcon(){
    return(
      <div>
        {this.icon
          ? <i class={`btn__icon ${this.icon}
              ${this.label == '' ? 'action' : '' }`}>
            </i>

          : '' }

        <span class={`btn__label ${this.icon ? 'v-align' : ''}`}>
          {this.label}
        </span>

        {this.iconRight
          ? <i class={`btn__icon right ${this.iconRight}`}></i>
          : '' }
      </div>
    )
  }

  render() {
    if (this.options){

      return (
        <div class={`ins-button-options-wrap${this.optionsOnly ? ' options-only' : ''}`}
          onClick={e => this.rippleHandler(e, this.target)}>

          <div class="button-wrap">
            <button
              type={this.type}
              disabled={this.disabled || this.loading ? true : false}
              onClick={() => this.btnOnClickHandler()}
              class={`ins-button ${this.disabled || this.loading ? '' : 'ripple'}
                ${this.loading ? 'is-loading' : ''}
                ${this.size ? 'size--' + this.size : ''}
                ${this.solid || this.loading ? 'solid' :''}
                ${this.outlined || (this.options && !this.solid && !this.optionsOnly) ? 'outlined' :''}
                ${this.cursor ? 'cursor--' + this.cursor : ''}
                ${this.textTransform ? 'text-transform--' + this.textTransform : ''}
                ${this.color}
                ${this.label == '' && this.icon && !this.iconRight ? 'round' : ''}
                ${this.buttonOptions.length ? 'has-options':''}`
              }
            >
              {this.loading
                ? <div class={`spinner ${this.solid ? '' : this.color}`}></div>
                : this.renderLabelIcon() }
            </button>

            {this.buttonOptions.length
              ? <i class={`carets ${this.color}
                  icon-caret-${this.toggleOption ? 'up':'down'}
                  ${this.loading ? 'loading':''}
                  ${this.solid || this.loading ? 'solid' :''}`}
                  onClick={() => this.toggleOptions()}>
                </i>
              : ''
            }
          </div>
          <div class={` options-wrap

            ${this.dropUp ? 'drop-up' : ''}
            ${this.toggleOption ? 'show':'hide'}`}>

            <ul class={`option-wrap`}>

              {this.buttonOptions.map(option => {
                return (
                  <li class={`option
                    ${this.color}
                    ${this.solid ? 'solid' :''}
                    ${this.outlined ? 'outlined' :''}`}
                    onClick={() => this.optionOnClickHandler(option)}>

                    {option}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )

    } else {

      return (
        <button
          type={this.type}
          disabled={this.disabled || this.loading ? true : false}
          onClick={e => this.btnOnClickHandler(e, this.target)}
          class={`ins-button ${this.disabled || this.loading ? '' : 'ripple'}
            ${this.loading ? 'is-loading' : ''}
            ${this.size ? 'size--' + this.size : ''}
            ${this.solid || this.loading ? 'solid' :''}
            ${this.outlined ? 'outlined' :''}
            ${this.cursor ? 'cursor--' + this.cursor : ''}
            ${this.textTransform ? 'text-transform--' + this.textTransform : ''}
            ${this.color}
            ${this.label == '' && this.icon && !this.iconRight ? 'round' : ''}
            ${this.optionsOnly ? 'hide--label' : ''}`
          }
        >
          {this.loading
            ? <div class={`spinner ${this.solid ? '' : this.color}`}></div>
            : this.renderLabelIcon() }

        </button>
      );
    }
  }
}
