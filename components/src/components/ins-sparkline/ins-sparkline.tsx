import { h, Component, Prop, Element, Event, EventEmitter } from '@stencil/core';

@Component({ tag: 'ins-sparkline' })
export class InsSparkline {
  @Element() insSparklineEl: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) icon: string = "";
  @Prop({ mutable: true }) name: string = "";
  @Prop({ mutable: true }) value: string = "";
  @Prop({ mutable: true }) chartData: any;
  @Prop({ mutable: true }) percentage: any = "";
  @Prop({ mutable: true }) description: string = "";
  @Prop({ mutable: true }) movement: any = "";
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  insChartEl: HTMLInsChartElement;
  chartContainerEl: HTMLElement;

  componentWillLoad() {
    this.checkMovement();
  }

  componentDidLoad() {
    this.insChartEl = this.insSparklineEl.querySelector('ins-chart');
    this.chartContainerEl = this.insChartEl.querySelector('.chart-container') as HTMLElement;
    this.renderChart();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insSparklineEl);
    }
  }

  componentWillUpdate(){
    this.checkMovement();
  }

  componentDidUpdate(){
    this.renderChart();
  }

  checkMovement() {
    this.movement = this.movement.toLowerCase();
    switch (this.movement) {
      case '1':
      case 'increase':
        this.movement = 'increase';
        break;
      case '0':
      case 'decrease':
        this.movement = 'decrease';
        break;
      default:
        this.movement = 'none';
    }
  }

  renderChart() {
    let options = {
      chart: {
        renderTo: this.chartContainerEl,
        type: 'spline',
        height: 150,
        marginBottom: 30,
        style: {
          fontFamily: 'Open Sans'
        }
      },
      title: { text: "" },
      legend: { enabled: false },
      exporting: { enabled: false },
      credits: { enabled: false },
      yAxis: {
        visible: false,
        minRange: 0.1
      },
      xAxis: {
        categories: [],
        visible: false
      },
      plotOptions: {
        series: {
          marker: { enabled: false }
        },
        areaspline: {
          marker: { enabled: false },
          fillOpacity: 0.1,
        }
      },
      series: [{
        name: this.name,
        data: this.chartData
      }],
      tooltip: {
        headerFormat: '<div>',
        pointFormat: '<span>{point.y}</span>',
        footerFormat: '</div>',
        borderWidth: 0,
        shadow: {
          opacity: .02,
          offsetX: 1,
          offsetY: 1,
          width: 10
        },
        padding: 5,
        backgroundColor: '#fff',
        formatter: function () {
          return `<span> ${this.key} <br /> <strong>${this.y}</strong></span>`
        }
      }
    }

    this.insChartEl.renderChart(options as any);
  }

  render() {
    return (
      <div class="ins-sparkline">
        <i class={`far ${this.icon}`}></i>
        <h3>{this.name}</h3>
        <span class="value">{this.value}</span>
        <ins-chart></ins-chart>

        {this.percentage !== 'N/A' && this.percentage !== 0
          ? <div class={`description ${this.movement}`}>{/*this.movement === "1" || */}
            {this.percentage ?
              <div>
                {this.movement === 'increase' || this.movement === 'decrease' ? <span class="arrow"></span> : '- '}
                <span>{this.percentage}%</span> {this.description}
              </div>
              :
              <div>
                - 0% {this.description}
              </div>
            }
          </div> :
          <div class={`description`}>
            {/* <span>{!this.percentage ? 0 : this.percentage}%</span> {this.description} */}
            <span>N/A</span>
          </div>
        }
      </div>
    )
  }
}