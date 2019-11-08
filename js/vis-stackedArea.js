/*
 * StackedAreaChart
 * @param _parentElement 
 * @param _data	
 */

StackedAreaChart = function(_parentElement, _data){

	this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    // DEBUG RAW DATA
    // console.log(this.data);

    this.initVis();
}



/*
 * Initialize visualization
 */

StackedAreaChart.prototype.initVis = function(){
    var vis = this;

	vis.margin = { top: 40, right: 20, bottom: 60, left: 60 };

	vis.width = 800 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

  /*** SVG */
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("id", "svg-stacked")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
       .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	/*** CLIP PATH */
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

    /*** RESPONSIVE SVG */
	vis.responsivefy();

    /*** CREATE SCALES */
    vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(d3.keys(vis.data[0]).filter(function(d){ return d != "Year"; }));

    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) { return d.Year; }));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("text")
		.attr("class", "axis-title")
		.attr("transform", "translate("+(-(vis.margin.left) + 10)+"," +(vis.margin.top * 3.5)+")rotate(-90)")
        .text("Funding (in millions $ USD)");
        
    vis.svg.append("text")
		.attr("class", "chart-title")
		.attr("transform", "translate("+(10)+"," +(-vis.margin.top/2)+")")
		.text("Funding by Source from 2003 to 2015");



    /*** CREATE STACK & PATH LAYOUT */
    vis.dataCategories = vis.colorScale.domain();

    vis.stack = d3.stack()
        .keys(vis.dataCategories);

    vis.stackedData = vis.stack(vis.data);

	vis.area = d3.area()
        .curve(d3.curveLinear)
        .x(function(d) { return vis.x(d.data.Year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    vis.singleArea = d3.area()
        .curve(d3.curveLinear)
        .x(function(d) { return vis.x(d.data.Year); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d.data[vis.filter]); });

    vis.lineCreator = d3.line()
        .x(function(d) { return vis.x(d.data.Year); })
        .y(function(d) { 
            if(vis.filter){
                return vis.y(d.data[vis.filter]); 
            }else{
                return vis.y(d[1])
            }});


	/*** TOOLTIP */
    vis.tooltip = vis.svg.append("text")
        .attr("class", "areaTooltip")
        .attr("transform", "translate(10,10)")
        .attr("display", "none");

    vis.wrangleData();
}

/*
 * Data wrangling
 */

StackedAreaChart.prototype.wrangleData = function(){
    var vis = this;

    /*** FILTER DATA BASED ON SELECTION */
    if(vis.filter){
        vis.indexOfFilter = vis.dataCategories.findIndex(function(d){return d == vis.filter});
        vis.displayData = [vis.stackedData[vis.indexOfFilter]];
        
    } else {
        vis.displayData = vis.stackedData;
    }

    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

StackedAreaChart.prototype.updateVis = function(){
    var vis = this;
    vis.filter;
    vis.t = d3.transition().duration(400);

	/*** UPDATE SCALES */
	vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d, function(e) {
            if(vis.filter){
                return e.data[vis.filter];
            } else {
				return e[1];
            }
        });
    })]);

    vis.dataCategories = vis.colorScale.domain();

    /*** CREATE STACKED AREA CHARRT */
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData, d => d.key);

    categories.enter()
        .append("path")
        .attr("class", "area")
        .merge(categories)
        .transition(vis.t)
        .style("opacity", .8)
        .style("fill", function(d,i) {
            if(vis.filter){
                return vis.colorScale(vis.dataCategories[vis.indexOfFilter]);
            } else{
                return vis.colorScale(vis.dataCategories[i]);
            }
        })
        .attr("d", function(d) {
            if(vis.filter){
                return vis.singleArea(d);
            } else {
                return vis.area(d);
            }
        });

    d3.selectAll(".area")
        .on("mouseover", function(d){
            vis.tooltip.attr("display", null);
        })
        .on("mousemove", function(d){
            var x0 = vis.x.invert(d3.mouse(this)[0]);
            var xYear = x0.getFullYear();

            i = years.indexOf(xYear.toString());
            value = d[i].data[d.key];

            vis.tooltip.text(d.key + ": " + "$" +tipFormat(value)+"M");
        })
        .on("mouseout", function(d){
            vis.tooltip.attr("display", "none");
        })
        .on("click", function(d, i) {
            if(vis.filter){
                vis.filter = "";
            } else {
                vis.filter = vis.dataCategories[i];
            }

            vis.wrangleData();
        });

    categories.exit().remove();
    
    /*** CREATE LINE PATH TO OUTLINE THE AREAS - MATCHES THE AESTHETIC OF THE MAP. */
    vis.path = vis.svg.selectAll(".line")
        .data(vis.displayData, d => d.key);

    vis.path.enter()
        .append("path")
        .attr("class", "line")
        .merge(vis.path)
        .transition(vis.t)
        .attr("d", vis.lineCreator)
        .attr("fill", "none")
        .attr("stroke", "black");

    vis.path.exit().remove();


	/*** CREATE AXES */ 
	vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
}

StackedAreaChart.prototype.responsivefy = function(){
	var vis = this;
	// MODIFIED FROM https://brendansudol.com/writing/responsive-d3.

	// get container + svg aspect ratio
    var container = d3.select("#" + vis.parentElement),
        svg = d3.select("#svg-stacked"),
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
