import Highcharts from "highcharts";
import addHistogram from "highcharts/modules/histogram-bellcurve";

addHistogram(Highcharts);

const collection = {
  
  input: {},
  summary: {},
  output: {},
  
  distill: function(data={}) {

    // will need to exempt cancels and fails(?)

    let self = this;
    let sims = data["Simulations"] || [];

    sims.forEach(function (sim) {
      let job, startDate, endDate, elapsed = 0;
      try {
        job = sim["HPCJobs"][sim["HPCJobs"].length - 1];
        startDate = new Date(Date.parse(job["StartTime"]));
        endDate = new Date(Date.parse(job["EndTime"]));
        elapsed = endDate - startDate;
      } catch (e) {
        console.error("distribution.collection.distill.error:", e);
      }
      if (!!elapsed) {
        self.summary[sim["Id"]] = elapsed;
      }
    })
  },

  /** update resets collection with new data object
   * @param data {Collection} Response JSON
   */
  update: function (data) {
    this.input = data;
    this.summary = {};
    this.output = {};
    this.distill(data);
  },
  
  getIdByPosition: function (position) {
    return Object.keys(this.summary)[position];
  },

  get latest () {
    return this.summary;
  },
  
  get times () {
    return Object.values(this.summary);
  },
  
  get minutes () {
    return Object.values(this.summary).map(x => Math.round(x/1000/60));
  }
};

const ingest = function (dataurl, callback) {
  fetch(dataurl, { method:"GET" })
  .then(response => response.json())
  .then(data => collection.update(data))
  // .then(response => fetch(ENDPOINT+API.Stats, { method:"GET" }))
  // .then(response => response.json())
  // .then(data => collection.append(data.Stats))
  .catch(function (error) {
    console.error(error);
  })
  .finally(function () {
      if (!!callback && callback instanceof Function) {
        callback();
      }
    }
  );
};

const chart  = function (targetId, data) {

  Highcharts.setOptions({
    chart: {
      style: {
        fontFamily: '"Roboto", "Calibri", sans-serif',
        fontWeight: 400
      }
    },
    lang: {
      noData: "No data was found."
    }
  });

  Highcharts.SVGRenderer.prototype.symbols.rect = function(x, y, w, h) {
    return [
      'M', x + w / 2, y, 
      'L', x + w / 2, y + h,
      'M', x + w / 2, y + h / 2,
      'L', x + w / 2, y + h / 2,
      'z'
    ];
  };

  if (Highcharts.VMLRenderer) {
    Highcharts.VMLRenderer.prototype.symbols.rect = Highcharts.SVGRenderer.prototype.symbols.rect;
  }
  
  Highcharts.chart(targetId, {
    
    credits: {
      enabled: false
    },
    
    title: {
      text: ""
    },
    
    xAxis: [{
      title: { 
        text: "Bins of Runtime",
        style: {
          color: "#7CB5EC"
        }
      },
      labels: {
        style: {
          color: "#7CB5EC"
        }
      },
      alignTicks: false
    }, {
      title: { 
        text: "Runtime Sequence",
        style: {
          color: "orangered"
        }
      },
      labels: {
        style: {
          color: "orangered"
        }
      },
      alignTicks: false,
      opposite: true
    }],

    yAxis: [{
      title: { 
        text: "Simulations per Bin",
        style: {
          color: "#7CB5EC"
        }
      },
      labels: {
        style: {
          color: "#7CB5EC"
        }
      }
    }, {
      title: { 
        text: "Runtime in Minutes",
        style: {
          color: "orangered"
        }
      },
      labels: {
        style: {
          color: "orangered"
        }
      },
      opposite: true
    }],

    tooltip: {
      useHTML: true,
      shared: false,
      formatter: function() {
        if (this.series.name == "Scatter") {
          return "Runtime: <b>" + this.point.y + "</b> (mins)<br>Sim: <b>" + collection.getIdByPosition(this.point.x) + "</b>";
        } else {
          return "Range: <b>" + this.point.x + "-" + this.point.x2 + "</b> (mins)<br>Count: <b>" + this.point.y + "</b>";
        }
      }
    },

    series: [{
      name: "Histogram",
      type: "histogram",
      baseSeries: "s1",
      zIndex: -1
    }, {
      name: "Scatter",
      type: "scatter",
      data: data,
      xAxis: 1,
      yAxis: 1,
      id: "s1",
      marker: {
        symbol: "rect",
        lineColor: "orangered",
        radius: 4,
        lineWidth: 1.5
      },
      cursor: "pointer",
      events: {
        click: function (event) {
          let x = (event.point.x);
          let id = collection.getIdByPosition(x);
          alert(`This is Simulation ${id}`);
        }
      }
    }]
  });
};

const render = function (targetId, dataurl) {
  
  ingest(dataurl,  function () {
    chart(targetId, collection.minutes);
    // console.log("charted data (elapsed runtime in minutes):", collection.minutes);
  })
  
};

const refresh = function (rootElement=document) {

  alert("refresh!");
};

export default { render,  refresh };