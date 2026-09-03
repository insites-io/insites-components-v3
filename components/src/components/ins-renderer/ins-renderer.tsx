import { h, Component, Prop, Method, Element, Event, EventEmitter, State } from "@stencil/core";

@Component({ tag: 'ins-renderer' })
export class InsRenderer {
  @Element() insRendererEl: HTMLElement;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;

  @State() insBreadCrumbsEl: any; // unused, kept this pass: removing a @State member changes the compiled component manifest — schedule with a reviewed release

  @Prop({ mutable: true }) link: string;
  @Prop({ mutable: true }) disableBreadcrumbs: boolean = false;
  @Prop({ mutable: true }) app: boolean = false;
  @Prop({ mutable: true }) label: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  route: { label: string; link: string; app?: boolean } = {
    label: "", link: ""
  };

  rerouting: boolean = false;
  breadcrumbs: Array<{ label: string; link: string; app?: boolean; withSubmenu?: boolean; formattedRoute?: string }> = [];
  insRendererFrameEl: HTMLIFrameElement;

  titleWrapEl: HTMLElement;
  titleEl: HTMLElement;
  breadcrumbsEl: HTMLElement;
  wrapEl: HTMLElement;

  @Method()
  async updateRoute(newRoutes: any[], noRedirect = false, iframe: boolean) {
    if (newRoutes && newRoutes.length) {
      let last = newRoutes.length - 1;
      this.route = newRoutes[last];
      this.updateBreadcrumbs(newRoutes, noRedirect);
      this.updateElements();

      if (this.route.app) {
        if (!noRedirect || iframe) {
          this.insRendererFrameEl.contentWindow.location.replace(this.route.link);
        }
      }
    }
  }

  updateElements(){
    if (this.route.app) this.wrapEl.classList.add('app')
    else this.wrapEl.classList.remove('app');

    if (!this.disableBreadcrumbs || (this.disableBreadcrumbs && this.route.app)) {
      this.titleWrapEl.style.display = 'block';
      this.titleEl.innerHTML = this.route.label;
    } else if(this.disableBreadcrumbs){
      this.titleWrapEl.style.display = 'none';
    }

    if (this.breadcrumbs.length > 1 && !this.disableBreadcrumbs) {
      let divEl = document.createElement('div');
      divEl.className = "ins-breadcrumbs"

      let ulEl = document.createElement('ul');

      for (let i = 0; i < this.breadcrumbs.length; i++){
        let spanEl = document.createElement('span');
        spanEl.className = `crumb-label ${this.breadcrumbs[i].withSubmenu ? '': 'has-link'}`;
        spanEl.textContent = this.breadcrumbs[i].label;
        spanEl.addEventListener('click', () => this.routePageHandler(this.breadcrumbs[i], i));

        let arrowEl = document.createElement('span');
        arrowEl.className = "arrow-right"

        let liEl = document.createElement('li');
        liEl.appendChild(spanEl);
        liEl.appendChild(arrowEl);

        ulEl.appendChild(liEl);
      }

      divEl.appendChild(ulEl);

      this.breadcrumbsEl.innerHTML = "";
      this.breadcrumbsEl.appendChild(divEl);
    }
  }

  formatUrl(e: string){
    return e.toLowerCase()
        .replace(/ +(?= )/g, '')
        .replace(/- | - | -| /gi, '-')
        .replace(/-+(?=)/g, '-');
  }

  componentWillLoad() {
    if (this.link) {
      this.route = {
        label: this.label ? this.label : 'Default Page',
        app: this.app,
        link: this.link
      }
    }
  }

  @Method()
  async resizeIframe() {
    this.insRendererFrameEl.style.height = this.insRendererFrameEl.contentWindow.document.body.scrollHeight + 'px';
    this.insRendererFrameEl.style.opacity = '1';
  }

  @Method()
  async updateRouteLabel(value: string) {
    this.route.label = value;
  }

  componentDidLoad() {
    this.getElements();
    this.bindIframeListener();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insRendererEl);
    }
  }

  getElements(){
    this.wrapEl = this.insRendererEl.querySelector('.ins-renderer-wrap') as HTMLElement;
    this.titleWrapEl = this.insRendererEl.querySelector('.ins-renderer-wrap__title') as HTMLElement;
    this.titleEl = this.insRendererEl.querySelector('.ins-renderer-wrap__title-span') as HTMLElement;
    this.breadcrumbsEl = this.insRendererEl.querySelector('.ins-breadcrumbs-wrap') as HTMLElement;
  }

  bindIframeListener() {
    this.insRendererFrameEl = this.insRendererEl.querySelector('#insRendererFrame') as HTMLIFrameElement;
    if (this.insRendererFrameEl) {
      this.iframeURLChange(this.insRendererFrameEl, e => {
        // if (this.route.app){
        if (navigator.appName == 'Microsoft Internet Explorer') {
          window.frames.document.execCommand('Stop');
        } else {
          window.frames.stop();
        }

        if (e.includes("?reroute=")) {
          this.rerouting = true;
          let queryStrings = e.split("?")[1].split("&");
          queryStrings.forEach(item => {
            if (item.includes("reroute=")) {
              let route = item.substring(8, item.length);
              this.insRendererFrameEl.contentWindow.location.replace(route);
            } else if (item.includes("reroutelabel=")) {
              let reroutelabel = decodeURIComponent(item.substring(13, item.length))
              if (reroutelabel) {
                let header = this.insRendererEl.querySelector('.ins-renderer-wrap__title-span');
                header.innerHTML = reroutelabel;
              }
            }
          });

        } else if (!this.rerouting) {
          this.insRendererFrameEl.contentWindow.location.replace(e);
        } else this.rerouting = false;
        // }
      });
    }
  }

  iframeURLChange(iframe: HTMLIFrameElement, callback: (href: string) => void) {
    let lastDispatched: string | null = null;

    let dispatchChange = function () {
      let newHref = iframe.contentWindow.location.href;

      if (newHref !== lastDispatched) {
        callback(newHref);
        lastDispatched = newHref;
      }
    };

    let unloadHandler = function () {
      setTimeout(dispatchChange, 0);
    };

    function attachUnload() {
      iframe.contentWindow.removeEventListener("unload", unloadHandler);
      iframe.contentWindow.addEventListener("unload", unloadHandler);
    }

    iframe.addEventListener("load", function () {
      attachUnload();
      dispatchChange();
    });

    attachUnload();
  }

  updateBreadcrumbs(newRoutes: any[], noRedirect: boolean){
    if(!this.disableBreadcrumbs){
      this.breadcrumbs = newRoutes;
      let parsedCrumbs = JSON.stringify(newRoutes);
      window.localStorage.setItem('ins_breadcrumbs', parsedCrumbs);

      let lastCrumb = JSON.parse(parsedCrumbs).pop();
      if (!lastCrumb.app && !lastCrumb.withSubmenu){
        if (!noRedirect) {
          document.location.hash = lastCrumb.link;
        }
      }
    }
  }

  routePageHandler(crumb: any, index: number){
    let count = this.breadcrumbs.length;
    let lastCrumb = (count - 1) === index;
    if (!crumb.withSubmenu && !lastCrumb){
      this.breadcrumbs.splice((index + 1), count);
      let newRef = JSON.parse(JSON.stringify(this.breadcrumbs));
      this.updateRoute(newRef, false, false);
    }
  }

  renderBreadcrumbs() {
    if (this.breadcrumbs.length > 1) {
      return (
        <div class="ins-breadcrumbs">
          <ul>
            {this.breadcrumbs.map((crumb, index) => {
              return (
                <li>
                  <span class={`crumb-label ${crumb.withSubmenu ? '': 'has-link'}`}
                    onClick={() => this.routePageHandler(crumb, index)}>
                    {crumb.label}
                  </span>
                  <span class="arrow-right"></span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return "";
  }

  render() {
    return (
      <div class={`ins-renderer-wrap content ${this.route.app ? "app" : ""}`}>

        <h1 class="ins-renderer-wrap__title">
          <span class="ins-renderer-wrap__title-span">
            {this.route.label ? this.route.label : ""}
          </span>
        </h1>

        <div class="ins-breadcrumbs-wrap">
          {this.renderBreadcrumbs()}
        </div>

        <div class="ins-renderer__iframe-wrap">
          <iframe id="insRendererFrame"
            width="100%"
            frameborder="0"
            marginheight="0"
            marginwidth="0">
          </iframe>
        </div>

        <div class="ins-renderer__slot-wrap">
          <slot />
        </div>
      </div>
    )
  }
}
