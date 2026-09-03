import { h, Component, Prop, Method, Event, EventEmitter, Element } from '@stencil/core';

interface Breadcrumb {
  label: string;
  link?: string;
  withSubmenu?: boolean;
  app?: boolean;
  [key: string]: any;
}

@Component({ tag: 'ins-breadcrumbs' })
export class InsBreadCrumbs {
  @Element() insBreadCrumbsEl: HTMLElement;
  @Prop({ mutable: true }) breadcrumbs: Array<any> = [];
  @Event() routePage: EventEmitter<{ crumbs: any[]; redirect: boolean }>;
  @Event() didLoad: EventEmitter<void>;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insBreadCrumbsEl);
    }
  }

  routePageHandler(crumb: Breadcrumb, index: number){
    let count = this.breadcrumbs.length;
    let lastCrumb = (count - 1) === index;
    if (!crumb.withSubmenu && !lastCrumb){
      this.breadcrumbs.splice((index + 1), count);
      let newRef = JSON.parse(JSON.stringify(this.breadcrumbs));
      this.routePage.emit({
        crumbs: newRef,
        redirect: true
      });
    }
  }

  @Method()
  async updateCrumbs(crumbs: any[], noRedirect: boolean = false){ // typed any[] deliberately: a local interface in a public @Method signature leaks into the generated components.d.ts
    this.breadcrumbs = crumbs;
    let parsedCrumbs = JSON.stringify(crumbs);
    window.localStorage.setItem('ins_breadcrumbs', parsedCrumbs);

    let lastCrumb = JSON.parse(parsedCrumbs).pop();
    if (!lastCrumb.app && !lastCrumb.withSubmenu){
      if (!noRedirect) {
        document.location.hash = lastCrumb.link;
      }
    }
  }

  render() {
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
  }
}
