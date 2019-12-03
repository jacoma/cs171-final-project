// bubble chart object for creation of bubble charts

/*
 * BubbleChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

BubbleChart = function(_parentElement, _data, _country){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
//    this.chartType = _chartType;
    this.country = _country;
    this.initVis();
}

/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BubbleChart.prototype.initVis = function() {
    var vis = this;
    vis.tipFormat = d3.format(",");

    vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
    vis.width = 200 - vis.margin.left - vis.margin.right,
    vis.height = 200 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height );

    vis.bubble_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-5, 100])
        //        .html("testing tool tip")
        .html(function(d){ return d.name + ": " + vis.tipFormat(d.value) });

    vis.svg.call(vis.bubble_tip);

    this.updateVis(vis.displayData, vis.country);
}


// bubble chart reference: https://www.freecodecamp.org/news/a-gentle-introduction-to-d3-how-to-build-a-reusable-bubble-chart-9106dc4f6c46/

BubbleChart.prototype.updateVis = function(data, country) {
    var vis = this;
    //console.log(data);
    //console.log(vis.displayData.length)
    //console.log(country);




    var simulation = d3.forceSimulation(data)
        .force("charge", d3.forceManyBody().strength([-33]))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);

    function ticked(e) {
        vis.node.attr("transform",function(d) {
            return "translate(" + [d.x+(vis.width / 2), d.y+((vis.height) / 2)] +")";
        });
    }

    vis.t = d3.transition()
        .duration(250);

    vis.svg.selectAll(".bubbles").remove();

    vis.node = vis.svg.selectAll(".bubbles")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bubbles")
        .attr("x", function(d){return d.x})
        .attr("y", function(d){return d.y})
        .attr('transform', 'translate(' + [vis.width / 2, vis.height / 2] + ')')
        .style("opacity", function(d) {
            if (country == "TOT" || country == undefined)
                return .8;
            else {
                if (d.key == country) {
                    return .9;
                } else {
                    return .3;
                }
            }
        });

//        vis.node.exit()
//            .transition(vis.t)
//            .remove();

 //   if (vis.chartType == "bubble") {

//        vis.tip = d3.select("body").append("div")
//        .attr("class", "tooltip")
//        .style("opacity", 0);

//        var colorCircles = d3.scaleOrdinal(d3.schemeCategory10);
        var colorCircles = d3.scaleOrdinal(d3.schemeBlues[3]);
        var scaleRadius = d3.scaleLog()
            .domain([
                d3.min(data, function(d) { return +d.value; }),
                d3.max(data, function(d) { return +d.value; })])
            .range([5,20]);

//        console.log(d3.min(vis.displayData, function(d) { return +d.value; }));
//        console.log(d3.max(vis.displayData, function(d) { return +d.value; }));

/*        var scaleRect = d3.scaleLinear()
            .domain([
                d3.min(vis.displayData, function(d) { return +d.value; }),
                d3.max(vis.displayData, function(d) { return +d.value; })])
            .range([5,20]);
*/
        var gradientRadial = vis.node.append("defs").selectAll("radialGradient")
            .data(data)
            .enter()
            .append("radialGradient")
            .attr("id", function(d) { return "gradient-" + d["key"] })
            .attr("cx", "30%")
            .attr("cy", "30%")
            .attr("r", "65%");

        gradientRadial.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", function(d) {return d3.rgb(colorCircles(d["key"])).brighter(1);})
        gradientRadial.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", function(d) {return colorCircles(d["key"]); })
        gradientRadial.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", function(d) {return d3.rgb(colorCircles(d["key"])).darker(1.5);})


        vis.node.append("circle")
            .merge(vis.node)
            .transition().duration(250)
            .attr('r', function (d) {
                //console.log(scaleRadius(d.value));
                return scaleRadius(d.value)
            })
            .attr("class", "bubbles")
            .style("fill", function (d) {
                return colorCircles(d["subs"])
            })
            .style("fill", function (d) {
                return "url(#gradient-" + d["key"] + ")";
            });
            vis.node.on('mouseover', vis.bubble_tip.show)
            .on('mouseout', vis.bubble_tip.hide);


    /*            vis.node.on("mouseover", function(d) {
                vis.tip.transition()
                        .duration(200)
                        .style("opacity", .9);
                vis.tip.html(d["name"]+ ": " + d["value"])
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    vis.tip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
            ; */
            //   }

    /*
    if (vis.chartType=="vessel"){

        vis.xImgScale = d3.scaleLinear()
            .domain([
            d3.min(data, function(d) { return +d.value; }),
            d3.max(data, function(d) { return +d.value; })])
            .range([20,100]);

        vis.yImgScale = d3.scaleLinear()
            .domain([
                d3.min(data, function(d) { return +d.value; }),
                d3.max(data, function(d) { return +d.value; })])
            .range([40,200]);

        vis.node.append("svg:img")
            .attr("width", function(d) { return vis.yImgScale(d.value) })
            .attr("height", function(d) {return vis.xImgScale(d.value) })
            .attr("class", "bubbles")
            .style("fill", "blue")
            .attr("xlink:href", "img/trout-sillouette.svg");

    }
*/
    /*
    node.append("rect")
        .attr("x", 2)
        .attr("y", function(d) { return (scaleRadius(d.Value) - (scaleRadius(d.Value)* 2 )) + 8; })
        .attr("height", function(d) { return scaleRect(d.Value); })
        .attr("width", function(d) { return scaleRect(d.Value); })
        .attr("stroke", "#dddfe2")
        .attr("fill", function(d, i) { return colorCircles(i--) })
        .attr("transform", "rotate(15)");

        node.append("path")
            .attr("y", function(d) { return (scaleRadius(d.Value) - (scaleRadius(d.Value)* 2 )) + 8; })
            .attr("d", function (d){
                //var x = scaleRadius(d.Value) ;
                var x = (scaleRadius(d.Value) - (scaleRadius(d.Value)* 2 )) + scaleRect(d.Value);
                var y = (scaleRadius(d.Value) - (scaleRadius(d.Value)* 2 )) + scaleRect(d.Value);
                var w = scaleRect(d.Value);
                return "M 0 " + x  +
                    " l " + w + " 0" +
                    " l 4 4" +
                    " l 0 8 z"
            })
            .attr("fill", function(d, i) { return colorCircles(i--)})
*/
    vis.node.append("text")
        .merge(vis.node)
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .text(function(d) { return d["key"] })
        .attr("class", "bubble_text")
        .exit().remove();

}

