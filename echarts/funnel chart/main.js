var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

(function () {
  const template = document.createElement('template')
  template.innerHTML = `
      <style>
      #root {
        background-color: #100c2a;
      }
      #placeholder {
        padding-top: 1em;
        text-align: center;
        font-size: 1.5em;
        color: white;
      }
      </style>
      <div id="root" style="width: 100%; height: 100%;">
        <div id="placeholder">Time-Series Animation Chart</div>
      </div>
    `
  class SamplePrepared extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')

      this._props = {}
    }

    // ------------------
    // Scripting methods
    // ------------------
    async render (resultSet) {
      await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.0.0/echarts.min.js')

      this._placeholder = this._root.querySelector('#placeholder')
      if (this._placeholder) {
        this._root.removeChild(this._placeholder)
        this._placeholder = null
      }
      if (this._myChart) {
        echarts.dispose(this._myChart)
      }
      var myChart = this._myChart = echarts.init(this._root, 'dark')

      const MEASURE_DIMENSION = '@MeasureDimension'
      const countries = []
      const timeline = []
      const series = []
      resultSet.forEach(dp => {
        const { rawValue, description } = dp[MEASURE_DIMENSION]
        const country = dp.Country.description
        const year = Number(dp.timeline.description)

        if (countries.indexOf(country) === -1) {
          countries.push(country)
        }
        if (timeline.indexOf(year) === -1) {
          timeline.push(year)
        }
        const iT = timeline.indexOf(year)
        series[iT] = series[iT] || []
        const iC = countries.indexOf(country)
        series[iT][iC] = series[iT][iC] || []

        let iV
        if (description === 'Income') { iV = 0 }
        if (description === 'LifeExpect') { iV = 1 }
        if (description === 'Population') { iV = 2 }
        series[iT][iC][iV] = rawValue
        series[iT][iC][3] = country
        series[iT][iC][4] = year
      })

      const data = {
        countries,
        series,
        timeline
      }
      // console.log(data)
      // $.get('https://cdn.jsdelivr.net/gh/apache/incubator-echarts-website@asf-site/examples' + '/data/asset/data/life-expectancy.json', function (data) {
      //   console.log(data)
      // })

      var itemStyle = {
        opacity: 0.8,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }

      var sizeFunction = function (x) {
        var y = Math.sqrt(x / 5e8) + 0.1
        return y * 80
      }
      // Schema:
      var schema = [
        { name: 'Income', index: 0, text: 'Income', unit: 'USD' },
        { name: 'LifeExpectancy', index: 1, text: 'LifeExpectancy', unit: 'Year' },
        { name: 'Population', index: 2, text: 'Population', unit: '' },
        { name: 'Country', index: 3, text: 'Country', unit: '' }
      ]

      const option = {
  title: {
    text: 'Funnel'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c}%'
  },
  toolbox: {
    feature: {
      dataView: { readOnly: false },
      restore: {},
      saveAsImage: {}
    }
  },
  legend: {
    data: ['Show', 'Click', 'Visit', 'Inquiry', 'Order']
  },
  series: [
    {
      name: 'Funnel',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      },
      data: [
        { value: 60, name: 'Visit' },
        { value: 40, name: 'Inquiry' },
        { value: 20, name: 'Order' },
        { value: 80, name: 'Click' },
        { value: 100, name: 'Show' }
      ]
    }
  ]
}

      myChart.setOption(option)
    }
  }

  customElements.define('com-sap-sample-echarts-prepared', SamplePrepared)
})()
