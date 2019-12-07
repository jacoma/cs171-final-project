/*
 * StackedAreaChart
 * @param _parentElement 
 * @param _data	
 */

StackedAreaChart = function(_parentElement, _data, _eventHandler){

	this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.displayData = [];
    this.eventHandler = _eventHandler;

    // DEBUG RAW DATA
    // console.log(this.data);

    this.initVis();
}



/*
 * Initialize visualization
 */

StackedAreaChart.prototype.initVis = function(){
    var vis = this;
    vis.speciesFilter = "";
    vis.countryFilter = "";

	vis.margin = { top: 75, right: 20, bottom: 50, left: 60 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

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
    vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(fishSpecies);

    vis.x = d3.scaleTime()
        .domain(d3.extent(areaYears, d=>parseDate(d)))
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickFormat(d3.format("0.2s"));

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("text")
		.attr("class", "axis-title")
		.attr("transform", "translate("+(-(vis.margin.left) + 15)+"," +(vis.margin.top*3)+")rotate(-90)")
        .text("Fish Landings (Tonnes in millions)");
        
    vis.svg.append("text")
		.attr("class", "chart-title")
		.attr("transform", "translate("+(10)+"," +(-50)+")")
		.text("Just under 90% of fish landings are consumed by humans.");

    /*** CREATE AREA & LINE GENERATORS */
	vis.area = d3.area()
        .curve(d3.curveLinear)
        .x(function(d) { return vis.x(d.data.Year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    vis.singleArea = d3.area()
        .curve(d3.curveLinear)
        .x(function(d) { return vis.x(d.data.Year); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d.data[vis.speciesFilter]); });


	/*** TOOLTIP */
    vis.tooltip = vis.svg.append("text")
         .attr("class", "areaTooltip")
         .attr("display", "none")
         .attr("transform", `translate(10, -10)`);

    /*** LEGEND */
    var legendRectSize = 20
    var legendWidth = $("#start-story").width() - vis.margin.left - vis.margin.right;
    d3.select("#landings-legend")
        .append("svg")
        .attr("id", "legend-svg")
        .attr("width", legendWidth)
        .attr("height", legendRectSize*2)
    .selectAll(".legend-rect")
        .data(fishSpecies)
        .enter()
        .append("rect")
            .attr("class", "legend-rect")
            .attr("x", function(d,i){ return 5 + i*(legendWidth/fishSpecies.length)})
            .attr("y", 10) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .style("fill", function(d){ return vis.colorScale(d)});
      
          // Add one dot in the legend for each name.
    d3.select("#legend-svg").selectAll(".legend-labels")
        .data(fishSpecies)
        .enter()
        .append("text")
        .attr("class", "legend-labels")
        .attr("x", function(d,i){ return (legendRectSize + 10) + i*(legendWidth/fishSpecies.length)})
        .attr("y", (15 + legendRectSize/2)) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return vis.colorScale(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left");

    d3.selectAll(".legend-rect,.legend-labels").on("click", function(d) {
            // 3. Trigger the event 'selectionChanged' of our event handler
            $(vis.eventHandler).trigger("selectionChanged", [d, ""]);
        })
        .on("mouseover", function(d){
            fish = fishSpecies.indexOf(d);
            d3.selectAll(".area").style("opacity", .2);

            d3.select("#area-"+fish).style("opacity", 1);
        })
        .on("mouseout", function(d){
            d3.selectAll(".area").style("opacity", 1);
        })

    vis.wrangleData();
}

/*
 * Data wrangling
 */

StackedAreaChart.prototype.wrangleData = function(){
    var vis = this;

    /*** CREATE STACKED AREA CHART DATA */
    var yearlyData = [];

    for(y = 0; y < areaYears.length; y++){
        yearObj = {};
        yearObj["Year"] = parseDate(areaYears[y]);

        for(s = 0; s < fishSpecies.length; s++){
            yearObj[fishSpecies[s]] = 0;

            vis.filteredData.forEach(function(d){
                if(d.YEAR === areaYears[y] && d.Species === fishSpecies[s]){ 
                    yearObj[fishSpecies[s]] += +d["Sum of Value"];
                }
            })
        }
        yearlyData.push(yearObj);
    }

    // console.log(yearlyData);

    /*** CREATE STACK & PATH LAYOUT */
    vis.fishKeys = d3.keys(yearlyData[0]).filter(function(d){ return d != "Year"; });

    vis.stack = d3.stack()
        .keys(vis.fishKeys);

    vis.stackedData = vis.stack(yearlyData);

    /*** FILTER DATA BASED ON SELECTION */
    if(vis.speciesFilter){
        vis.indexOfFilter = vis.fishKeys.findIndex(function(d){return d == vis.speciesFilter});
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
    vis.t = d3.transition().duration(400);

	/*** UPDATE SCALES */
	vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d, function(e) {
            if(vis.speciesFilter){
                return e.data[vis.speciesFilter];
            } else {
				return e[1];
            }
        });
    })]);

    /*** CREATE STACKED AREA CHARRT */
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData, d => d.key);

    categories.enter()
        .append("path")
        .attr("class", "area")
        .attr("id", function(d, i){return "area-"+i})
        .merge(categories)
        .transition(vis.t)
        .style("opacity", .8)
        .style("fill", function(d,i) {
            if(vis.speciesFilter){
                return vis.colorScale(vis.fishKeys[vis.indexOfFilter]);
            } else{
                return vis.colorScale(vis.fishKeys[i]);
            }
        })
        .attr("d", function(d) {
            if(vis.speciesFilter){
                return vis.singleArea(d);
            } else {
                return vis.area(d);
            }
        });

    d3.selectAll(".area")
        .on("click", function(d, i) {

            // 3. Trigger the event 'selectionChanged' of our event handler
            $(vis.eventHandler).trigger("selectionChanged", [vis.fishKeys[i], ""]);
        })
        .on("mouseover", function(d){
            vis.tooltip.attr("display", null);
    
            d3.selectAll(".area").style("opacity", .2);
    
            d3.select(this).style("opacity", 1);
        })
        .on("mousemove", function(d){
            var x0 = vis.x.invert(d3.mouse(this)[0]);
            var xYear = x0.getFullYear();

            i = areaYears.indexOf(xYear.toString());
            value = d[i].data[d.key];

            vis.tooltip.text(d.key + ": " + d3.format("0.3s")(value));
    })
        .on("mouseout", function(d){
            d3.selectAll(".area").style("opacity", 1);
            vis.tooltip.attr("display", "none");
        });

    categories.exit().remove();

	/*** CREATE AXES */ 
	vis.svg.select(".x-axis").call(vis.xAxis).select(".domain").remove();
    vis.svg.select(".y-axis").call(vis.yAxis).select(".domain").remove();
      
      
      
   
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

StackedAreaChart.prototype.onSelectionChange = function(speciesFilter, countryFilter){
    var vis = this;

    if(vis.speciesFilter){
        vis.speciesFilter = "";
    } else {
        vis.speciesFilter = speciesFilter;
    }

    if(countryFilter){
        if(vis.countryFilter === countryFilter){
            vis.countryFilter = "";
            vis.filteredData = vis.data;
        } else {
            vis.countryFilter = countryFilter;

            vis.filteredData = vis.data.filter(function(d){return d.Country === countryFilter});
        }
    }

    // console.log(vis.filteredData);

    vis.wrangleData();
}


