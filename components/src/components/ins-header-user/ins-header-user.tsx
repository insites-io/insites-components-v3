import { h, Component, Prop, State, Event, Method, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-header-user' })
export class InsHeaderUser {
  @Event() routePage: EventEmitter;
  @Prop({ mutable: true }) name: string = 'User';
  @Prop({ mutable: true }) logoutLabel: string = 'Logout';
  @Prop({ mutable: true }) profileLabel: string = 'My Profile';
  @Prop({ mutable: true }) logoutLink: string = '';
  @Prop({ mutable: true }) profileLink: string = '#/my-profile';
  @Prop({ mutable: true }) app: boolean;
  @Prop({ mutable: true }) formattedRoute: string;
  @State() dropDownState: boolean;

  insRendererEl: HTMLInsRendererElement;

  toggleDropDown(){
    this.dropDownState = !this.dropDownState;
  }

  @Method()
  async renderMyProfile(){

    let newRoute = {
      link: this.profileLink,
      app: this.app,
      label: 'My Profile',
      withSubmenu: false
    }
    let currentCrumbs = JSON.parse(window.localStorage.getItem('ins_breadcrumbs'));
    let insRendererEl = parent.document.querySelector('ins-renderer') as HTMLInsRendererElement;

    if (currentCrumbs[currentCrumbs.length - 1].label !== 'My Profile'){
      currentCrumbs.push(newRoute);
      insRendererEl.updateRoute(currentCrumbs, true, true);
    }
  }

  @Method()
  async routePageHandler(){
    this.deactivateRoutes();
    this.toggleDropDown();
    await this.routeMyProfile();
  }

  routePageHandlerMobile() {
    this.routePageHandler();
    let insHeaderEl = document.querySelector('ins-header');
    insHeaderEl.toggleNav();
  }

  deactivateRoutes(){
    let allSidebarItems = document.querySelectorAll('ins-sidebar-item');
    for (let i = 0; i < allSidebarItems.length; i++){
      allSidebarItems[i].deactivate();
    }
  }

  formatRoute() {
    this.formattedRoute = this.profileLink;

    if (this.app){
      this.formattedRoute = '#/app/my-profile';
    }
  }

  componentWillLoad(){
    this.formatRoute();
    this.insRendererEl = document.querySelector('ins-renderer');
  }

  async routeMyProfile(){
    await this.insRendererEl.updateRoute([{
      link: this.profileLink,
      app: this.app,
      label: 'My Profile',
      withSubmenu: false
    }], false, this.app);
  }

  render() {
    return (
      <div class={this.dropDownState ? 'ins-header-user-wrap active' : 'ins-header-user-wrap'}>
        <div class="ins-header-desktop-view">
          <button class="btn-nav ins-huw-toggle">{/* onClick={() => this.toggleDropDown()} */}
            {this.name}
            <i class="toggle-icon icon-keyboard-arrow-up"></i>
            <i class="toggle-icon icon-keyboard-arrow-down"></i>
            {/* {this.dropDownState ?
              <i class="toggle-icon icon-keyboard-arrow-up"></i> :
              <i class="toggle-icon icon-keyboard-arrow-down"></i>} */}
          </button>

          {/* {this.dropDownState ? */}
          <div class="ins-header-user-options">

            <ins-card steady>
              <ul>
                <li>
                  <a id="myProfile" href={this.formattedRoute}
                    onClick={() => this.routePageHandler()}>
                    <i class="icon-person"></i> {this.profileLabel}
                  </a>
                </li>

                <slot />

                <li>
                  <a href={this.logoutLink} onClick={() => this.toggleDropDown()}>
                    <i class="icon-exit-to-app"></i> {this.logoutLabel}
                    </a>
                </li>
              </ul>
            </ins-card>
          </div>
        </div>

        <div class="ins-header-mobile-view">
          <div class="ins-header-mobile-view__user">
            <i class="icon-user-1"></i>
            <a id="myProfile" href={this.formattedRoute}
              onClick={() => this.routePageHandlerMobile()}>{this.name}</a>
          </div>

          <div class="ins-header-mobile-view__options">
            <slot />
          </div>

          <div class="ins-header-mobile-view__logout">
            <i class="icon-logout-1"></i>
            <a href={this.logoutLink}>{this.logoutLabel}</a>
          </div>
        </div>
      </div>
    )
  }
}
