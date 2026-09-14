import { h, Component, Prop, State, Element, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-heading' })
export class InsHeading {
  @Element() insHeadingEl: HTMLElement;
  @Event() insChange: EventEmitter<{ name: string; old_label: string; new_label: string }>;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable: true}) change: string = "";
  @Prop({mutable: true}) label: string = "";
  @Prop({mutable: true}) name: string = "";
  @Prop({mutable: true}) backgroundColor: string = '#fff';
  @Prop({mutable: true}) level: number = 6;
  @Prop({mutable: true}) editable: boolean = false;
  @Prop({mutable: true}) withoutLine: boolean = false;
  @Prop({mutable: true}) maxlength: string = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  @State() editMode: boolean = false;
  @State() tempLabel: string = '';

  checkLevel(){
    switch (this.level) {
      case 1: return (<h1>{this.label}</h1>)
      case 2: return (<h2>{this.label}</h2>)
      case 3: return (<h3>{this.label}</h3>)
      case 4: return (<h4>{this.label}</h4>)
      case 5: return (<h5>{this.label}</h5>)
      case 6: return (<h6>{this.label}</h6>)
    }
  }

  enterEditMode(){
    this.tempLabel = this.label;
    this.editMode = true;
  }

  leaveEditMode(){
    this.editMode = false;
  }

  updateTempLabel(e: CustomEvent){
    this.tempLabel = e.detail;
  }

  saveChanges(){
    if (this.tempLabel.trim()){
      this.insChange.emit({
        name: this.name,
        old_label: this.label,
        new_label: this.tempLabel
      });

      this.label = this.tempLabel;
      this.editMode = false;

    } else this.leaveEditMode();
  }

  componentDidLoad(){
    if (this.label) {
      let labelWrapEl = this.insHeadingEl.querySelector('.label-wrap') as HTMLElement;
      labelWrapEl.style.backgroundColor = this.backgroundColor;

      if (this.editable){
        let inputWrapEl = this.insHeadingEl.querySelector('.input-wrap') as HTMLElement;
        inputWrapEl.style.backgroundColor = this.backgroundColor;
      }
    }
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insHeadingEl);
    }
  }

  render() {
    return (
      <div class={`ins-heading-wrap
        ${this.withoutLine ? 'without-line':''}
        ${this.editMode ? 'editing':''} `}>

      {this.label ?
        <div class="label-wrap">
          {this.checkLevel()}

          {this.editable ?
            <button class="icon-edit"
              onClick={() => this.enterEditMode()}>
            </button>
          : ''}
        </div>
      : ''}

        {this.editable ?
          <div class="input-wrap">
            <ins-input maxlength={this.maxlength} value={this.tempLabel}
              onInsValueChange={(e) => this.updateTempLabel(e)}>
            </ins-input>

            <div class="input-wrap-buttons">
              <ins-button label="CANCEL" size="small"
                onInsClick={() => this.leaveEditMode()}>
              </ins-button>

              <ins-button label="SAVE" size="small"
                onInsClick={() => this.saveChanges()}>
              </ins-button>
            </div>
          </div>
        : ''}
      </div>
    );
  }
}
