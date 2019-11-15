// bubble chart object for creation of bubble charts

/*
 * BubbleChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

BubbleChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
}

/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BubbleChart.prototype.initVis = function() {
    var vis = this;
    vis.filterYear = "2001";

    vis.margin = { top: 40, right: 20, bottom: 60, left: 60 };
    vis.nodePadding = 2.5
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;
    
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("class", "bubble");

    vis.node = vis.svg.selectAll(".bubbles");

    /*** UPDATE BUBBLES BASED ON YEAR SELECTION */
    d3.select("#bubble-year").on("change", function(d){

        var selectedOption = d3.select(this).property("value");

        vis.filterYear = selectedOption;

        vis.wrangleData();
    });

    /*** INITIALIZE FORCE LAYOUT */
    vis.simulation = d3.forceSimulation()
        .force("forceX", d3.forceX().strength(.1).x(vis.width * .5))
        .force("forceY", d3.forceY().strength(.1).y(vis.height * .5))
        .force("center", d3.forceCenter().x(vis.width * .5).y(vis.height * .5))
        .force("charge", d3.forceManyBody().strength(-15));

    /*** CREATE SCALES */
    vis.colorCircles = d3.scaleOrdinal(d3.schemeBlues[9]);
    
    vis.scaleRadius = d3.scaleLinear()
        .range([10,50]);

    vis.scaleRect = d3.scaleLinear()
        .range([5,20]);
    
    vis.wrangleData();
}

BubbleChart.prototype.wrangleData = function() {
        var vis = this;

        var tempArray = []; 
        vis.data.forEach(function(d) {
            var temp = {Name: d.Country_Name,
            Value: parseInt(d[vis.filterYear]) };
            tempArray.push(temp)
        })
    
        vis.displayData = tempArray.sort(function(a,b) {return b.Value - a.Value});

        vis.updateVis();

}


// bubble chart reference: https://www.freecodecamp.org/news/a-gentle-introduction-to-d3-how-to-build-a-reusable-bubble-chart-9106dc4f6c46/

BubbleChart.prototype.updateVis = function() {
    var vis = this;
    // console.log(vis.displayData);
    // console.log(vis.displayData.length);

    vis.scaleRadius.domain([
        d3.min(vis.displayData, function(d) { return +d.Value; }),
        d3.max(vis.displayData, function(d) { return +d.Value; })
    ]);

    vis.scaleRect = d3.scaleLinear()
        .domain([
            d3.min(vis.displayData, function(d) { return +d.Value; }),
            d3.max(vis.displayData, function(d) { return +d.Value; })
        ]);


    // vis.simulation = d3.forceSimulation(vis.displayData)
    //     .force("charge", d3.forceManyBody().strength([-35]))
    //     .force("x", d3.forceX())
    //     .force("y", d3.forceY())
    //     .on("tick", ticked);

    // function ticked(e) {
    //     vis.node.attr("transform",function(d) {
    //         return "translate(" + [d.x+(vis.width / 2), d.y+((vis.height) / 2)] +")";
    //     });
    // }

    
    d3.selectAll(".bubbles").exit().remove();

    vis.simulation
        .nodes(vis.displayData)
        .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return vis.scaleRadius(d.Value) + vis.nodePadding; }).iterations(1))
        .on("tick", function(d){
            vis.node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
        });

    vis.node = vis.svg.selectAll(".bubbles")
        .data(vis.displayData, d => d.Name)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill-opacity", 0.3)
        .style("stroke-width", 2)
        .attr("r", d => vis.scaleRadius(d.Value))
        .style("fill", d => vis.colorCircles(d.Name))
        .attr("stroke", d => vis.colorCircles(d.Name));

/*
    node.append("rect")
        .attr("x", 2)
        .attr("y", function(d) { return (scaleRadius(d.Value) - (scaleRadius(d.Value)* 2 )) + 8; })
        .attr("height", function(d) { return scaleRect(d.Value); })
        .attr("width", function(d) { return scaleRect(d.Value); })
        .attr("stroke", "#dddfe2")
        .attr("fill", function(d, i) { return colorCircles(i--) })
        .attr("transform", "rotate(15)");
*/
    // node.append("path")
    //     .attr("y", function(d) { return (vis.scaleRadius(d.Value) - (vis.scaleRadius(d.Value)* 2 )) + 8; })
    //     .attr("d", function (d){
    //         //var x = scaleRadius(d.Value) ;
    //         var x = (vis.scaleRadius(d.Value) - (vis.scaleRadius(d.Value)* 2 )) + vis.scaleRect(d.Value);
    //         var y = (vis.scaleRadius(d.Value) - (vis.scaleRadius(d.Value)* 2 )) + vis.scaleRect(d.Value);
    //         var w = vis.scaleRect(d.Value);
    //         return "M 0 " + x  +
    //             " l " + w + " 0" +
    //             " l 4 4" +
    //             " l 0 8 z"
    //     })
    //     .attr("fill", function(d, i) { return vis.colorCircles(i--)})

    vis.node.append("text")
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.Name })
        .attr("class", "bubble_text");


}

