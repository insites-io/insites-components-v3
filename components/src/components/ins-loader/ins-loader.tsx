import { h, Component, Element, Prop, Event, EventEmitter, State, Watch } from "@stencil/core";
import { resolveAssetPath } from "../../utils/asset-host";

// Shipped on the components CDN and served on every stack: the image to show when none is given or the given
// one fails to load (TW#26951438).
const FALLBACK_LOADER = "https://components.insites.io/assets/images/loading-loop-2x.gif";

@Component({ tag: 'ins-loader' })
export class InsLoader {
  @Element() insLoaderEl: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) stateTitle: string = "";
  @Prop({ mutable: true }) stateMessage: string = "";
  @Prop({ mutable: true }) stateIcon: string = "";
  @Prop({ mutable: true }) iconColor: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  /** Loader image. Defaults to https://components.insites.io/assets/images/loading-loop-2x.gif; a root-relative /assets/ path is resolved against the module scripts' asset host. */
  @Prop({ mutable: true }) imageSource: string = FALLBACK_LOADER;
  @Prop({ mutable: true }) useImage: boolean = true;
  @State() imageFailed: boolean = false;

  @Watch("imageSource")
  imageSourceChanged() {
    this.imageFailed = false;
  }

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insLoaderEl);
    }
  }

  getState (){
    switch (this.stateIcon) {
      case 'processing':
        if (this.useImage) { // use gif / image
          // Modules pass /assets/... paths on the instance host, which 404 on the prod01 stack: resolve them
          // against the module scripts' asset host, and fall back to the CDN default loader when none is given
          // or the image still fails (TW#26951438).
          const src = this.imageFailed || !this.imageSource ? FALLBACK_LOADER : resolveAssetPath(this.imageSource);
          return (<img alt="processing" src={src} onError={() => { this.imageFailed = true; }} />)
        } else { // use SVG
          return (<svg xmlns="http://www.w3.org/2000/svg" class="spinner" viewBox="0 0 175.05 175.05"><defs></defs><title>processing</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M168.22,71.4,157,69.06l-.39-.08-.34-.2a2.6,2.6,0,0,1-1.2-1.53,70.3,70.3,0,0,0-5.44-13.13,2.58,2.58,0,0,1,.1-2.65L156,41.86a8.61,8.61,0,0,0-1.11-10.77L144,20.17a8.58,8.58,0,0,0-10.77-1.11l-9.61,6.3-.88.58-1-.23-.09,0-.34-.08-.31-.17A70.24,70.24,0,0,0,107.78,20a2.58,2.58,0,0,1-1.65-1.46l-.1-.23-.05-.24L103.64,6.83A8.62,8.62,0,0,0,95.23,0H79.8a8.62,8.62,0,0,0-8.4,6.83L69.06,18.08l-.08.37-.18.33A2.59,2.59,0,0,1,67.25,20a70.22,70.22,0,0,0-13.14,5.45l-.31.17-.34.08-.09,0-1,.22-.88-.58-9.61-6.29a8.58,8.58,0,0,0-10.77,1.11L20.17,31.1a8.62,8.62,0,0,0-1.11,10.77l6.3,9.61.25.38.1.45a2.63,2.63,0,0,1-.26,1.82A70.18,70.18,0,0,0,20,67.27a2.59,2.59,0,0,1-1.93,1.8h0L6.83,71.42A8.62,8.62,0,0,0,0,79.82V95.25a8.62,8.62,0,0,0,6.83,8.4L18.11,106l.36.07.32.17A2.62,2.62,0,0,1,20,107.82a70.16,70.16,0,0,0,5.43,13.09,2.6,2.6,0,0,1-.09,2.64h0l-6.31,9.64A8.62,8.62,0,0,0,20.19,144L31.1,154.88A8.58,8.58,0,0,0,41.87,156l9.65-6.32.89-.58,1,.24.09,0,.33.08.3.16A70.24,70.24,0,0,0,67.26,155,2.58,2.58,0,0,1,69,156.72l0,.1,0,.11,2.35,11.29a8.62,8.62,0,0,0,8.4,6.83H95.25a8.62,8.62,0,0,0,8.4-6.83L106,156.93l.08-.4.21-.35a2.6,2.6,0,0,1,1.51-1.17,70.2,70.2,0,0,0,13.1-5.43l.31-.17.34-.07.09,0,1-.22.88.57L133.2,156A8.58,8.58,0,0,0,144,154.87L154.88,144A8.61,8.61,0,0,0,156,133.18l-6.32-9.64-.22-.33-.1-.38a2.61,2.61,0,0,1,.23-1.93A70.24,70.24,0,0,0,155,107.78,2.57,2.57,0,0,1,157,106l11.26-2.35a8.62,8.62,0,0,0,6.83-8.4V79.8A8.62,8.62,0,0,0,168.22,71.4Zm.8,8.41,0,15.48v2l-2,.41-11.27,2.35a8.6,8.6,0,0,0-6.48,6,64.17,64.17,0,0,1-5,12,8.61,8.61,0,0,0,.36,8.81l6.31,9.71,1.11,1.7-1.44,1.43-11,10.92L138.2,152l-1.7-1.11-9.65-6.32a8.54,8.54,0,0,0-4.69-1.4,8.71,8.71,0,0,0-4.12,1,64.18,64.18,0,0,1-12,5,8.6,8.6,0,0,0-6,6.48L97.7,167l-.42,2H78.93l-.69-.56,0,0-.69-.56-.18-.87L75,155.7a8.61,8.61,0,0,0-6-6.48,64.16,64.16,0,0,1-12-5,8.71,8.71,0,0,0-4.12-1,8.53,8.53,0,0,0-4.69,1.4l-9.71,6.32L36.79,152l-1.43-1.44-10.92-11L23,138.2l1.11-1.7,6.31-9.64a8.61,8.61,0,0,0,.35-8.81,64.1,64.1,0,0,1-5-12,8.6,8.6,0,0,0-6.48-6L8,97.7l-2-.42v-2l0-15.48v-2l2-.41L19.32,75a8.6,8.6,0,0,0,6.48-6,64.15,64.15,0,0,1,5-12,8.61,8.61,0,0,0-.36-8.81l-6.3-9.68L23,36.79l1.44-1.43,11-10.92L36.86,23l1.7,1.11,9.6,6.29a8.54,8.54,0,0,0,4.69,1.4,8.73,8.73,0,0,0,4.13-1,64.15,64.15,0,0,1,12-5,8.6,8.6,0,0,0,6-6.48L77.35,8l.42-2h2l15.48,0h2l.41,2,2.34,11.24a8.6,8.6,0,0,0,6,6.48,64.21,64.21,0,0,1,12,5,8.71,8.71,0,0,0,4.12,1,8.54,8.54,0,0,0,4.69-1.4l9.67-6.29,1.7-1.11,1.43,1.44,10.92,11L152,36.86l-1.11,1.7-6.3,9.62a8.61,8.61,0,0,0-.36,8.81,64.23,64.23,0,0,1,5,12,8.6,8.6,0,0,0,6.48,6L167,77.35l2,.42Z" /><path class="cls-1" d="M87.52,46.93a40.6,40.6,0,1,0,40.6,40.59A40.33,40.33,0,0,0,87.52,46.93ZM112,112a34.34,34.34,0,0,1-24.44,10.13h0A34.57,34.57,0,1,1,112,112Z" /></g></g></svg>)
        }
      case 'warning':
        return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168.33 168.33"><defs></defs><title>warning</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M84.16,0a84.16,84.16,0,1,0,84.16,84.16A84.26,84.26,0,0,0,84.16,0Zm0,162.33a78.16,78.16,0,1,1,78.16-78.16A78.25,78.25,0,0,1,84.16,162.33ZM87.6,98.86,89,50.27H79.31l1.42,48.58Zm-3.44,8.2a6.28,6.28,0,0,0,0,12.55c3.64,0,6-2.73,6-6.28S87.81,107.05,84.16,107.05Z" /></g></g></svg>)

      case 'help':
        return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168.33 168.33"><defs></defs><title>Help</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M84.16,168.33a84.16,84.16,0,1,1,84.16-84.16A84.26,84.26,0,0,1,84.16,168.33ZM84.16,6a78.16,78.16,0,1,0,78.16,78.16A78.25,78.25,0,0,0,84.16,6Z" /><path class="cls-1" d="M80.5,99.16l-.2-2.63C79.7,91.06,81.52,85.09,86.58,79c4.55-5.36,7.08-9.31,7.08-13.87,0-5.16-3.24-8.6-9.61-8.7a18,18,0,0,0-10.22,3.14L71.4,53.21c3.34-2.43,9.11-4,14.47-4,11.64,0,16.9,7.19,16.9,14.88,0,6.88-3.85,11.84-8.7,17.61C89.61,86.91,88,91.37,88.3,96.53l.1,2.63Zm-2.23,14.17c0-3.74,2.53-6.38,6.07-6.38s6,2.63,6,6.38c0,3.54-2.33,6.28-6.07,6.28A5.93,5.93,0,0,1,78.28,113.33Z" /></g></g></svg>)

      case 'error':
        return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168.33 168.33"><defs></defs><title>Error</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M84.16,168.33a84.16,84.16,0,1,1,84.16-84.16A84.26,84.26,0,0,1,84.16,168.33ZM84.16,6a78.16,78.16,0,1,0,78.16,78.16A78.25,78.25,0,0,0,84.16,6Z" /><rect class="cls-1" x="39.03" y="81.16" width="90.27" height="6" transform="translate(-34.85 85.64) rotate(-45.71)" /><rect class="cls-1" x="81.16" y="39.03" width="6" height="90.27" transform="translate(-34.85 85.63) rotate(-45.71)" /></g></g></svg>)

      case 'success':
        return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168.33 168.33"><defs></defs><title>Success</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M84.16,168.33a84.16,84.16,0,1,1,84.16-84.16A84.26,84.26,0,0,1,84.16,168.33ZM84.16,6a78.16,78.16,0,1,0,78.16,78.16A78.25,78.25,0,0,0,84.16,6Z" /><polygon class="cls-1" points="69.19 123.14 41.04 94.13 45.34 89.95 69.2 114.53 130.09 52.13 134.38 56.31 69.19 123.14" /></g></g></svg>)

      case 'downloading':
        return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168.33 168.33"><defs></defs><title>downloading</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M84.16,168.33a84.16,84.16,0,1,1,84.16-84.16A84.26,84.26,0,0,1,84.16,168.33ZM84.16,6a78.16,78.16,0,1,0,78.16,78.16A78.25,78.25,0,0,0,84.16,6Z" /><rect class="cls-1" x="80.95" y="30.41" width="6" height="92.33" /><polygon class="cls-1" points="83.95 128.87 50.9 95.83 55.14 91.58 83.95 120.39 112.75 91.58 116.99 95.83 83.95 128.87" /></g></g></svg>)

      case 'uploading':
        return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168.33 168.33"><defs></defs><title>uploading</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M84.16,0A84.16,84.16,0,1,1,0,84.16,84.26,84.26,0,0,1,84.16,0Zm0,162.33A78.16,78.16,0,1,0,6,84.16,78.25,78.25,0,0,0,84.16,162.33Z" /><rect class="cls-1" x="81.38" y="45.6" width="6" height="92.33" /><polygon class="cls-1" points="113.19 76.74 84.38 47.94 55.58 76.74 51.34 72.5 84.38 39.45 117.43 72.5 113.19 76.74" /></g></g></svg>)

      default:
        return ''
    }
  }

  render() {
    return (
      <div class="ins-loader-wrap">
        { this.stateIcon ?
        <div class={`${this.iconColor} ins-loader-wrap--state`}>
          {this.getState()}
        </div> : '' }

        { this.stateTitle ?
        <div class={`ins-loader-wrap--title ${this.stateIcon}`}>
          {this.stateTitle}
        </div> : '' }

        { this.stateMessage ?
        <div class="ins-loader-wrap--message">
          {this.stateMessage}
        </div> : '' }
      </div>
    )
  }
}
