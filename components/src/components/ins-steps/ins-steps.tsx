import { h, Component, Element, Method, Prop, Listen, Event, EventEmitter } from "@stencil/core";

@Component({ tag: 'ins-steps' })
export class InsSteps {
  @Element() el: HTMLElement;
  @Event() insClick: EventEmitter<{ start?: boolean; end?: boolean; nextStep?: any; previousStep?: any; currentStep: any }>;
  @Prop({ mutable: true }) indicator: string = "";
  @Prop({ mutable: true }) inline: boolean = false;
  @Prop({ mutable: true }) clickable: boolean = false;
  @Prop({ mutable: true }) withValidation: boolean = false;
  @Prop({ mutable: true }) complete: boolean = false;

  steps: NodeListOf<any>;

  @Listen('insStepClick')
  insStepClicked(e: CustomEvent){
    if (!this.clickable) return false;

    let nextStep = e.target;
    for (let i = 0; i < this.steps.length; i++){
      if (!this.withValidation) this.steps[i].active = false;
      if (this.steps[i] === nextStep){

        if (this.withValidation){

          this.insClick.emit({
            nextStep, currentStep: this.findActiveStep()
          });

        } else this.emitEvent(nextStep, i);
      }
    }
  }

  findActiveStep(){
    for (let i = 0; i < this.steps.length; i++){
      if (this.steps[i].active) return this.steps[i];
    }
  }

  findActiveStepIndex(){
    for (let i = 0; i < this.steps.length; i++){
      if (this.steps[i].active) return i;
    }
  }

  emitEvent(currentStep, i){
    let previousStep = this.findActiveStep();
    this.steps[i].active = true;
    this.insClick.emit({
      start: i === 0,
      end: i === (this.steps.length - 1),
      previousStep, currentStep
    });
  }

  setIndicators(){
    if (this.indicator && this.indicator === "number"){
      for (let i = 0; i < this.steps.length; i++){
        if (!this.steps[i].icon)
          this.steps[i].indicator = i + 1;
      }
    }
  }

  @Method()
  async setComplete() {
    for (let i = 0; i < this.steps.length; i++) {
      this.steps[i].active = false;
      this.steps[i].hasError = false;
      this.steps[i].complete = true;
    }
    return true;
  }

  setDefault(){
    let hasActive = false;
    for (let i = 0; i < this.steps.length; i++){
      if (this.steps[i].active){
        hasActive = true;
        break;
      }
    }

    if (!hasActive) this.steps[0].active = true;
  }

  componentDidLoad(){
    this.steps = this.el.querySelectorAll('ins-step');
    this.setIndicators();
    if (this.complete)
      this.setComplete();
    else
      this.setDefault();
  }

  @Method()
  async setStep(i: number){
    for (let l = 0; l < this.steps.length; l++){
      this.steps[l].active = false;
    }

    let previousStep = this.findActiveStep();
    let next = i - 1;
    this.steps[next].active = true;

    return { previousStep, currentStep: this.steps[next] }
  }

  @Method()
  async finish(){
    for (let l = 0; l < this.steps.length; l++){
      this.steps[l].complete = true;
      this.steps[l].active = false;
    }
    return true;
  }

  @Method()
  async next(){
    let current = this.findActiveStepIndex();
    let sum = current + 1;
    let end = (sum + 1) === this.steps.length;
    let previousStep = this.steps[current];
    previousStep.complete = true;
    previousStep.active = false;

    if (sum >= this.steps.length) {
      return {
        end,
        previousStep: this.steps[current - 1],
        currentStep: previousStep,
      }
    }

    this.steps[sum].active = true;

    return {
      end, previousStep, currentStep: this.steps[sum]
    }
  }

  @Method()
  async prev(){
    let current = this.findActiveStepIndex();
    let diff = current - 1;
    if (diff < 0) return {
      start: true,
      previousStep: this.steps[current + 1],
      currentStep: this.steps[current]
    };

    let previousStep = this.steps[current];
    previousStep.active = false;

    this.steps[diff].active = true;

    return {
      start: diff === 0,
      previousStep,
      currentStep: this.steps[diff]
    }
  }

  @Method()
  async getAllSteps(){
    return this.steps;
  }

  @Method()
  async reset(){
    let total = this.steps.length;
    for (let i = 0; i < total; i ++){
      this.steps[i].complete = false;
      this.steps[i].active = false;
      this.steps[i].hasError = false;
    }
    this.steps[0].active = true;
    return true;
  }

  render() {
    return (
      <div class={`ins-steps
        ${this.inline ? "ins-steps_inline" : ""}`}>
        <slot />
      </div>
    );
  }
}
