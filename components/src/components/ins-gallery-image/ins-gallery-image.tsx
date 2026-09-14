import { h, Component, Prop, Event, EventEmitter, Element, Method } from "@stencil/core";

@Component({ tag: 'ins-gallery-image' })
export class InsGalleryThumbnail {
  @Element() el: HTMLElement;
  @Event() insGalleryUpdate: EventEmitter<{ thumbnail: string; image: string }>;

  @Prop({ mutable: true }) thumbnail: string;
  @Prop({ mutable: true }) image: string;
  @Prop({ mutable: true }) imgAlt: string;
  @Prop({ mutable: true }) imgTitle: string;
  // @Prop({ mutable: true }) default: boolean;

  // TODO:
  // Shape: square, circle
  // empty source handler will render a bullet like UI

  clickHandler(){
    this.activate();
    this.insGalleryUpdate.emit({
      thumbnail: this.thumbnail,
      image: this.image
    });
  }

  @Method()
  async activate(){
    let parent = this.el.closest('ins-gallery');
    let thumbs = parent.querySelectorAll('ins-gallery-image');
    for (let i = 0; i < thumbs.length; i++){
      await thumbs[i].deactivate();
    }
    this.el.classList.add('active');
    return true;
  }

  @Method()
  async deactivate(){
    this.el.classList.remove('active');
    return true;
  }

  // componentDidLoad(){
  //   if (this.default) this.clickHandler();
  // }

  render() {
    return (
      <div class="ins-gallery-image" onClick={() => { this.clickHandler() }}>
        <img src={this.thumbnail} alt={this.imgAlt} title={this.imgTitle} />
      </div>
    );
  }
}
