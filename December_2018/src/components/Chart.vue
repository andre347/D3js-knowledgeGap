<template>
  <div>
    <h1>Global Life Expectancy at Birth</h1>
    <h2>Life Expectancy Change vs {{value}}</h2>
    <input
      type="range"
      id="rangeFilter"
      :min=xRange[0]
      :max=xRange[1]
      step="1"
      v-model="value"
      :style="{width: `${svGwidth-200}px`}"
    >

    <svg
      id="lineChart"
      ref="chart"
      :width=svGwidth
      :height=svGheight
    >
      <g style="transform: translate(0, 0)">
        <path
          v-for="(l,i) in filteredYear"
          :d="l"
          :key='i'
        />
      </g>
      <g
        class="axis"
        ref="xAxis"
        style="transform: translate(0, 550px)"
      ></g>
    </svg>
    <a
      target="_blank"
      href="https://www.makeovermonday.co.uk/week-45/"
    >Source</a>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "chart",
  data() {
    return {
      svGwidth: 1100,
      svGheight: 570,
      margin: {
        top: 0,
        right: 50,
        bottom: 0,
        left: 50
      },
      xRange: 0,
      value: 1975,
      chartData: []
    };
  },
  methods: {
    getScales() {
      // Create x scale
      // Range is hardcoded - future projects need to be dynamic
      const x = d3
        .scaleLinear()
        .range([100, this.svGwidth - this.margin.left - this.margin.right])
        .domain(d3.extent(this.chartData, d => +d.year));
      // Create y scale
      // Domain starts at -60 for the difference calc in computed - also hardcoded
      const y = d3
        .scaleLinear()
        .range([this.svGheight - this.margin.top - this.margin.bottom, 0])
        .domain([
          -60,
          d3.max(this.chartData, d => Math.round(+d["life-expectancy"]))
        ]);

      // get min and max values of year for range slider
      this.xRange = d3.extent(this.chartData, d => +d.year);

      // return the x and y as object (destructered in next method)
      return { x, y };
    },
    createAxis() {
      // create Xaxis and assing to bottom
      const xAxis = d3.axisBottom(this.getScales().x);
      // add Xaxis to the chart component by using the ref in the Vue Object
      const axisX = d3
        .select(this.$refs.xAxis)
        .attr("class", "axis")
        .call(xAxis)
        .attr("font-family", "Avenir")
        .attr("font-size", 11);
    },
    calculatePath() {
      const scale = this.getScales();
      const path = d3
        .line()
        .x(d => scale.x(d.year))
        .y(d => scale.y(+d.diff))
        .curve(d3.curveCatmullRom.alpha(0.5));
    }
  },
  computed: {
    // this computed method returns an array that is filtered by the range filter. Vue handles the updating of the chart
    // Use Robert Crocker's method of calculating the life expectancy difference as per this blog: https://www.vizsimply.com/blog/knowledgegaps-clean-d3-code-written-with-classes
    filteredYear() {
      const baselineYear = this.chartData.filter(d => +d.year === +this.value);
      const filterData = d3
        .nest()
        .key(d => d.country)
        .entries(this.chartData);

      for (let country of filterData) {
        const baselineCountry = baselineYear.filter(
          d => d.country === country.key
        );
        for (let value of country.values) {
          value.diff =
            value["life-expectancy"] - baselineCountry[0]["life-expectancy"];
        }
      }

      const scale = this.getScales();
      const path = d3
        .line()
        .x(d => scale.x(d.year))
        .y(d => scale.y(+d.diff))
        .curve(d3.curveCatmullRom.alpha(0.5));

      let arr = [];

      filterData.forEach(d => {
        arr.push(path(d.values));
      });
      // return the array with newly filtered data
      return arr;
    }
  },
  mounted() {
    // using D3's way of reading in a CSV - not importing with Vue or other library
    d3.csv("./life-expectancy.csv").then(data => {
      this.chartData = data;
      this.createAxis();
      //this.calculatePath();
    });
  }
};
</script>

<style>
div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
a {
  color: #42b983;
  text-decoration: none;
  margin-top: 30px;
}

#lineChart {
  border: 0.1px solid lightgray;
  padding: 25px;
}

.axis line {
  fill: none;
  stroke: grey;
  stroke-width: 1;
  shape-rendering: crispEdges;
}

.axis path {
  stroke: grey;
}

.axis text {
  fill: grey;
}

path {
  fill: none;
  stroke: #76bf8a;
  stroke-width: 1.5px;
}

#rangeFilter {
  margin-bottom: 25px;
}
</style>
