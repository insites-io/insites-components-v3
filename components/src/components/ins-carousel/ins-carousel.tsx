import { h, Component, Prop, Element, Method, Event, EventEmitter } from "@stencil/core";
import Siema from "../../assets/js/custom-siema";

@Component({ tag: 'ins-carousel' })
export class InsCarousel {
  @Element() insCarouselEl: HTMLElement;
  @Event() insSlide: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) heading: string = "";
  @Prop({ mutable: true }) subHeading: string = "";
  @Prop({ mutable: true }) bodyText: string = "";

  @Prop({ mutable: true }) ctaLabel: string = "";
  @Prop({ mutable: true }) ctaLink: string = "";
  @Prop({ mutable: true }) ctaColor: string = "blue";
  @Prop({ mutable: true }) ctaLinkTarget: string = "_blank";
  @Prop({ mutable: true }) ctaDisabled: boolean = false;

  @Prop({ mutable: true }) layout: number = 1;

  @Prop({ mutable: true }) width: string = "100%";
  @Prop({ mutable: true }) height: string = "auto";

  @Prop({ mutable: true }) bindTo: string = "";
  @Prop({ mutable: true }) startIndex: number = 0;
  @Prop({ mutable: true }) transition: number = 350;
  @Prop({ mutable: true }) duration: number = 3000;
  @Prop({ mutable: true }) autoplay: boolean = false;
  @Prop({ mutable: true }) autostop: boolean = false;
  @Prop({ mutable: true }) loop: boolean = false;

  @Prop({ mutable: true }) perPage: number = 1;
  @Prop({ mutable: true }) noPagination: boolean = false;
  @Prop({ mutable: true }) noCarouselButton: boolean = false;
  @Prop({ mutable: true }) dragDisabled: boolean = false;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  slider: any;
  slides: Element;
  slideEls: NodeListOf<Element>;
  slideInterval: ReturnType<typeof setInterval>;
  currentIndex: number;
  paginations: NodeListOf<Element>;

  componentDidLoad(){
    this.initSiema();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insCarouselEl);
    }
  }

  initSiema(){
    this.slides = this.insCarouselEl
      .querySelector(`.ins-carousel_slides #${this.bindTo}`);

    this.slider = new Siema({
      selector: this.slides,
      perPage: this.perPage,
      draggable: !this.dragDisabled,
      duration: this.transition,
      startIndex: this.startIndex,
      loop: this.loop,
      onChange: this.slideChanged.bind(this),
      onDrag: this.resumeAutoPlay.bind(this)
    });

    this.initDimensions()
    this.initPagination();
    this.currentIndex = this.startIndex;
    if (this.autoplay) this.initAutoplay();
  }

  initDimensions(){
    let mainWrap = this.insCarouselEl.querySelector('.ins-carousel_slides') as HTMLElement;
    mainWrap.style.height = this.height;

    if (this.layout !== 3) mainWrap.style.width = this.width;
    if (this.layout === 2) {
      let headHeight = this.insCarouselEl.querySelector('.ins-carousel_head').clientHeight;
      let footerHeight = this.insCarouselEl.querySelector('.ins-carousel_footer').clientHeight;
      let contentHeight = headHeight + footerHeight;

      if (contentHeight > mainWrap.clientHeight){
        mainWrap.style.height = `${contentHeight}px`;
      }
    }
  }

  initAutoplay(){
    this.slideInterval = setInterval(() => {
      this.goTo('next');
    }, this.duration);
  }

  initPagination(){
    if (this.noPagination || this.perPage === 0) return;

    this.slideEls = this.slides.querySelectorAll(':scope > div > div');
    let paginationWrap = this.insCarouselEl.querySelector('.ins-carousel_paginations');
    let count = this.slideEls.length;

    if (this.perPage >= count) return;
    if (this.loop) count = count - (2 * this.perPage);
    count = count - this.perPage + 1;

    for (let i = 0; i < count; i++){
      paginationWrap.appendChild(this.renderPaginate(i));
    }

    this.paginations = this.insCarouselEl
      .querySelectorAll('.ins-carousel_paginations .pagination');
  }

  slideChanged(){
    this.currentIndex = this.slider.currentSlide;
    if (!this.noPagination) this.setActiveIndex(this.currentIndex);
  }

  resumeAutoPlay(){
    if (this.autoplay){
      this.stopAutoPlay();

      if (!this.autostop){
        this.initAutoplay();
      }
    }
  }

  stopAutoPlay(){
    clearInterval(this.slideInterval);
  }

  renderPaginate(index: number){
    let liEl = document.createElement('li');
    liEl.classList.add('pagination');
    liEl.addEventListener('click', () => this.goTo(index));

    if (index === this.startIndex) liEl.classList.add('active');
    return liEl;
  }

  setActiveIndex(index: number){
    for (let i = 0; i < this.paginations.length; i++){
      this.paginations[i].classList.remove('active');
    }
    this.paginations[index].classList.add('active');
  }

  @Method()
  async goTo(slide: string | number){
    let fromSlide = this.currentIndex;

    if (this.paginations && this.loop
      && this.currentIndex === (this.paginations.length - 1) ){
        slide = 0;
    }

    switch(slide){
      case "next": this.slider.next(); break;
      case "prev": this.slider.prev(); break;
      default: this.slider.goTo(slide);
    }

    this.resumeAutoPlay();
    let toSlide = this.currentIndex;
    this.insSlide.emit({ slide, fromSlide, toSlide });
  }

  renderHead(){
    return(
      <div class="ins-carousel_head">
        {this.heading ?
          <h1 class="ins-carousel_heading">{this.heading}</h1>
        : "" }

        {this.bodyText ?
          <p class="ins-carousel_body-text">{this.bodyText}</p>
        : "" }
      </div>
    )
  }

  renderBody(){
    return (
      <div class={`ins-carousel_body ${this.noCarouselButton ? "no-buttons" : ""}`}>
        <div class="ins-carousel_slides">
          <slot />
        </div>

        {this.noCarouselButton ? "" :
          <div class="ins-carousel_ctrl-btns">
            <ins-button icon="icon-angle-left" outlined label=""
              onInsClick={() => this.goTo('prev')}>
            </ins-button>

            <ins-button icon="icon-angle-right" outlined label=""
              onInsClick={() => this.goTo('next')}>
            </ins-button>
          </div>
        }

        {this.layout === 2 ? <ul class="ins-carousel_paginations"></ul> : "" }
      </div>
    )
  }

  renderFooter(){
    return (
      <div class="ins-carousel_footer">
        {this.subHeading ?
          <h2 class="ins-carousel_sub-heading">{this.subHeading}</h2>
        : "" }

        {this.ctaLabel && this.ctaLink ?
          <a href={this.ctaLink} target={this.ctaLinkTarget}>
            <ins-button solid
              disabled={this.ctaDisabled}
              color={this.ctaColor}
              label={this.ctaLabel}>
            </ins-button>
          </a>
        : "" }

        {this.layout !== 2
          ? <ul class="ins-carousel_paginations"></ul>
        : "" }
      </div>
    )
  }

  render() {
    if (this.layout === 3){
      return (
        <div class={`ins-carousel layout-${this.layout}`}>
          <div class="ins-carousel_left">
            {this.renderHead()}
            {this.renderFooter()}
          </div>

          <div class="ins-carousel_right">
            {this.renderBody()}
          </div>
        </div>
      )
    }

    return (
      <div class={`ins-carousel layout-${this.layout}`}>
        {this.renderHead()}
        {this.renderBody()}
        {this.renderFooter()}
      </div>
    )
  }
}