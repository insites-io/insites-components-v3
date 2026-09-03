import { h, Component, State, Prop, Element, Event, EventEmitter, Method } from "@stencil/core";

@Component({ tag: 'ins-modal' })
export class InsModal {
  @Element() insModalEl: HTMLElement;
  @Event() insClose: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) withBackdrop: boolean;
  @Prop({ mutable: true }) light: boolean;
  @Prop({ mutable: true }) confirmation: boolean;
  @Prop({ mutable: true }) heading: string;
  @Prop({ mutable: true }) value: any;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @Prop({ mutable: true }) parentRender: string;
  @Prop({ mutable: true }) childModal: any;
  @Prop({ mutable: true }) noButton: boolean = false;
  @Prop({ mutable: true }) buttonAlignment: string = "center";
  @Prop({ mutable: true }) preventClickOutside: boolean = false;

  @Prop({ mutable: true }) closeButtonLabel: string = 'CANCEL';
  @Prop({ mutable: true }) closeButtonIcon: string;
  @Prop({ mutable: true }) closeButtonColor: string;

  @Prop({ mutable: true }) confirmButtonLabel: string = 'OK';
  @Prop({ mutable: true }) confirmButtonIcon: string;
  @Prop({ mutable: true }) confirmButtonColor: string;

  @Prop({ mutable: true }) width: string = "80%";
  @Prop({ mutable: true }) height: string = "80%";
  @Prop({ mutable: true }) fullHeight: boolean;

  @State() showModal: boolean = false;

  parentModal: any;

  componentDidLoad() {
    this.adjustPosition();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insModalEl);
    }
  }

  componentDidUpdate() {
    this.adjustPosition();
  }

  openParentModal(){
    let parentModal = parent.document.getElementById(this.parentRender) as any;

    parentModal.value = this.value;
    parentModal.light = this.light;
    parentModal.width = this.width;
    parentModal.height = this.height;
    parentModal.heading = this.heading;
    parentModal.noButton = this.noButton;
    parentModal.buttonAlignment = this.buttonAlignment;
    parentModal.withBackdrop = this.withBackdrop;
    parentModal.confirmation = this.confirmation;

    parentModal.closeButtonColor = this.closeButtonColor;
    parentModal.closeButtonLabel = this.closeButtonLabel;
    parentModal.closeButtonIcon = this.closeButtonIcon;

    parentModal.confirmButtonColor = this.confirmButtonColor;
    parentModal.confirmButtonLabel = this.confirmButtonLabel;
    parentModal.confirmButtonIcon = this.confirmButtonIcon;

    parentModal.preventClickOutside = this.preventClickOutside;
    parentModal.childModal = this.insModalEl;

    let parentModalBody = parentModal.querySelector('.ins-modal-body');
    let body = this.insModalEl.querySelector('.ins-modal-body');

    let insEls = body.querySelectorAll('.hydrated');

    for (let i = 0; i < insEls.length; i++){
      if(insEls[i].nodeName.includes('INS-')){
        insEls[i].innerHTML = "";
        insEls[i].classList.remove('hydrated');
      }
    }

    parentModalBody.innerHTML = body.innerHTML;

    body.addEventListener('DOMSubtreeModified', () => {
      parentModalBody.innerHTML = body.innerHTML;
    });

    parentModal.open();
  }

  adjustPosition(){
    let insCard = this.insModalEl.querySelector('ins-card') as HTMLElement;
    insCard.style.width = this.width;
    insCard.style.height = this.height;

    let insCardWrap = insCard.querySelector('.ins-card-wrap');
    let adjust = insCardWrap.clientWidth / 2 + 1;
    insCardWrap.parentElement.style.left = `calc(50% - ${adjust}px)`;
  }

  closeConfirmModal(type: string){
    this.insClose.emit({
      action: type,
      value: this.value
    });
    this.showModal = false;

    if (this.childModal){
      this.childModal.parentClosed(type)
    }
  }

  @Method()
  async parentClosed(type: string){
    this.closeConfirmModal(type);
  }

  @Method()
  async open(){
    this.parentRender && (parent.document !== document)
      ? this.openParentModal()
      : this.showModal = true;
  }

  @Method()
  async close(){
    this.parentRender && (parent.document !== document)
      ? this.closeParentModal()
      : this.showModal = false;
  }

  closeParentModal(){
    let parentModal = parent.document.getElementById(this.parentRender) as any;
    parentModal.close()
  }

  clickOutsideHandler(e: MouseEvent){
    if (this.preventClickOutside) return;
    let insModalWrap = this.insModalEl.querySelector('.ins-modal-wrap');
    let insModalBackdrop = this.insModalEl.querySelector('.ins-backdrop-wrap');

    if (e.target === insModalWrap || e.target === insModalBackdrop){
      this.closeConfirmModal('clicked-outside');
    }
  }

  render() {
    return (
      <div class={`ins-modal-wrap ${this.height === 'auto' ? 'auto' : ''}
        ${this.showModal ? 'show-modal' : ''} ${this.light ? 'light' : ''}
        ${this.noButton ? 'no-button' : ''}
        ${this.fullHeight ? 'full-height' : ''}
        ${this.heading ? 'has-heading' : ''}
        ${this.noButton ? 'no-button' : ''}`} onClick={e => this.clickOutsideHandler(e)}>

        {this.withBackdrop ? <ins-backdrop light={this.light}></ins-backdrop> : ''}
        <ins-card steady no-padding>

          <div class="ins-modal-content">

            <div class={`ins-modal-head ${!this.heading ? 'no-heading':''}`}>
              <h1 class="ins-modal-head-h1">{this.heading}</h1>
              <span class="icon-close-1"
                onClick={() => this.closeConfirmModal('canceled')}>
              </span>
            </div>

            <div class={`ins-modal-body ${this.parentRender ? 'hide-body':''}`}>
              <slot />
            </div>

            {this.noButton ? "" :
              <div class={`ins-modal-button-wrap text-${this.buttonAlignment}`}>
                {this.confirmation ?
                <ins-button
                  label={this.closeButtonLabel}
                  icon={this.closeButtonIcon}
                  color={this.closeButtonColor}
                  outlined
                  onClick={() => this.closeConfirmModal('canceled')}>
                </ins-button> : ''}

                <ins-button
                  label={this.confirmButtonLabel}
                  icon={this.confirmButtonIcon}
                  color={this.confirmButtonColor}
                  solid
                  onClick={() => this.closeConfirmModal(
                    this.confirmation ? 'confirmed' : 'canceled')}>
                </ins-button>
              </div>
            }
          </div>
        </ins-card>
      </div>
    )
  }
}
