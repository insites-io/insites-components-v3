import { h, Component, Prop, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: 'ins-kanban-board',
  styleUrl: "./ins-kanban-board.sass"
})

export class InsKanbanBoard {
  @Event() didLoad: EventEmitter;
  @Prop({ mutable: true }) uniqueId: string;
  @Prop({ mutable: true }) boardGroup: string;
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  componentWillLoad() {
    this.uniqueId = (Math.random() + 1).toString(36).substring(7);
  }

  componentDidLoad(){
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
  }

  render() {
    return (
      <div class={`ins-kanban-board-wrap`} id={this.uniqueId}>
        <slot />
      </div>
    );
  }
}
