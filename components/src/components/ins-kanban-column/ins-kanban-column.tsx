import { h, Component, Element, Prop, Event, EventEmitter, Method } from "@stencil/core";
import Sortable from 'sortablejs';

@Component({ tag: 'ins-kanban-column' })
export class InsKanbanColumn {
  private kanbanItemsWrap: HTMLDivElement
  @Element() insKanbanColumnEl: HTMLElement;
  @Event() insColumnAdd: EventEmitter;
  @Prop() sortableItems: [];
  @Prop({ mutable: true }) heading: string = "Heading";
  @Prop({ mutable: true }) headingColor: string = '#fff';
  @Prop({ mutable: true }) headingTextColor: string = '';
  @Prop({ mutable: true }) totalCount: string = '';
  @Prop({ mutable: true }) headingSubDetail: string = '';
  @Prop({ mutable: true }) noItems: boolean = false;
  @Prop({ mutable: true }) noItemsHeading: string = 'No Items';
  @Prop({ mutable: true }) noItemsDetail: string = '';
  @Prop({ mutable: true }) addItemButton: boolean = false;
  @Prop({ mutable: true }) addItemButtonLabel: string = 'Add Item';
  @Prop({ mutable: true }) disableSort: boolean = false;
  @Prop({ mutable: true }) disableDrop: boolean = false;

  insitesKanbanColumnSortable;

  @Event() insDragStart: EventEmitter<Object>;
  onDraggingStart(event: any) {
    this.insDragStart.emit({
      item: event.item, // dragged HTMLElement
      from: event.from, // previous list
      oldIndex: event.oldIndex,  // element's old index within old parent
      oldDraggableIndex: event.oldDraggableIndex, // element's old index within old parent, only counting draggable elements
    });
    event.item.classList.add('moving');
  }

  @Event() insDragEnd: EventEmitter<Object>;
  onDraggingEnd(event: any) {
    this.insDragEnd.emit({
      item: event.item, // dragged HTMLElement
      to: event.to, // target list
      from: event.from, // previous list
      oldIndex: event.oldIndex,  // element's old index within old parent
      newIndex: event.newIndex,  // element's new index within new parent
      oldDraggableIndex: event.oldDraggableIndex, // element's old index within old parent, only counting draggable elements
      newDraggableIndex: event.newDraggableIndex, // element's new index within new parent, only counting draggable elements
    });
    event.item.classList.remove('moving');
  }

  @Event() insAdd: EventEmitter<Object>;
  onAdding(event: any) {
    this.insAdd.emit({
      item: event.item, // dragged HTMLElement
      to: event.to, // target list
      from: event.from, // previous list
      oldIndex: event.oldIndex,  // element's old index within old parent
      newIndex: event.newIndex,  // element's new index within new parent
      oldDraggableIndex: event.oldDraggableIndex, // element's old index within old parent, only counting draggable elements
      newDraggableIndex: event.newDraggableIndex, // element's new index within new parent, only counting draggable elements
    });
  }

  @Event() insSort: EventEmitter<Object>;
  onSorting(event: any) {
    this.insSort.emit({
      item: event.item, // dragged HTMLElement
      to: event.to, // target list
      from: event.from, // previous list
      oldIndex: event.oldIndex,  // element's old index within old parent
      newIndex: event.newIndex,  // element's new index within new parent
      oldDraggableIndex: event.oldDraggableIndex, // element's old index within old parent, only counting draggable elements
      newDraggableIndex: event.newDraggableIndex, // element's new index within new parent, only counting draggable elements
    });
  }

  @Event() insChoose: EventEmitter<Object>;
  onChooseElement(event: any) {
    this.insChoose.emit({
      item: event.item, // dragged HTMLElement
      from: event.from, // previous list
      oldIndex: event.oldIndex,  // element's old index within old parent
    });
  }

  @Event() insUpdate: EventEmitter<Object>;
  onUpdating(event: any) {
    this.insUpdate.emit({
      item: event.item, // dragged HTMLElement
      to: event.to, // target list
      from: event.from, // previous list
      oldIndex: event.oldIndex,  // element's old index within old parent
      newIndex: event.newIndex,  // element's new index within new parent
      oldDraggableIndex: event.oldDraggableIndex, // element's old index within old parent, only counting draggable elements
      newDraggableIndex: event.newDraggableIndex, // element's new index within new parent, only counting draggable elements
    });
  }

  @Event() insMove: EventEmitter<Object>;
  onMoving(event: any, /*originalEvent*/) {
    this.insMove.emit({
      item: event.dragged, // dragged HTMLElement
      to: event.to, // target list
      from: event.from, // previous list
      relatedItem: event.related,  // HTMLElement on which have guided
      insertedAfter: event.willInsertAfter,  // HTMLElement on which have guided
    });
  }

  @Event() insRemove: EventEmitter<Object>;
  onRemoving(event: any) {
    this.insRemove.emit({
      item: event.item, // dragged HTMLElement
      to: event.to, // target list
      from: event.from, // previous list
      oldIndex: event.oldIndex,  // element's old index within old parent
      newIndex: event.newIndex,  // element's new index within new parent
      oldDraggableIndex: event.oldDraggableIndex, // element's old index within old parent, only counting draggable elements
      newDraggableIndex: event.newDraggableIndex, // element's new index within new parent, only counting draggable elements
    });
  }

  @Event() insPositionChanged: EventEmitter<Object>;
  onPositionChanging(event: any) {
    this.insPositionChanged.emit({
      item: event.item, // dragged HTMLElement
      to: event.to, // target list
      from: event.from, // previous list
      oldIndex: event.oldIndex,  // element's old index within old parent
      newIndex: event.newIndex,  // element's new index within new parent
      oldDraggableIndex: event.oldDraggableIndex, // element's old index within old parent, only counting draggable elements
      newDraggableIndex: event.newDraggableIndex, // element's new index within new parent, only counting draggable elements
    });
  }
  
  componentDidLoad(){
    this.initSortable();
  }

  insKanbanColumnAddButtonClickHandler(){
    this.insColumnAdd.emit({
      heading: this.heading,
      el: this.insKanbanColumnEl
    });
  }

  @Event() insDrop: EventEmitter<Object>;
  private initSortable() {
    const boardGroup = this.kanbanItemsWrap.closest("ins-kanban-board").hasAttribute("board-group") ? this.kanbanItemsWrap.closest("ins-kanban-board").getAttribute("board-group") : "";
    const wrapperID = this.kanbanItemsWrap.closest(".ins-kanban-board-wrap").id;

    let
      el: HTMLDivElement = this.kanbanItemsWrap,
      id: string = `ins-kanban-cards-wrap-${Math.random().toString(36).slice(2)}`,
      _this = this,
      config: any = {
        /**
         * Sortable Options
         */
        animation: 100,
        group: boardGroup ? boardGroup : wrapperID,
        sort: !this.disableSort,
        easing: "cubic-bezier(1, 0, 0, 1)",
        disabled: false,
        forceFallback: true,
        dataIdAttr: "card-sortable-id",
        draggable: "ins-kanban-card",
        store: {
          /**
           * Get the order of elements. Called once during initialization.
           * @param   {Sortable}  sortable
           * @returns {Array}
           */
          get: (e: any[] = []) => _this.load(e),

          /**
           * Save the order of elements. Called onEnd (when the item is dropped).
           * @param {Sortable}  sortable
           * @returns {Object}
           */
          set: (e) => {
            let order = e ? e.toArray() : [];

            _this.insDrop.emit({ e, order })
            return order
          }
        },
        /**
         * Sortable Events Declaration
         */
        onStart: this.onDraggingStart.bind(this),
        onEnd: this.onDraggingEnd.bind(this),
        onAdd: this.onAdding.bind(this),
        onSort: this.onSorting.bind(this),
        onChoose: this.onChooseElement.bind(this),
        onUpdate: this.onUpdating.bind(this),
        onMove: this.onMoving.bind(this),
        onRemove: this.onRemoving.bind(this),
        onChange: this.onPositionChanging.bind(this)
      }

    el.id = id;
    this.insitesKanbanColumnSortable = new Sortable(el, config);
  }

  load(sortable: string | any[] = []) {
    let order = []
    if (typeof sortable === 'string' || sortable instanceof String)
      order = sortable ? sortable.split('|') : []
    else if (sortable && typeof sortable === 'object' && sortable.constructor === Array)
      order = sortable

    let instance = Sortable.get(this.kanbanItemsWrap)
    instance.sort(order)
    return order
  }

  @Method()
  async getColumnCardsOrder(){
    let instance = Sortable.get(this.kanbanItemsWrap),
        order = instance.toArray(),
        result: Record<number, string> = {}
    order.forEach((value: string, key: number) => {
      result[key] = value
    });

    return result
  }

  @Method()
  async reorderCards(sortable: string | any[]){
    this.load(sortable);
  }

  render() {
    return (
      <div class={`ins-kanban-column-wrap`}>
        <div class={`ins-kanban-column-header ${!this.heading ? 'no-heading':''}`} style={{ 'background-color': this.headingColor, 'color': this.headingTextColor }}>
          <span class="heading">
            {this.heading}
          </span>
          <div class={`header-details ${this.totalCount != '' || this.headingSubDetail != '' ? '':'hide'}`}>
            {this.totalCount != '' ?
              <span class="total-column-count">
                ({this.totalCount})
              </span>
              : ''
            }
            {this.headingSubDetail != '' ?
              <span class="heading-sub-detail">
                {this.headingSubDetail}
              </span>
              : ''
            }
          </div>
        </div>
        <div class="ins-kanban-cards-wrap" ref={(el) => this.kanbanItemsWrap = el as HTMLDivElement} >
          {this.noItems ?
            <div class="card-item-wrap no-items-wrap">
              <span class="no-items-heading">
                {this.noItemsHeading}
              </span>
              {this.noItemsDetail != '' ?
                <span class="no-items-details">
                  {this.noItemsDetail}
                </span>
                : ''
              }
            </div>
            : <slot />
          }
        </div>
        {this.addItemButton ?
          <div class="ins-kanban-column-button"
            onClick={() => this.insKanbanColumnAddButtonClickHandler()}>
            <i class="icon-plus"></i>
            <span>
              {this.addItemButtonLabel}
            </span>
          </div>
          : ''
        }
      </div>
    );
  }
}
