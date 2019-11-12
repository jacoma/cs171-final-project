// object for creation of statistics charts

/*
 * Statistics - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

Statistics = function(_parentElement, _data, _title){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.displayTitle = _title

    this.initVis();
}


Statistics.prototype.initVis = function() {

    var vis = this;

    imgPadding =10;
    statLength = 120;
    statHeight = 20;
    width = 300;
    height= 200;
    margin = {top:0, right:0, bottom:0, left:0};

    vis.statisticSVG = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("width",width - margin.right - margin.left)
        .attr("height",height - margin.top - margin.bottom )
        .attr("transform", "translate(" + margin.left +", " + margin.top +")");

/*    var yScaleImg = d3.scaleLinear()
        .domain([
            d3.min(vis.displayData, function(d) { return +d.Metric; }),
            d3.max(vis.displayData, function(d) { return +d.Metric; })])
        .range([5,50]);

    var xScaleImg = d3.scaleLinear()
        .domain([
            d3.min(vis.displayData, function(d) { return +d.Metric; }),
            d3.max(vis.displayData, function(d) { return +d.Metric; })])
        .range([10,100]);
*/
var title = vis.statisticSVG.append("text")
    .attr("class", "stat_title")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-align", "middle")
    .text(vis.displayTitle);

    var row = vis.statisticSVG.selectAll(".statistic")
        .data(vis.displayData)
        .enter()
        .append("g")
        .attr("class", "statistic")
        .attr("height", statHeight)
        .attr("transform", function (d, i) {
            i++;
//                return "translate(0, " + yScaleImg(d.Metric) + ")"
            return "translate(0, " + statHeight * i + ")"
        });
    row.append("svg:image")
        .attr('x', statLength)
        .attr('y', function(d) {return (d.Metric + imgPadding)/4 } )
//        .attr('width', function(d) { return xScaleImg(d.Metric) })
//        .attr('height', function(d) {return yScaleImg(d.Metric) })
        .attr('width', function(d) { return d.Metric })
        .attr('height', function(d) {return d.Metric/2 })
        .attr("xlink:href", "img/trout-sillouette.svg");

    row.append("text")
        .attr('x', 0)
        .attr('y', function(d) {return (d.Metric/2) + imgPadding} )
/*        .attr('y', function (d) {
            if(d.Metric > 20) {
                return d.Metric / 2
            }
            else{
                return statHeight;
            }
        }) */
        .attr("class", "stat_text")
        .text(function(d) { return d.Stat + ": " + d.Metric + "%"; })
}