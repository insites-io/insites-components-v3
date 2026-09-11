import { h, Component, Prop, Element, Event, EventEmitter } from '@stencil/core';

@Component({ tag: 'ins-line-chart' })
export class InsLineChart {
  @Element() insLineChartEl: HTMLElement;
  @Event() didLoad: EventEmitter;
  @Prop() hasLoad: string;
  @Prop({ mutable: true }) name: string = "";
  @Prop({ mutable: true }) categories: any = [];
  @Prop({ mutable: true }) chartData: any = [];
  @Prop({ mutable: true }) load: boolean = false;
  @Prop({ mutable: true }) checkLoad: boolean = false;

  insChartEl: HTMLInsChartElement;
  chartContainerEl: HTMLElement;

  componentDidLoad() {
    this.insChartEl = this.insLineChartEl.querySelector('ins-chart');
    this.chartContainerEl = this.insChartEl.querySelector('.chart-container') as HTMLElement;
    this.renderChart();
    if (this.checkLoad) this.load = true;
    this.didLoad.emit();
    if (this.hasLoad && window["Insites"]){
      let func = window["Insites"].methods[this.hasLoad];
      if (func) func(this.insLineChartEl);
    }
  }

  componentWillLoad() {
    this.parseProps();
  }

  componentWillUpdate(){
    this.parseProps();
    this.renderChart();
  }

  parseProps(){
    if (typeof this.chartData === 'string') {
      try {
        this.chartData = JSON.parse(this.chartData);
      } catch(e) {
        console.error("Invalid chart data for", this.insLineChartEl);
      }
    }

    if (typeof this.categories === 'string') {
      try {
        this.categories = JSON.parse(this.categories);
      } catch(e) {
        console.error("Invalid chart categories for", this.insLineChartEl);
      }
    }
  }

  renderChart() {
    let options = {
      chart: {
        renderTo: this.chartContainerEl,
        type: 'spline',
        plotBackgroundColor: {
          linearGradient: [0, 0, 0, 400],
          stops: [
            [0, 'rgba(238,238,238,0)'],
            [1, 'rgb(245, 246, 248)']
          ]
        },
        zoomType: 'x',
        animation: true,
        spacingLeft: 0,
        spacingRight: 0,
        spacingTop: 0,
        style: {
          fontFamily: 'Open Sans'
        }
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 900
          }
        }]
      },
      rangeSelector: {
        enabled: true
      },
      navigator: {
        enabled: true
      },
      title: {
        text: null,
      },
      exporting: {
        enabled: false
      },
      tooltip: {
        shared: true,
        // crosshairs: true
        // borderRadius: 0,
        borderWidth: 0,
        shadow:{
        opacity: .02,
        offsetX: 1,
        offsetY: 1,
        width: 10
      },
      padding: 5,
      backgroundColor: '#fff',
      },
      xAxis: [{
        crosshair: {
            color: '#ccc',
            width: 1,
            zIndex: 1,
            dashStyle: 'dash'
        },
        alternateGridColor: '#ffffff',
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          week: '%b %e',
          day: '%b %e',
          month: '%b'
        },
        categories: this.categories,
        startOnTick: false,
        endOnTick: false,
        gridLineWidth: 0,
        minPadding: 0.015,
        maxPadding: 0.0075,
        tickLength: 0,
        labels: {
          align: 'center',
          style: {
            color: '#8C94A4',
            fontSize: "12px"
          },
          x: 0,
          y: 40,
        }
      }],
      yAxis: {
        allowDecimals: false,
        title: {
          text: null,
        },
        gridLineColor: '#dce1e8',
        labels: {
          align: 'right',
          x: -20,
          y: 0,
          style: {
            color: '#8C94A4',
            fontSize: "12px"
          }
        },
        plotLines: [{
          color: '#E4E6EC',
          width: 1,
          value: 0,
          zIndex: 2
        }],
        min: 0
      },
      legend: {
        enabled: true,
        align: 'center',
        layout: 'horizontal',
        verticalAlign: "bottom",
        itemStyle: {
          color: '#8C94A4',
          fontSize:  "14px",
          fontWeight: 'normal'
        },
        itemMarginTop: 30,
        symbolWidth: 32
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false,
            fillColor: '#fff',
            symbol: 'circle',
            radius: 1
          }
        }
      },
      series: this.chartData
    }

    this.insChartEl.renderChart(options as any);
  }

  render() {
    return (
      <div class="ins-line-chart">
        <h2>{this.name}</h2>
        <ins-chart></ins-chart>
      </div>
    )
  }
}