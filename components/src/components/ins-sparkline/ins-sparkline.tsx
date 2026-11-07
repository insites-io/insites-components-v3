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
        // A tile sparkline is a thin strip, not a chart (IIA DSH-10).
        height: 56,
        marginTop: 4,
        marginBottom: 4,
        style: {
          fontFamily: 'var(--ins-font-family, Open Sans)'
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
        padding: 8,
        borderRadius: 6,
        backgroundColor: 'var(--ins-card, #fff)',
        style: { fontFamily: 'var(--ins-font-family, Open Sans)', fontSize: '12px', color: 'var(--ins-text-1, #222)' },
        formatter: function () {
          // The point name (a date or hour label) heads the reading; the value is locale formatted.
          const label = this.key ?? this.point?.name ?? this.series?.name ?? '';
          const value = typeof this.y === 'number' ? this.y.toLocaleString() : this.y;
          return `<span> ${label} <br /> <strong>${value}</strong></span>`
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

        {/* No percentage (empty, null or the legacy "N/A") renders the description alone: a tile must never
            print "N/A" or a meaningless "- 0%" where data is absent. */}
        {this.percentage === '' || this.percentage == null || this.percentage === 'N/A'
          ? <div class={`description`}>{this.description}</div>
          : <div class={`description ${this.movement}`}>
            <div>
              {this.movement === 'increase' || this.movement === 'decrease' ? <span class="arrow"></span> : '- '}
              <span>{this.percentage}%</span> {this.description}
            </div>
          </div>
        }
      </div>
    )
  }
}