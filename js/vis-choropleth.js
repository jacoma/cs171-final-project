
/*
 * Africa Map - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  data
 */

MapChart = function(_parentElement, _data){

	this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = [];

  // DEBUG RAW DATA
  // console.log(this.data);
  this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

MapChart.prototype.initVis = function(){
  var vis = this;

  vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

	vis.width = 800 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

  vis.colorScale = d3.scaleQuantile();

  /*** CREATE INPUTS */
  var inputDiv = d3.select("#" + vis.parentElement)
    .append("div")
    .attr("id", "div-metric-select")
    .attr("class", "col-xs-2 col-md-3");

  inputDiv.append("label")
    .attr("for", "metric-select")
    .attr("class", "select")
    .html("Color By:");

  vis.select = inputDiv.append("select")
    .attr("class","select form-control")
    .attr("id", "metric-select")
    .on('change', changeMetric);

  vis.options = vis.select.selectAll("option")
    .data(metrics)
    .enter()
    .append('option')
    .attr("value", d => d)
    .property("selected", function(d){ return d === mapMetric; })
    .text(d => d.replace(/_/g, " "));

  /*** SVG */
  vis.svg = d3.select("#" + vis.parentElement)
    .append("svg")
    .attr("id", "svg-map")
	  .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.responsivefy();

  /*** CREATE TOOLTIP */
  vis.tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  /*** CREATE LEGEND */
  vis.legendWidth = 260;
  vis.legendLength = vis.colorScale.range().length;

  vis.legendTitle = vis.svg.append("text")
      .attr("y", -6)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold");

  /*** CREATE PROJECTION & PATH */
  vis.projection = d3.geoMercator()
    .translate([vis.width/2, vis.height/2])
    .scale([250]);

  vis.path = d3.geoPath()
    .projection(vis.projection);

  vis.wrangleData();
}

MapChart.prototype.wrangleData = function(){
  var vis = this;

  vis.displayData = vis.data;

  /*** UPDATE VISUALIZATION */
  vis.updateVis();
}
    

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

MapChart.prototype.updateVis = function(){
  var vis = this;

  /*** DETERMINE SCALE PARAMETERS */
  if(mapMetric === "At_high_risk" || mapMetric === "At_risk"){
    numQuants = 5;
  } else {
    numQuants = 9;
  }

  if(mapMetric === "UN_population"){
    scheme = d3.schemeBlues[numQuants];
  } else {
    scheme = d3.schemeReds[numQuants];
  }

  vis.t = d3.transition().duration(800).ease(d3.easeLinear);

  /*** UPDATE SCALE */
  metricRange = d3.extent(vis.displayData, d => d.properties[mapMetric]);
  vis.colorScale.domain([0, metricRange[1]]).range(scheme);

  vis.colorArray = vis.colorScale.range().reverse();

  /*** CREATE MAP */
	vis.map = vis.svg.selectAll("path")
    .data(vis.displayData);

  vis.map.enter()
    .append("path")
    .attr("class", "map")
    .merge(vis.map)
    .transition(vis.t)
    .attr("d", vis.path)
    .style("opacity", 0.8)
    .style("fill", function(d){
      if(isNaN(d.properties[mapMetric])) {
        return "grey";
      } else {
        return vis.colorScale(d.properties[mapMetric]);
      }
    });


    /*** ADD EVENT LISTENERS TO MAP */
    d3.selectAll(".map")
      .on("mouseover", function(d){

        d3.selectAll(".map")
          .transition()
          .duration(150)
          .style("opacity", .5);

        d3.select(this)
          .transition()
          .duration(150)
          .style("opacity", 1)
          .style("stroke-width", 1.5);
      
        row = d.properties;
        metric = !row[mapMetric] ? "No data":(mapMetric === "At_high_risk" || mapMetric === "At_risk") ?
          percentformat(row[mapMetric]):format(row[mapMetric])

        vis.tooltip.transition()
          .duration(150)
          .style("opacity", 1);

        vis.tooltip.html("Country: " + row.name + "<br/>" + mapMetric.replace(/_/g, " ") +": " + metric)
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d){
        
        d3.selectAll(".map")
          .transition()
          .duration(150)
          .style("opacity", .8)
          .style("stroke-width", 1);

        vis.tooltip.transition()
        .duration(150)
        .style("opacity", 0);
      });


  /*** UPDATE LEGEND */
  vis.legendTitle.text(mapMetric.replace(/_/g, " "));

  var legendArray = [];
  vis.colorArray.forEach(function(d){
        var extent = vis.colorScale.invertExtent(d);
        legendArray.push({"key":mapMetric, "color": d, "firstNum":extent[0], "secondNum": extent[1]});
  });

  vis.legendRect = vis.svg.selectAll('.legend-rect')
      .data(legendArray);
  
  vis.legendRect
    .enter()
      .append('rect')
      .attr('class', 'legend-rect')
      .attr("x", 10)
      .attr("width", 10)
      .attr("height", 20)
      .merge(vis.legendRect)
      .attr("y", function(d, i) {
         return i * 20;
      })
      .style("fill", function(d){return d.color;});
  
  vis.legendRect.exit().remove();
  
  vis.legendText = vis.svg.selectAll('.legend-text')
    .data(legendArray);

  vis.legendText.enter()
      .append('text')
      .attr('class', 'legend-text')
      .attr("x", 25)
      .attr("dy", "0.8em")
      .merge(vis.legendText)
      .attr("y", function(d, i) {
         return (i * 20)+5})
      .text(function(d,i) {
        if(mapMetric === "At_high_risk" || mapMetric === "At_risk"){
          return percentformat(+d.firstNum) + " - " + percentformat(+d.secondNum);
        } else{
          return format(+d.firstNum) + " - " + format(+d.secondNum);
        }
      });

  vis.legendText.exit().remove();

}

MapChart.prototype.responsivefy = function(){
  var vis = this;
  
	// MODIFIED FROM https://brendansudol.com/writing/responsive-d3.

	// get container + svg aspect ratio
    var container = d3.select("#" + vis.parentElement),
      svg = d3.select("#svg-map"),
      width = parseInt(svg.attr("width")),
      height = parseInt(svg.attr("height"));

	// add viewBox and preserveAspectRatio properties,
	// and call resize so that svg resizes on inital page load
	svg.attr("viewBox", "0 0 " + width + " " + height)
		.attr("perserveAspectRatio", "xMidYMid")
		.call(resize);
		
	d3.select(window).on("resize." + container.attr("id"), resize);

	// get width of container and resize svg to fit it
	function resize() {
		var targetWidth = parseInt(container.style("width"));
		svg.attr("width", targetWidth);
	}
}