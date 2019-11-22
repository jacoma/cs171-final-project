
/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

BarChart = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.displayData = [];
    this.eventHandler = _eventHandler;

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

BarChart.prototype.initVis = function(){
    var vis = this;

	vis.margin = { top: 80, right: 20, bottom: 60, left: 80 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.speciesFilter = "";
    vis.countryFilter = "";

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("id", "svg-countryBars")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    /*** RESPONSIVE SVG */
    vis.responsivefy();
    
    /*** SCALES & AXES */
    vis.y = d3.scaleBand()
        .range([vis.height, 0])
        .paddingInner(0.075);

    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.xAxis = d3.axisTop()
        .scale(vis.x)
        .tickFormat(d3.format("0.2s"));

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickSize(0);

    vis.svg.append("g")
        .attr("class", "x-axis axis");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0," + 0 + ")");;

    // Axis title
    vis.svg.append("text")
		.attr("class", "chart-title")
		.attr("transform", "translate("+(10)+"," +(-50)+")")
        .text("Peru, U.S., Japan largest contributors to fishing volume");
        
    vis.svg.append("text")
		.attr("class", "axis-title")
		.attr("transform", "translate(" + (vis.width - 200) +"," +(-20)+")")
		.text("Fish Landings (Tonnes in millions)");


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

    var bars = vis.svg.selectAll(".bar-country")
        .data(vis.displayData, d => d.key);

    bars.enter().append("rect")
        .attr("class", "bar-country")
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
        .attr("fill", function(d, i){
            if(vis.speciesFilter){
                return stackedArea.colorScale(vis.speciesFilter)
            } else {
                    return "black";
                }
            })
        .attr("opacity", 0.7);

    bars.exit().remove();

    d3.selectAll(".bar-country").on("mouseover", function(d, i){
            d3.select(this).attr("opacity", 1);
        })
        .on("mouseleave", function(d, i){
            d3.select(this).attr("opacity", 0.7);
        })
        .on("click", function(d,i){
            clickedBar = d.key;
            var normalBars = d3.selectAll(".bar-country");

            if(vis.countryFilter===clickedBar){
                normalBars.attr("fill", "grey");
            } else {
                normalBars.attr("fill", d => d.key === clickedBar ? "black":"grey")
            }

            $(vis.eventHandler).trigger("selectionChanged", ["", d.key]);
        
        })

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


BarChart.prototype.onSelectionChange = function(speciesFilter, countryFilter){
    var vis = this;

    if(vis.speciesFilter === speciesFilter){
        vis.speciesFilter = ""
        vis.filteredData = vis.data;

    } else {
        vis.speciesFilter = speciesFilter;

        vis.filteredData = vis.data.filter(function(d){
            return d.Species === speciesFilter;
        });
    }

    if(countryFilter){
        if(vis.countryFilter){
            vis.countryFilter = "";
        }
        else{
            vis.countryFilter = countryFilter
        }
    } else {
        vis.wrangleData();
    }
            
}
