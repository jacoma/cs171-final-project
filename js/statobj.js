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
    statLength = 100;
    statHeight = 50;
    width = 400;
    height=200;
    vis.statisticSVG = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("width", width)
        .attr("height", height );

    var yScaleImg = d3.scaleLinear()
        .domain([
            d3.min(vis.displayData, function(d) { return +d.Metric; }),
            d3.max(vis.displayData, function(d) { return +d.Metric; })])
        .range([5,50]);

    var xScaleImg = d3.scaleLinear()
        .domain([
            d3.min(vis.displayData, function(d) { return +d.Metric; }),
            d3.max(vis.displayData, function(d) { return +d.Metric; })])
        .range([10,100]);

    var row = vis.statisticSVG.selectAll(".statistic")
        .data(vis.displayData)
        .enter()
        .append("g")
        .attr("class", "statistic")
        .attr("height", statHeight)
        .attr("transform", function (d, i) {
//                return "translate(0, " + yScaleImg(d.Metric) + ")"
            return "translate(0, " + statHeight * i + ")"
        });
    row.append("svg:image")
        .attr('x', statLength)
        .attr('y', 0 )
        .attr('width', function(d) { return xScaleImg(d.Metric) })
        .attr('height', function(d) {return yScaleImg(d.Metric) })
        .attr("xlink:href", "img/trout-sillouette.svg");

    row.append("text")
        .attr('x', 0)
        .attr('y', function (d) {return yScaleImg(d.Metric)/2})
        .attr("class", "stat_text")
        .text(function(d) { return d.Stat; })


}