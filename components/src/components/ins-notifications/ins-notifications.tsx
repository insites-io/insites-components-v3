import { h, Component, State, Method } from "@stencil/core";

@Component({ tag: 'ins-notifications' })
export class InsNotifications {
  @State() showNotifications: boolean;
  @State() insNotificationsitemsEl: NodeListOf<Element>;

  @Method()
  async toggleNotificationshandler(){
    this.showNotifications = !this.showNotifications;
    this.insNotificationsitemsEl.forEach( function (item: Element, i: number) {
      setTimeout(function () {
        item.querySelector('.ins-notifications-item-wrap').className += " show";
      }, 100 * i);
    })
  }

  componentWillLoad() {
    this.insNotificationsitemsEl = document.querySelectorAll('ins-notifications-item')
  }

  render() {

    if (this.showNotifications) {
      return (
        <div>
          <ins-backdrop></ins-backdrop>
          <div class="ins-notifications-wrap">
            <div class="ins-nw-header">
              <h1>Notifications</h1>
              <button class="ins-nwh-close" onClick={() => this.toggleNotificationshandler()}>
                <i class="icon-close-1"></i>
              </button>
            </div>
            <div class="ins-nw-items-wrap">
              <div><slot /></div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div class="hide-slot">
          <ins-backdrop></ins-backdrop>
          <div class="ins-notifications-wrap">
            <div class="ins-nw-header">
              <h1>Notifications</h1>
              <button class="ins-nwh-close" onClick={() => this.toggleNotificationshandler()}>
                <i class="icon-close-1"></i>
              </button>
            </div>
            <div class="ins-nw-items-wrap">
              <div><slot /></div>
            </div>
          </div>
        </div>
      )
    }
  }
}
