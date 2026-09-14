import { h, Component, Element, Prop, Event, EventEmitter } from '@stencil/core';
@Component({ tag: "ins-timeline" })

export class InsTimeline {
  @Element() insTimeline: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({ mutable: true }) loadingScreen: boolean = false;
  @Prop({ mutable: true}) label: string;
  @Prop({ mutable: true }) staticTimeline: boolean = false;
  @Prop({ mutable: true }) timelineData: any = [] // sample [{ color: "red", icon: "icon-star", content: "<h1>Hello World</h1> <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>", actions: '<ins-button solid size="small" label="Save"></ins-button>', datetime: "New" }, { content: "test", solid: true }, { color: "blue", solid: true, content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore." }];

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insTimeline);
    }
  }

  buildTimelineItem(item: any) {
    return (
      <ins-timeline-item
        title={item.title}
        datetime ={item.datetime}
        color={item.color}
        solid={item.solid}
        icon={item.icon}
        inline={item.inline}>
        {item.content ? <div slot="content" innerHTML = {item.content}></div> : ''}
        {item.actions ? <div slot="actions" innerHTML = {item.actions}></div> : ''}
      </ins-timeline-item>
    )
  }

  render(){
    return(
      <div class="ins-timeline-wrap">
        <div class="ins-timeline-main">
          {this.label ?
            <div class="ins-timeline-header">
              <h3>{this.label}</h3>
            </div> : ''}
          <div class={`ins-timeline-list ${this.loadingScreen ? 'loading' : ''}`}>
              {
              this.staticTimeline ? <slot />
              : this.timelineData.map(item => {
                  return (this.buildTimelineItem(item));
              })}
          </div>
        </div>

      </div>
    )
  }
}
