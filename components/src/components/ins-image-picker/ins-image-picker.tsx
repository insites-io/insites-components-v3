import { h, Component, Prop, Element, Event, EventEmitter, Method } from '@stencil/core';
import Cropper from 'cropperjs';

@Component({
  tag: 'ins-image-picker',
  styleUrls: ["../../../node_modules/cropperjs/dist/cropper.min.css"]
})
export class Insimagepicker {
  @Element() insImagePickerEl: HTMLElement;
  @Event() insValueChange: EventEmitter;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;

  @Prop({mutable: true}) imgType: string = 'picture';
  @Prop({mutable: true}) label: string = 'CHANGE PICTURE';
  @Prop({mutable: true}) buttonColor: string = 'blue';
  @Prop({mutable: true}) placeholder: string = 'Drag and drop the file or add an image';
  @Prop({mutable: true}) name: string;
  @Prop({mutable: true}) value: any;
  @Prop({mutable: true}) fileName: any;
  @Prop({mutable: true}) notImageFile: boolean;
  @Prop({mutable: true}) uploadImgContainer: string = "";
  @Prop({mutable: true}) uploadImgRecWidth: number = 120;
  @Prop({mutable: true}) uploadImgRecHeight: number = 120;
  @Prop({mutable: true}) uploadImgRecFileSize: number = 25;
  @Prop({mutable: true}) uploadImgRecFileSizeType: string = "KB";
  @Prop({mutable: true}) uploadImgFileFormats: string = "JPG, JPEG, PNG or SVG.";
  @Prop({mutable: true}) errorMessage: string = "Invalid image file.";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  cropper: Cropper;
  base64: string;
  imagePreviewEl: Element;
  controllersEl: Element;
  imageEl: HTMLImageElement;
  modalEl: Element;
  hiddenInputEl: HTMLInputElement;
  croppedImage;

  @Method()
  async getValue(){
    return this.value;
  }

  @Method()
  async setValue(value: string, file_name: string){
    this.value = value;
    this.fileName = file_name;

    this.insValueChange.emit({
      base64: value,
      filename: file_name
    });
  }

  componentDidLoad () {
    this.initEls();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insImagePickerEl);
    }
  }

  initEls(){
    this.modalEl = this.insImagePickerEl.querySelector('.modal');
    this.hiddenInputEl = this.insImagePickerEl.querySelector('.hidden-input') as HTMLInputElement;
    this.imagePreviewEl = this.insImagePickerEl.querySelector('.image-preview');
    this.controllersEl = this.insImagePickerEl.querySelector('.controllers');
    this.imageEl = this.insImagePickerEl.querySelector('.image') as HTMLImageElement;
  }

  displayImage(evt: any) {
    let tgt = evt.target || window.event.srcElement;
    this.openModal();
    this.processImgFile(tgt.files);
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    let dt = event.dataTransfer;
    this.openModal();
    this.processImgFile(dt.files);
  }

  invalidFile(){
    this.notImageFile = true;
    this.imageEl.src = '';
    if (this.cropper) this.cropper.destroy();
    return;
  }

  validateFormat(type: string){
    return this.uploadImgFileFormats
      .toLocaleLowerCase()
      .includes(type);
  }

  processImgFile(files: FileList) {
    if (!files.length) return;
    if (!files[0].type.includes('image/')) return this.invalidFile();

    let ext = files[0].type.split('/')[1];
    if (ext.includes("svg")) ext = "svg";
    if (!this.validateFormat(ext)) return this.invalidFile();

    this.notImageFile = false;
    this.fileName = files[0].name;

    let component = this;
    if (FileReader && files && files.length) {
      let fr = new FileReader();
      fr.onload = function(){
        if (ext.includes('svg')) {
          component.imagePreviewEl.classList.add('svg-type');
        }
        component.showImage(fr);
      }

      fr.readAsDataURL(files[0]);
    }
  }

  showImage(fr: FileReader){
    let img = fr.result as string;
    this.base64 = img;
    this.imageEl.src = img;
    this.imageEl.style.marginTop = "0px";
    this.imagePreviewEl.classList.add('has-image');
    this.controllersEl.classList.add('has-image');

    setTimeout(() => {
      if (this.imageEl.naturalHeight < 200){
        let marginTop = (200 - this.imageEl.naturalHeight) / 2;
        this.imageEl.style.marginTop = `${marginTop}px`;
      }
    });
  }

  initCropper() {
    this.controllersEl.classList.add('cropping');
    let aspectRatio = this.uploadImgContainer === "rectangle" ? NaN : 1/1;
    if (this.cropper) this.cropper.destroy();
    this.cropper = new Cropper(this.imageEl, { aspectRatio });
  }

  cancelCropping(){
    if (this.cropper) this.cropper.destroy();
    this.controllersEl.classList.remove('cropping');
    this.croppedImage = "";
  }

  exportImage(e: Event) {
    e.preventDefault();
    this.base64 = this.cropper
      ? this.cropper.getCroppedCanvas({}).toDataURL()
      : this.imageEl.src;

    this.value = this.base64;
    this.insValueChange.emit({
      base64: this.base64,
      filename: this.fileName
    });

    this.closeModal(e);
    this.cancelCropping();
  }

  openModal() {
    this.modalEl.classList.add('show');
  }

  closeModal(e: Event) {
    e.preventDefault();
    this.modalEl.classList.remove('show');
    this.imageEl.src = "";
    this.imagePreviewEl.classList.remove('has-image');
    this.controllersEl.classList.remove('has-image');
  }

  addImage() {
    this.hiddenInputEl.click();
  }

  handleDrag(event: Event) {
    event.preventDefault();
  }

  render() {
    return (
      <div class={`image-picker ${this.uploadImgContainer}`}>
        <div class='inline-block img-container'
          onDragOver={this.handleDrag}
          onDrop={this.handleDrop.bind(this)}>

            {this.value
              ? <img src={this.value} alt={this.fileName} class='profile'
                  onClick={this.openModal.bind(this)} />

              : <div class='img-placeholder img-preview-holder'
                  onClick={this.addImage.bind(this)}>
                  <span class="texts_image">{this.placeholder}</span>
                </div>
            }
        </div>

        <div class="inline-block">
          <span class="texts_uploadinfo">
            File Formats: {this.uploadImgFileFormats} <br />
            Recommended Dimensions: {`${this.uploadImgRecWidth}px by ${this.uploadImgRecHeight}px`}<br />
            Recommended File Size: <span class="file-size">{`${this.uploadImgRecFileSize} ${this.uploadImgRecFileSizeType}`}</span>
          </span>

          <ins-button
            label= {this.value ? 'Change ' + this.imgType : 'Upload ' + this.imgType}
            type="button"
            size="small"
            color={this.buttonColor}
            outlined
            onClick={this.addImage.bind(this)}>
          </ins-button>
        </div>

        <div class={`modal ${this.notImageFile ? 'has-error': ''}`}>
          <ins-backdrop>
            <ins-card steady>

              <div class="modal-header">
                <h3>Upload Image</h3>
                <span class="icon-close-1" onClick={this.closeModal.bind(this)}></span>
              </div>

              <div class={`image-preview`}
                onDragOver={this.handleDrag}
                onDrop={this.handleDrop.bind(this)}>

                <p class="placeholder-text">
                  Drag and drop the file or add an image
                </p>

                <img src="" alt="" class="image" />
              </div>

              <div class={`error-wrap`}>
                <span>{ this.errorMessage }</span>
              </div>

              <div class="controllers">
                <ins-button label="CHOOSE A FILE" type="button" outlined
                  onInsClick={this.addImage.bind(this)}>
                </ins-button>

                <ins-button label="CROP IMAGE" type="button" outlined class="crop-btn"
                  onInsClick={this.initCropper.bind(this)}
                  disabled={this.notImageFile}>
                </ins-button>

                <ins-button label="CANCEL CROP" type="button" outlined class="cancel-crop-btn"
                  onInsClick={this.cancelCropping.bind(this)}
                  disabled={this.notImageFile}>
                </ins-button>

                <ins-button label="SAVE" type="button" solid class="save-btn"
                  onInsClick={this.exportImage.bind(this)}
                  disabled={this.notImageFile}>
                </ins-button>

                <input type="file" class="hidden-input"
                  name={this.name}
                  onChange={this.displayImage.bind(this)} />
              </div>

            </ins-card>
          </ins-backdrop>
        </div>
      </div>
    );
  }
}
