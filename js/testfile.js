

var margin = {top: 0, right: 20, bottom: 0, left: 0};

var width = 300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svgFishing = d3.select("#radar").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Create scales and Axis
var yScale = d3.scaleLinear()
    .range([200, height-45]);
var fishScale = d3.scaleLinear()
    .range([30, 90]);
var arrayTops=[];

var colWidth = width/5;

queue()
    .defer(d3.csv, "data/Subsidies_SA.csv")
    .defer(d3.csv, "data/FishLandings3.csv")
    .await(loadData);

function loadData(error, subsidies, landings){
var testYear = 2014;

    var topSubsidies = subsidies.forEach(function (d) {
        var tops = {
            country: d.Country,
            value: parseInt(d[testYear])
        };
        arrayTops.push(tops)
    });
    arrayTops = arrayTops.sort(function(a, b) {return d3.descending(a.value, b.value) }).slice(0,5);
    console.log(arrayTops);

    updateFishers();
}

function updateFishers() {
count = 1;
    maxLine = d3.max(arrayTops, function(d) { return + d.value; });
    minLine = d3.min(arrayTops, function(d) { return + d.value; })
    yScale.domain([minLine, maxLine])
    fishScale.domain([minLine, maxLine]);

    g = svgFishing.selectAll("g")
        .data(arrayTops)
        .enter()
        .append("g")
        .attr("class", "fisher");

    g.append("svg:image")
        .attr('x', function(d, i){ return colWidth-50 + (i * colWidth); })
        .attr('y', 0)
        .attr('width', 60)
        .attr('height', 60)
        .attr('translate', "transform(0,0)rotate(90)")
        //        .attr('height', function(d) {return d.Metric/2 })
        .attr("xlink:href", "img/angler-silhuette.jpg");

    //https://www.publicdomainpictures.net/en/view-image.php?image=143103&picture=angler-silhouette
    g.append("line")
        .attr("x1", function(d, i){ return colWidth + (i * colWidth); })
        .attr("y1", 20)
        .attr("x2", function(d, i){ return colWidth + (i * colWidth); })
        .attr("y2", function(d){return yScale(d.value);})
        .attr("class", "line")
        .style("stroke", "black")
        .style("stroke-width", "1px");

    g.append("svg:image")
        .attr("x", 0)
        .attr("y", -20)
//        .attr('y', function(d){return yScale(d.value);})
        .attr('width', function(d) { return fishScale(d.value) })
        .attr('height', function(d) {return fishScale(d.value)/2 })
        .attr("xlink:href", "img/trout-sillouette.svg")
        .attr("transform",function (d, i) { return "translate(" + (colWidth + (i * colWidth) +i*3) + ", " +
            yScale(d.value) +")rotate(-90)" });

    g.append("text")
        .attr('x', -100)
//        .attr('y', function(d){return yScale(d.value)/2;})
        .attr("y", 0)
        .attr("class", "subText")
        .text(function(d){return "Subsidies: " + d.value})
        .attr("transform",function (d, i) { return "translate(" + (colWidth-10 + (i * colWidth)) + ", " +
            yScale(d.value)/2 +")rotate(-90)" });


}