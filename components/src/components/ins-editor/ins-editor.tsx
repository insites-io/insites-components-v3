import { h, Element, Component, Prop, State, Method, Event, EventEmitter } from "@stencil/core";
import CodeMirror from "codemirror";
import "../../assets/redactor.min.js";

declare const $R: any;

// addons
import "codemirror/addon/search/search";
import "codemirror/addon/display/fullscreen";

// modes
import "codemirror/mode/css/css";
import "codemirror/mode/htmlembedded/htmlembedded";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/python/python";
import "codemirror/mode/vue/vue";
import "codemirror/mode/xml/xml";
import "codemirror/mode/yaml/yaml";

@Component({
  tag: 'ins-editor',
  styleUrl: "./ins-editor.scss"
})

export class InsEditor {
	@Element() insEditorEl: HTMLElement;
  @Event() insBlur: EventEmitter<string>;
  @Event() insInput: EventEmitter<string | null>;
  @Event() insUpload: EventEmitter;
  @Event() insValueChange: EventEmitter<string>;

  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;
  @Prop({ mutable: true }) blankValues: boolean = false;
	@Prop({ mutable: true }) value: string = "";
	@Prop({ mutable: true }) label: string = "";
  @Prop({ mutable: true }) name: string = "";
	@Prop({ mutable: true }) classId: string = "";
	@Prop({ mutable: true }) pluginsList: any = ['alignment', 'table', 'imagemanager', 'fullscreen'];
	@Prop({ mutable: true }) showSource: boolean = false;
	@Prop({ mutable: true }) hasCodeEditor: boolean = false;
	@Prop({ mutable: true }) readonly: boolean = false;
	@Prop({ mutable: true }) theme: string = "";
	@Prop({ mutable: true }) disableLineNumbers: boolean = false;
	@Prop({ mutable: true }) mode: string = "htmlmixed";
	@Prop({ mutable: true }) errorMessage: string = "";
	@Prop({ mutable: true }) hasError: boolean = false;
	@Prop({ mutable: true }) imageUpload: boolean = false;
	@Prop({ mutable: true }) images: string = "";
  @Prop({mutable: true}) tooltip: string = "";

  @Prop({mutable: true}) description: string = "";
  @Prop({mutable: true}) htmlDescription: boolean = false;

	/*@State()*/ editor: any;
	@State() codeEditor: any;
	/*@State()*/ firstLoadRedactor: boolean = false;
	@State() disableVisualEditor: boolean = false;
	@State() activeLabel: boolean = false;
	@State() sourceView: boolean = false;
	/*@State()*/ isSourceView: boolean = false;
	/*@State()*/ stylesId: string = ".redactor-styles";

	@State() hasRedactorDoctypeHTML: number = -1;
	/*@State()*/ redactorHTML: string = "";
	/*@State()*/ redactorHead: string = "";
	/*@State()*/ redactorStyle: { tag: string; attribute: string; original: string; converted: string }[] = [];
	/*@State()*/ redactorBody: string = "";
	/*@State()*/ redactorBodyTag: string = "";

  @Prop({ mutable: true }) checkValue: boolean = false;
  @Method()
  async insReset() {
    if (this.checkValue) {
      this.insEditorEl.dataset.insReset = "true";
      this.insEditorEl.removeAttribute("data-ins-recover");
      this.insInput.emit(null);
    }
  }

  @Method()
  async insRecover() {
    if (this.checkValue) {
      this.insEditorEl.dataset.insRecover = "true";
      this.insEditorEl.removeAttribute("data-ins-reset");
      this.insInput.emit(await this.getValue());
    }
  }

	componentWillLoad() {
		if (!this.classId) {
			this.classId = this.generateClassId(10);
		}
	}

	@Method()
	async val() {
    let sanitized = this.removeEditableAttr(this.getVal());
    if (this.blankValues && (sanitized === `<p><br></p>\n` || sanitized === `<p><br/></p>\n` || sanitized === `<p></p>\n`)) sanitized = '';
    return sanitized;
  }

	@Method()
	async getValue() {
    return await this.val();
  }

	@Method()
	async setValue(value: string) {
    this.value = value;
    if (this.showSource || this.disableVisualEditor) {
      this.codeEditor.setValue(value);
    } else {
      this.insEditorEl.querySelector('.redactor-styles')
        .innerHTML = this.visualEditorRedactor(value);
    }
    this.insValueChange.emit(await this.getValue());
  }

  getVal(){
		if (this.isSourceView) {
			if (this.codeEditor) return this.codeEditor.getValue();

		} else return this.sourceViewRedactor();
  }

	generateClassId(length: number) {
		let result = "";
		let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	}

	componentDidLoad() {
		this.dynamicStyles();
		this.editor = this.initRedactor();

    if (this.classId) {
			this.stylesId = `id-${this.classId}`;
			if (this.insEditorEl.querySelector('.redactor-styles')) this.insEditorEl.querySelector('.redactor-styles').classList.add(this.stylesId);
		}

		if (this.value) {
			if (this.showSource || this.disableVisualEditor) {
				setTimeout(() => {
					for (let item in this.insEditorEl.querySelectorAll('.re-button')) {
						if (typeof this.insEditorEl.querySelectorAll('.re-button')[item] === 'object') {
							this.insEditorEl.querySelectorAll('.re-button')[item].classList.add('redactor-button-disabled');
						}
					}
					this.codeEditor = this.initCodeMirror(this.value);
				}, 400);
				this.isSourceView = true;
			} else {
				this.insEditorEl.querySelector('.redactor-styles').innerHTML = this.visualEditorRedactor(this.value);
			}
		}

		if (this.readonly) {
			this.editor.enableReadOnly();
		}

    if (this.checkLoad) if (this.checkLoad) this.load = true;
	}

	activateLabel() {
		this.activeLabel = true;
	}

	deactivateLabel() {
		this.activeLabel = false;
	}

	initRedactor() {
		if (this.value && this.hasCodeEditor) {
			this.sourceCodeViewOnly(this.value);
      this.showSource = this.disableVisualEditor;
		}

		return $R(`.${this.classId}`, {
			source: this.hasCodeEditor,
			showSource: this.showSource,
			pastePlainText: true,
			imageFigure: false,
			plugins: this.pluginsList,
			focus: false,
			multipleUpload: false,
			callbacks: this.redactorCallbacks(),
			imageUpload: this.setImageUpload(),
			imageManagerJson: this.images
		});
	}

	setImageUpload() {
		if (this.imageUpload) {
			return (data, files, event, upload) => {
				this.insUpload.emit({
					data: data,
					image: files[0],
					event: event,
					upload: upload
				});
			};
		}

		return;
  }

  removeEditableAttr(value: string){
    return this.removeHTMLMarkers(value.replace(/ contenteditable="true"/g, ""));
  }

  redactorInput() {
    this.firstLoadRedactor = false;
    let sanitized = this.removeEditableAttr(this.getVal());
    if (this.blankValues && (sanitized === `<p><br></p>\n` || sanitized === `<p><br/></p>\n` || sanitized === `<p></p>\n`)) sanitized = '';
    this.insInput.emit(sanitized);
    this.insValueChange.emit(sanitized);
  }

	redactorCallbacks() {
		const self = this;

		let callbacks = {
			started: () => {
				self.firstLoadRedactor = true;
			},
			keyup: () => {
        // self.firstLoadRedactor = false;
        // let sanitized = self.removeEditableAttr(self.getVal());
				// self.insInput.emit(sanitized);
				// self.insValueChange.emit(sanitized);
        self.redactorInput();
			},
      // format: () => {
      //   self.redactorInput();
      // },
      // link: {
      //   inserted: () => {
      //     self.redactorInput();
      //   },
      //   deleted: () => {
      //     self.redactorInput();
      //   },
      //   changed: () => {
      //     self.redactorInput();
      //   }
      // },
      // autoparse: () => {
      //   self.redactorInput();
      // },
      // undo: () => {
      //   self.redactorInput();
      // },
      // redo: () => {
      //   self.redactorInput();
      // },
      // inserted: () => {
      //   self.redactorInput();
      // },
      synced: () => {
        self.redactorInput();
      },
			source: {},
			focus() {
				self.activateLabel();
			},
			blur() {
				self.deactivateLabel();
        let sanitized = self.removeEditableAttr(self.getVal());
        if (self.blankValues && (sanitized === `<p><br></p>\n` || sanitized === `<p><br/></p>\n` || sanitized === `<p></p>\n`)) sanitized = '';
				self.insBlur.emit(sanitized);
			}
		};

		if (this.hasCodeEditor) {
			callbacks.source = {
				opened: () => {
					self.firstLoadRedactor = false;
					if (!self.codeEditor) {
						// first initialization code mirror
							self.codeEditor = self.initCodeMirror(self.sourceViewRedactor());
					}

					self.toggleRedactor(true);
					setTimeout(() => { self.isDisabledRedactorVisualEditorView(); }, 100);
					self.activateLabel();
					self.isSourceView = true;
					self.codeEditor.focus();
				},
				closed: () => {
					self.activateLabel();
					self.toggleRedactor(false);
					self.isSourceView = false;
				}
			}
		}

		return callbacks;
	}

	toggleRedactor(source_view: boolean) {
		this.sourceView = source_view;

		if (source_view) {
			if (this.insEditorEl.querySelector('.redactor-styles').innerHTML.split("p").join() === "<,>﻿</,>") {
				this.codeEditor.setValue("");
			} else {
				this.codeEditor.setValue(this.sourceViewRedactor());
			}
		} else {
			setTimeout(() => {
				this.insEditorEl.querySelector('.redactor-styles').innerHTML = this.visualEditorRedactor();
			}, 100)
		}

		if (this.disableVisualEditor && this.firstLoadRedactor) {
			this.insEditorEl.querySelector('.redactor-styles').innerHTML = "";
			setTimeout(() => { this.insEditorEl.querySelector('.re-button.re-html').className += " redactor-button-disabled"; }, 100);
		}

		this.firstLoadRedactor = false;
	}

	visualEditorRedactor(html = "") {
		let editor_value = html ? html : this.codeEditor.getValue();
		let value = '';

		if (!editor_value || editor_value === '\n') {
			value = '<p></p>';
		} else {
			let values_html = this.convertValues('html', editor_value);
			let values_style = this.convertValues('style', editor_value);
			let values_head = this.convertValues('head', values_style.body);
			editor_value = this.toggleRedactorUpdateEditorValue(editor_value, values_head.tags);

			let values_body = this.convertValues('body', values_style.body);
			editor_value = this.toggleRedactorUpdateEditorValue(editor_value, values_body.tags);
			editor_value = this.removeTag('html', editor_value);

			this.hasRedactorDoctypeHTML = this.searchFromCode(editor_value, '<!doctype html>');
			this.redactorHTML = this.removeTag('html', values_html.original);
			this.redactorBodyTag = this.removeTag('body', values_body.original);
			this.redactorStyle = values_style.tags;
			this.redactorHead = this.removeTag('head', this.uncommentOriginalStyles(values_head.original));
			this.redactorBody = this.removeTag('body', editor_value + this.uncommentOriginalStyles(values_body.original));

			value = `${this.removeTag('style', values_style.converted) ? `<style data-redactor-style>${this.removeTag('style', values_style.converted)}</style>`: ''}${this.formatTags('style', editor_value).value}${this.removeTag('body', values_body.original)}`;
		}

		return value;
	}

	convertValues(tag: string, value: string) {
		value = this.removeHTMLMarkers(value);
		let data = this.formatTags(tag, value);
		let converted = '';
		let original = '';
		let tags = [];

		if (data.index.length) {
			let tag_children = this.getTagChildren(tag, data, value);
			converted = tag_children.converted;
			original = tag_children.original;
			tags = tag_children.tags;
		}

		return {
			original: original,
			converted: converted,
			tags: tags,
			body: data.value
		};
	}

	getTagChildren(tag: string, data: { index: { start: number; end: number }[]; value: string }, value: string) {
		let converted = `<${tag}>`;
		let original = `<${tag}>`;
		let tags = [];

		for (let counter = 0; counter < data.index.length; counter++) {
			let substr_value = value.substr(data.index[counter].start, data.index[counter].end - data.index[counter].start);
			let temp_str = this.removeTag(tag, substr_value);

			tags.push({
				tag: tag,
				attribute: this.getTagAttributes(tag, substr_value),
				original: temp_str,
				converted: tag === "style" ? this.convertStyles(temp_str) : temp_str
			});

			original += temp_str;
			converted += this.convertStyles(temp_str);
		}

		converted += `</${tag}>`;
		original += `</${tag}>`;

		return {
			name: tag,
			original: original,
			converted: converted,
			tags: tags
		};
	}

	removeHTMLMarkers(value: string) {
		return value.replace('<span id="selection-marker-start" class="redactor-selection-marker"></span>', '')
								.replace('<span id="selection-marker-end" class="redactor-selection-marker">﻿</span>', '')
								.replace('</span><span id="selection-marker-end" class="redactor-selection-marker">﻿</span>', '')
								.replace('<span id="selection-marker-start" class="redactor-selection-marker">﻿</span>', '')
								.replace(new RegExp(` data-redactor-style-cache="([\\s\\S]+?)"`, 'gi'), '');
	}

	convertString(value: string, delimeter: string) {
		let new_value = '';
		for (let counter = 0; counter < value.length; counter++) {
			new_value += delimeter;
		}
		return new_value;
	}

	convertStyles(value) {
		value = value.replace(/\{/g, ' { ').replace(/\}/g, ' } ').replace(/\s+/g, " ").trim().split(' } ');
		for (let counter = 0; counter < value.length; counter++) {
			value[counter] = `.${this.stylesId} ${value[counter]}`;
			if (value[counter].indexOf(`.${this.stylesId} body`) === 0) {
				value[counter] = value[counter].replace(`.${this.stylesId} body `, `.${this.stylesId} `);
			}
			value[counter] = value[counter].replace(/,/g, `, .${this.stylesId} `);
			value[counter] = value[counter].replace(new RegExp(`/,\\s\\.${this.stylesId}\\sbody\\s/g`), `, .${this.stylesId} `);
			value[counter] = value[counter].replace(new RegExp(`/,\\s\\.${this.stylesId}\\sbody,/g`), `, .${this.stylesId},`);
			value[counter] = value[counter].replace(new RegExp(`/\\.${this.stylesId}\\sbody,/g`), `.${this.stylesId},`);
		}

		return value.join(' } ');
	}

	getTagAttributes(tag: string, value: string) {
		var start = value.indexOf('<') + 1;
		var end = value.indexOf('>') - 1;

		return value.substr(start, end).replace(tag, '');
	}

	removeTag(tag: string, value: string) {
		let original_value = value;

		if (value.indexOf(`<${tag}>`) > -1) {
			value = value.replace(`</${tag}>`, '').replace(new RegExp(`<${tag}>`, 'gi'), '');
		} else {
			value = value.replace(`</${tag}>`, '').replace(new RegExp(`<${tag}([\\s\\S]+?)>`, 'gi'), '');
		}

		if (!value.trim()) {
			value = original_value.replace(`<${tag}>`, '').replace(`</${tag}>`, '');
		}

		return value;
	}

	formatTags(tag: string, value: string) {
		let indices = [];
		let index = 0;
		// let counter = 0;
		let new_value = value;
		let orig_value = value;

		do {
			let start = 0, end = 0;
			start = value.indexOf(`<${tag}`);
			end = (value.indexOf(`</${tag}>`) + (`</${tag}>`).length);

			if (start < 0) {
				index = -1;
			} else if (value.indexOf(`</${tag}>`) < 0) {
				let temp_value = `${value.substr(0, start)}*${value.substr(start + 1)}`;
				end = temp_value.indexOf(`<${tag}>`) + (`<${tag}>`).length;
				let temp_str = value.substr(start, end - start);
				new_value = new_value.replace(temp_str, this.convertString(temp_str, ''));
				value = value.replace(temp_str, this.convertString(temp_str, '-'));
				indices.push({ start: start, end: end });
			} else {
				let temp_str = value.substr(start, end - start);
				new_value = new_value.replace(temp_str, this.convertString(temp_str, ''));
				value = value.replace(temp_str, this.convertString(temp_str, '-'));
				indices.push({ start: start, end: end });
			}

			if (end < start) {
				// delete no closing tags
				index = -1;
			}
				// counter += 1;
		} while (index > -1)

		if (tag === "style") {
			new_value = orig_value;
			for (let counter = 0; counter < indices.length; counter++) {
				let counter_str = String.fromCharCode(counter);
				new_value = new_value.substr(0, indices[counter].start) + `<!--က${counter_str}က` + new_value.substr(indices[counter].start + (`<!--က${counter_str}က`).length - 1);
				new_value = new_value.substr(0, indices[counter].end - (`ခ${counter_str}-->`).length) + `ခ${counter_str}-->` + new_value.substr(indices[counter].end - (`ခ${counter_str}-->`).length + (`</${tag}`).length - 1);
			}
		}

		return {
			index: indices,
			value: new_value
		}
	}

	toggleRedactorUpdateEditorValue(editor_value: string, tags: { tag: string; attribute: string; original: string; converted: string }[]) {
		for (let counter = 0; counter < tags.length; counter++) {
			editor_value = editor_value.replace('<' + tags[counter].tag + tags[counter].attribute + '>' + this.uncommentOriginalStyles(tags[counter].original) + '</' + tags[counter].tag + '>', '');
		}
		return editor_value;
	}

	generateStyleTags(tags) {
		let styles = '';
		for (let counter = 0; counter < tags.length; counter++) {
			styles += `<style${tags[counter].attribute}>${tags[counter].original}</style>\n`;
		}
		return styles;
	}

	sourceViewRedactor() {
		let html_body = this.uncommentOriginalStyles(this.firstLoadRedactor ? this.value :
			this.insEditorEl.querySelector(`.id-${this.classId}`).innerHTML);
		html_body = this.removeRedactorStyles(html_body);
		html_body = this.removeGeneratedFigure(html_body);

		let html = (this.hasRedactorDoctypeHTML !== -1 ? '<!DOCTYPE html>' : '') + '\n' +
		(this.redactorHTML ? '<html>' : '') + '\n' +
		(this.redactorHead ? '<head>' : '') + '\n' +
		(this.redactorHead) + '\n' +
		(this.redactorHead ? '</head>' : '') + '\n' +
		(this.redactorBodyTag ? '<body>' : '') + '\n' +
		html_body +
		(this.redactorBodyTag ? '</body>' : '') + '\n' +
		(this.redactorHTML ? '</html>' : '');

		html = html.replace(/^\s*[\r\n]/gm, '').replace(/﻿/g, '');
    let sanitized = this.removeEditableAttr(html);
		this.sourceCodeViewOnly(sanitized);

		return sanitized;
	}

	uncommentOriginalStyles(html: string) {
		return html.replace(new RegExp(`<!--က([\\s\\S]+?)က`, 'gi'), '<style')
							 .replace(new RegExp(`\\ခ([\\s\\S]+?)-->`, 'gi'), 'style>');
	}

	removeRedactorStyles(html: string) {
		return html.replace(new RegExp(`<style data-redactor-style([\\s\\S]+?)</style>`, 'gi'), '');
	}

	removeGeneratedFigure(html: string) {
		return html.replace(new RegExp(`<figure class="redactor-component redactor-component-active"([\\s\\S]+?)</span>`, 'gi'), '')
								.replace(new RegExp(`<figure class="redactor-component([\\s\\S]+?)>`, 'gi'), '')
								.replace(new RegExp(`<figure([\\s\\S]+?)>`, 'gi'), '')
								.replace(/<\/figure>/g, '');
	}

	isDisabledRedactorVisualEditorView() {
		if (this.editor) {
			if (this.disableVisualEditor) {
				if (this.insEditorEl.querySelector('.redactor-toolbar .re-html').className.indexOf('redactor-button-disabled') === -1) {
					this.insEditorEl.querySelector('.redactor-toolbar .re-html').className += " redactor-button-disabled";
				}
			} else {
				this.insEditorEl.querySelector('.redactor-toolbar .re-html').className = this.insEditorEl.querySelector('.redactor-toolbar .re-html').className.replace(" redactor-button-disabled", "");
			}
		}
	}

	initCodeMirror(html = "") {
		let editor = CodeMirror.fromTextArea(this.insEditorEl.querySelector(`.${this.classId}`), {
			lineNumbers: !this.disableLineNumbers,
			lineWrapping: true,
			mode: this.mode,
			extraKeys: {
				"Alt-F": "findPersistent",
				"F10": function (el) {
					el.setOption("fullScreen", !el.getOption("fullScreen"));
				}
			},
			readOnly: this.readonly
		});

		CodeMirror.commands["selectAll"](editor);
		if (this.theme) {
			editor.setOption("theme", this.theme);
		}

		if (html) {
			editor.setValue(html);
			this.hasRedactorDoctypeHTML = this.searchFromCode(html, '<!doctype html>');
		}

		this.codeMirrorEvents(editor);
		let wrap = this.insEditorEl.querySelector('.CodeMirror-wrap');

		wrap.addEventListener('mouseover', () => {
			wrap.classList.add('fullscreen-help');

			setTimeout(() => {
				wrap.classList.remove('fullscreen-help');
			}, 5000);
		});

		wrap.addEventListener('mouseout', () => {
			wrap.classList.remove('fullscreen-help');
		});

		this.hideCursor();
		return editor;
	}

	codeMirrorEvents(editor) {
		const self = this;

		editor.on('change', () => {
			if (!self.firstLoadRedactor) {
				self.activateLabel();
			}
			self.sourceCodeViewOnly(editor.getValue());
      self.isDisabledRedactorVisualEditorView();
      let sanitized = this.removeEditableAttr(self.getVal());
			self.insInput.emit(sanitized);
		});

		editor.on('focus', () => {
			self.activateLabel();
			self.showCursor();
		});

		editor.on('blur', () => {
			self.deactivateLabel();
      self.hideCursor();
      let sanitized = this.removeEditableAttr(self.getVal());
			self.insBlur.emit(sanitized);
		});
	}

	showCursor() {
		let el = this.insEditorEl.querySelector('.CodeMirror-cursor');
		if (el) {
			el.setAttribute("style", "visibility: visible");
		}
	}

	hideCursor() {
		let el = this.insEditorEl.querySelector('.CodeMirror-cursor');
		if (el) {
			el.setAttribute("style", "visibility: hidden");
		}
	}

	sourceCodeViewOnly(html: string) {
		if (this.searchFromCode(html, '<ins-') !== -1) {
			this.disableVisualEditor = true;
		} else if (this.searchFromCode(html, '{{') !== -1 || this.searchFromCode(html, '{%') !== -1 ||
			this.searchFromCode(html, '}}') !== -1 || this.searchFromCode(html, '%}') !== -1) {
			this.disableVisualEditor = true;
		} else {
			this.disableVisualEditor = false;
		}
	}

	searchFromCode(html: string, value: string) {
		let index = -1;
		if (html) {
			index = html.toLowerCase().indexOf(value);
		}
		return index;
	}

	dynamicStyles() {
		this.insEditorEl.querySelector('.style-area').innerHTML =
		`<style>.ins-editor .${this.classId} + .CodeMirror-wrap {
				display: none !important;
			}
			.ins-editor .redactor-source-view .${this.classId} + .CodeMirror-wrap {
				display: block !important;
				min-height: 265px;
			}
		</style>`;
	}

  validateDescription(value: string) {
    let allowed = '<a>,<abbr>,<acronym>,<address>,<article>,<aside>,<b>,<base>,<bdi>,<bdo>,<blockquote>,<br>,<caption>,<code>,<dd>,<del>,<details>,<dfn>,<dir>,<div>,<dl>,<dt>,<em>,<font>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<hr>,<i>,<ins>,<label>,<li>,<link>,<mark>,<menu>,<meter>,<nav>,<ol>,<p>,<pre>,<q>,<s>,<samp>,<section>,<small>,<span>,<strike>,<strong>,<sub>,<summary>,<sup>,<table>,<tbody>,<td>,<tfoot>,<th>,<thead>,<time>,<tr>,<tt>,<u>,<ul>,<wbr>';
    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return value.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) => {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
  }

	render() {
		return (
			<div class="ins-editor">
				<div class={`
          ${this.hasError ? 'has-error ' : ''}
          ${this.readonly ? 'readonly ' : ''}
          ${this.activeLabel ? 'active' : ''}
        `}>

        { this.label || this.tooltip ?
					<label>
            {this.label}

            {this.tooltip
              ? <ins-input-tooltip content={this.tooltip}></ins-input-tooltip>
              : ''
            }
          </label>
        : '' }

					<textarea name={this.name} class={this.classId}></textarea>
        	<div class="style-area"></div>
					<div class="ins-form-error">
            {this.errorMessage}
          </div>


          { this.description ? this.htmlDescription ?
            <div class="ins-description" innerHTML={this.validateDescription(this.description)}></div> : <div class="ins-description">{this.description}</div>
          : ''}
				</div>
			</div>
		)
	}
}
