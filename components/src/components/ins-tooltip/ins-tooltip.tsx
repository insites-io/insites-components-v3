import { h, Component, Prop, Element } from '@stencil/core';
import Tooltip from 'tooltip.js';

@Component({ tag: 'ins-tooltip' })

export class InsTooltip {
    @Element() insTooltipEl: HTMLElement;
    @Prop({mutable: true}) label: string = "";
    @Prop({mutable: true}) shape: string = "circle"; // circle, rectangle
    @Prop({mutable: true}) icon: any = '';
    @Prop({mutable: true}) position: any = 'top'; // top, bottom, left, right (_-start, _-end)
    @Prop({mutable: true}) content: string = "";
    @Prop({mutable: true}) background: boolean = true;
    @Prop({mutable: true}) trigger: string = "click"; // click, hover, focus
    @Prop({mutable: true}) html:boolean = false;
    @Prop({mutable: true}) closeOnClick: boolean = true;
    @Prop({mutable: true}) width: string = "";
    @Prop({mutable: true}) autoWidth: boolean = false;
    @Prop({mutable: true}) container: any = false;

    componentDidLoad() {
        let el = this.insTooltipEl.querySelector('.tooltip-label') as HTMLElement;
        new Tooltip(el, {
            container: this.container,
            placement: this.position,
            title: this.content,
            trigger: this.trigger,
            html: this.html,
            closeOnClickOutside: this.closeOnClick,
            popperOptions: {
                onCreate: (data: any) => {
                    let tempData = data as any;
                    tempData.instance.scheduleUpdate(); // trigger plugin reset => compute element's position
                    return tempData;
                },
                modifiers: {
                    preventOverflow: {
                        enabled: true,
                        padding: 70,
                        escapeWithReference: true,
                        boundariesElement: 'viewport'
                    },
                    setCustomStyle: {
                        order: 301,
                        enabled: true,
                        fn: (data: any) => {
                             if (!!this.width) {
                                data.styles.width = this.width
                            } else if(this.autoWidth) {
                                data.styles['white-space'] = 'nowrap';
                            }
                            return data;
                        }
                    }
                }
            }
        });
    }

    render() {
        return (
            <div class="ins-tooltip-wrap">
                <span class={`tooltip-label ${this.shape} ${!this.background ?'no-background' : ''}`}>
                   <span>{!!this.icon ? <i class={`${this.icon}`}></i> : ''} {!!this.label ? this.label : ''}</span>
                </span>
            </div>
        )
    }

}