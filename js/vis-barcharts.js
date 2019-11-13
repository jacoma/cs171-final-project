
/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

BarChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

BarChart.prototype.initVis = function(){
    var vis = this;

	vis.margin = { top: 40, right: 20, bottom: 60, left: 80 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.filter = "";

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("id", "svg-countryBars")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    /*** RESPONSIVE SVG */
    vis.responsivefy();
    
    // Scales and axes
    vis.y = d3.scaleBand()
        .rangeRound([vis.height, 0])
        .paddingInner(0.05);

    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.xAxis = d3.axisTop()
        .scale(vis.x)
        .tickFormat(d3.format("0.2s"));

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickSize(0);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + 0 + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0," + 0 + ")");;

    // Axis title
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Text");


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
	var vis = this;

    var countPerCountry = d3.nest()
        .key(d => d.Country)
        .rollup(function(v) { return d3.sum(v, function(d) { return d["Sum of Value"]; }); })
        .entries(vis.filteredData);

    sorted = countPerCountry.sort(function(a,b){ 
        return a.value-b.value;
    });

    vis.displayData = sorted;

	// Update the visualization
	vis.updateVis();
}


/*
 * The drawing function
 */

BarChart.prototype.updateVis = function(){
    var vis = this;
    
    vis.t = d3.transition().duration(500);

    // Update domains
    vis.x.domain([0, d3.max(vis.displayData, d=>d.value)]);
    vis.y.domain(vis.displayData.map(d=>d.key));

    var bars = vis.svg.selectAll(".bar")
        .data(vis.displayData, d => d.key);

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .transition(vis.t)
        .attr("width", function(d){
            return vis.x(d.value);
        })
        .attr("height", vis.y.bandwidth())
        .attr("x", 0)
        .attr("y", function(d){
            return vis.y(d.key);
        })

    bars.exit().remove();

    // DRAW AXIS
    vis.svg.select(".y-axis")
        .call(vis.yAxis)
        .select(".domain")
        .remove()
        .transition(vis.t);

    vis.svg.select(".x-axis")
        .transition(vis.t)
        .call(vis.xAxis);
}

BarChart.prototype.responsivefy = function(){
	var vis = this;
	// MODIFIED FROM https://brendansudol.com/writing/responsive-d3.

	// get container + svg aspect ratio
    var container = d3.select("#" + vis.parentElement),
        svg = d3.select("#svg-countryBars"),
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


BarChart.prototype.onSelectionChange = function(filter){
    var vis = this;

    if(vis.filter === filter){
        vis.filter = ""
        vis.filteredData = vis.data;

    } else {
        vis.filter = filter;

        vis.filteredData = vis.data.filter(function(d){
            return d.Species === filter;
        });
    }

	vis.wrangleData();
}
