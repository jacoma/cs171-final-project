// object for creation of statistics charts

/*
 * Statistics - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

Statistics = function(_parentElement, _data, _title, _fade){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.displayTitle = _title
    this.fade = _fade;

    this.initVis();
}


Statistics.prototype.initVis = function() {

    var vis = this;

    vis.margin = {top:10, right:20, bottom:10, left:0};
    vis.imgPadding = 10;
    vis.statLength = 90;
//    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.width = 250;
    vis.height= 200;
    vis.statHeight = 40;

    vis.statisticSVG = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("class", "statistics")
        .attr("width", vis.width - vis.margin.right - vis.margin.left)
        .attr("height", vis.height - vis.margin.top - vis.margin.bottom )
        .attr("transform", "translate(" + vis.margin.left +", " + vis.margin.top +")");

    vis.yScaleImg = d3.scaleLinear()
        .domain([0,100])
//        .domain([
//            d3.min(vis.displayData, function(d) { return +d.Metric; }),
//            d3.max(vis.displayData, function(d) { return +d.Metric; })])
        .range([8,50]);

    vis.xScaleImg = d3.scaleLinear()
        .domain([0,100])
//        .domain([
//            d3.min(vis.displayData, function(d) { return +d.Metric; }),
//            d3.max(vis.displayData, function(d) { return +d.Metric; })])
        .range([16,100]);

    vis.fadeScale = d3.scaleLinear()
        .domain([0, 100])
        .range([1, 0]);


var title = vis.statisticSVG.append("text")
    .attr("class", "stat_metric")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-align", "middle")
    .text(vis.displayTitle);

    vis.wrangleData();
}

Statistics.prototype.wrangleData = function() {
    var vis = this;
    
    vis.data.sort(function(a, b){ return a.Metric - b.Metric });

    vis.displayData = vis.data;

    vis.updateVis();
}

Statistics.prototype.updateVis = function() {

    var vis = this;

    var row = vis.statisticSVG.selectAll(".statistic")
        .data(vis.displayData)
        .enter()
        .append("g")
        .attr("class", "statistic")
        .attr("height", vis.statHeight)
        .attr("transform", function (d, i) {
//            i++;
//                return "translate(0, " + yScaleImg(d.Metric) + ")"
            return "translate(0, " +(vis.statHeight * i + 30) + ")"
        });
    row.append("svg:image")
        .attr('x', vis.statLength)
//        .attr('y', function(d) {return (d.Metric + vis.imgPadding)/4 } )
        .attr('y', 0)
        .attr('width', function(d) { return vis.xScaleImg(d.Metric) })
        .attr('height', function(d) {return vis.yScaleImg(d.Metric) })
        .style('opacity', function(d) {
            if (vis.fade==true) {
                console.log(vis.fadeScale(d.Metric));
                return vis.fadeScale(d.Metric)
            }
            else{ return 1}
        })
//        .attr('width', function(d) { return d.Metric })
//        .attr('height', function(d) {return d.Metric/2 })
        .attr("xlink:href", "img/trout-sillouette.svg");

    row.append("text")
        .attr('x', 0)
        .attr('y', 10)
//        .attr('y', function(d) {return (d.Metric/2) + vis.imgPadding} )
/*        .attr('y', function (d) {
            if(d.Metric > 20) {
                return d.Metric / 2
            }
            else{
                return statHeight;
            }
        }) */
        .attr("class", "stat_text")
        .text(function(d) { return d.Stat; })

    row.append("text")
        .attr('x', vis.width - vis.margin.right)
//        .attr('y', function(d) {return (d.Metric/2) + vis.imgPadding} )
        .attr('y', 10)
        .attr("class", "stat_metric")
        .attr("text-anchor", "end")
        .text(function(d) { return d.Metric + "%"; });


}

