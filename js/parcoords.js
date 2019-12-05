var pcMargin = {top: 10, right: 0, bottom: 10, left: 0};

var pcWidth = 800 - pcMargin.left - pcMargin.right,
    pcHeight = 400 - pcMargin.top - pcMargin.bottom;

itemWidth = 390;

var arrayTops = [];
var fishTitle;
var yearArray = ["2008","2009","2010","2011","2012","2013","2014","2015","2016","2017"];

var pc_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function(d){ 
        console.log("test");
        return d; });

var svgCompare = d3.select("#viz-parcoords").append("svg")
    .attr("width", itemWidth)
    .attr("height", pcHeight+5)
    .append("g")
    .attr("transform", "translate(" + 3 + "," + 18 + ")");
svgCompare.call(pc_tip);


var svgFishing = d3.select("#viz-parcoords").append("svg")
    .attr("width", itemWidth)
    .attr("height", pcHeight)
    .append("g")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");

var compareYear;
var currentYearSubs = [];
var currentYearLands = [];
var dimensions;
formatNum = d3.format(",");

//****************PARALLEL VIS ***************************
//reference: https://www.d3-graph-gallery.com/graph/parallel_basic.html
//reference: https://bl.ocks.org/syntagmatic/05a5b0897a48890133beb59c815bd953
//reference: https://stackoverflow.com/questions/46591962/d3-v4-parallel-coordinate-plot-brush-selection

var parallelCompare = [];
var compareSubsidies, compareLandings, comparePopulation;

queue()
    .defer(d3.csv, "data/Subsidies_SA.csv")
    .defer(d3.csv, "data/landings_SA2.csv")
    .defer(d3.csv, "data/global_population_SA.csv")
    .await(loadCompareData);

function loadCompareData(error, subsidies, landings, population) {
    compareLandings = landings;
    comparePopulation = population;
    compareSubsidies = subsidies;

    //console.log(parallelCompare);

    createParallel()
}

function createParallel() {
    parallelCompare =[];
    currentYearLands=[];
    currentYearSubs=[];
    compareYear = d3.select("#radar-year").property("value");
    // console.log(compareYear);
    compareSubsidies.forEach(function(d){
        temp = {Country: d.Country, Value: d[compareYear]}
        currentYearSubs.push(temp)
    })
    compareLandings.forEach(function(d){
        temp = {Country: d.Country, Value: d[compareYear]}
        currentYearLands.push(temp)
    })
    //console.log(currentYearLands)
    comparePopulation.forEach(function(d){
        var sub = currentYearSubs.filter(function(e) {return e.Country == d.Country_Name});
        var land = currentYearLands.filter(function(e) {return e.Country == d.Country_Name});
        tempCompare = {
            Country: d.Country_Name,
            Subsidies: parseInt(sub[0].Value),
            Population: parseInt(d[compareYear]),
            Landings: parseInt(land[0].Value),
        }
        //console.log(tempCompare)
        parallelCompare.push(tempCompare);
    })
    // console.log(parallelCompare)
//    parallelCompare = parallelCompare.sort(function(a, b){ return b.Subsidies - a.Subsidies })

    // console.log(parallelCompare)
    dimensions = d3.keys(parallelCompare[0])
    var y = {}
    for (i in dimensions) {
        name = dimensions[i]
        //this is creating a scale for each of the dimensions
        if (name == "Country") {
            y[name] = d3.scaleBand()
                .domain(["USA","UK", "Turkey","Thailand", "Sweden", "Spain", "Portugal", "Peru", "Norway", "New Zealand", "Netherlands", "Mexico", "Korea", "Japan", "Italy", "Indonesia", "Iceland", "France", "Denmark", "Chinese Taipei", "China", "Chile", "Canada", "Australia", "Argentina"])
                .range([pcHeight-20, 0])
        } else {
            y[name] = d3.scaleLinear()
                .domain(d3.extent(parallelCompare, function (d) {
                    return +d[name];
                }))
                .range([pcHeight-20, 0])
        }
    }

    //console.log(dimensions);
    x = d3.scalePoint()
        .range([0, itemWidth])
        .padding(1)
        .domain(dimensions);


    // Draw the axis:
    var axes = svgCompare.selectAll(".compareAxis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "compareAxis")
        .attr("transform", function (d) {
            return "translate(" + x(d) + ")";
        })
        .each(function (d) {
            if (d == "Country") {
                d3.select(this).call(d3.axisLeft().scale(y[d]));
            } else {
                d3.select(this).call(d3.axisRight().scale(y[d]));
            }
        })
        axes.append("text")
        .style("text-anchor", "middle")
        .attr("y", -10)
        .text(function (d) {
            return d;
        })
            .attr("class", "pcLegend")
        .style("fill", "#0056b3")
        .style("font-weight", "bold");



    function path(d) {
//        console.log(d)
        return d3.line()(dimensions.map(function (p) {
//            console.log(p);
//            console.log(x(p) +" | " + d[p]);
            var temp = d[p];
//            console.log(y[p](temp));
            return [x(p), y[p](temp)]
        }))
    }

    svgCompare.selectAll(".comparePath").remove();
    var cPath = svgCompare.selectAll(".comparePath")
        .data(parallelCompare)
        .enter()
        .append("path")
        //.transition()
        //.duration(500)
        .attr("d", path)
        .attr("class", "comparePath")
        .on("mouseover", function(d) {
            pc_tip.show;
            d3.select(this).classed("comparePath", false);
            d3.select(this).classed("highlightPath", true);
        })
        .on("mouseout", function(d) {
            pc_tip.hide;
            d3.select(this).classed("comparePath", true);
            d3.select(this).classed("highlightPath", false);
        })
        .on("click", function(d) {
            clearBrush();
            createFishing(d.Country);
            //console.log(d3.selectAll(".brush").call(pcBrush))
        });


    svgCompare.selectAll(".compareAxis").append("g")
        .attr("class", "brush")
        .each(function (d) {
            //console.log(d3.select(this));
            d3.select(this).call(d.brush = d3.brushY()
            //    .call(d.brush = d3.brushY()
                .extent([[-10, 0], [10, pcHeight]])
                //.on("start", brushstart)
                .on("brush", brush)
                .on("end", brush)
            )
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    function brush() {
        //render.invalidate();
        var actives = [];
        svgCompare.selectAll(".compareAxis .brush")
            .filter(function (d) {
                //console.log(d);
                //console.log(d3.brushSelection(this))
//                if(d3.brushSelection(this)) {
//                    console.log(y[d](d3.brushSelection(this)[0]))
//                tempFilter =
//                }
                return d3.brushSelection(this);
            })
            .each(function (d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });
//        console.log(actives);

/*        var selected = parallelCompare.filter(function (d) {
            if (actives.every(function (active) {
                //console.log(active.extent)
                var dim = active.dimension;
//                console.log(dim.type.within(d[dim.key], active.extent, dim));
            })) {
                return true;
            }
        });

 */
        g.style('display', function(d) {
            return actives.every(function(active) {
                const dim = active.dimension;
                    //console.log(y[dim](d[dim]))
                    return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
            }) ? null : 'none';
        });
    }
createFishing();
}


function createFishing(country) {
//****************FISHING VIS ***************************
arrayTops=[];
if (!country) {
//    console.log(parallelCompare);

    arrayTops = parallelCompare.sort(function (a, b) {
        return (b.Landings - a.Landings)
    })//.slice(0, 5);
//    console.log(arrayTops);
    fishTitle = "Subsidies and Landings in " + compareYear;
}
else{
//    console.log(country);
    var sub = compareSubsidies.filter(function(d){ return d.Country == country})
    var land = compareLandings.filter(function(d){ return d.Country == country})

//    console.log(land)
    yearArray.forEach(function(d){
//        console.log(sub[0][d]);
        tempCompare = {
            Year: d,
            Subsidies: parseInt(sub[0][d]),
            Landings: parseInt(land[0][d]),
        }
        arrayTops.push(tempCompare);
    });
    fishTitle = "Landings for " + country;

//    console.log(arrayTops);
}
    updateFishers();
}

function clearBrush(){
    d3.selectAll(".compareAxis .brush")
        .each(function (d) {
            //console.log(d3.select(this));
            d3.select(this).call(d.brush = d3.brushY().move, null)
        })
    createFishing();
}


function updateFishers() {
// Create scales and axis for fishing
    var yScale = d3.scaleLinear()
        .range([60, pcHeight - 90]);
    var fishScale = d3.scaleLinear()
        .range([30, 90]);

    var colWidth = (itemWidth-20) / 5;

    //console.log(arrayTops);
    count=1;
    maxLine = d3.max(arrayTops, function(d) { return + d.Subsidies; });
    minLine = d3.min(arrayTops, function(d) { return + d.Subsidies; })
    yScale.domain([minLine, maxLine])

    maxFish = d3.max(arrayTops, function(d) { return + d.Landings; });
    minFish = d3.min(arrayTops, function(d) { return + d.Landings; })
    fishScale.domain([minFish, maxFish]);

    svgFishing.selectAll("g").remove();
    svgFishing.selectAll(".pcFishTitle").remove();

    // for panning
    svgFishing.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", pcWidth)
        .attr("height", pcHeight-30)
        .style("fill", "white")
        .style("cursor", "grab");


    //t = svgFishing.append("g").append("text")
    t = svgFishing.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .attr("text-anchor", "start")
        .text(function(d) {return fishTitle })
        .attr("class", "pcFishTitle");

    // console.log(arrayTops);
    g = svgFishing.selectAll("g")
        .data(arrayTops)
        .enter()
        .append("g")
        .attr("class", "fisher")
        .attr("transform", "translate(0,20)");


    g.append("svg:image")
        // -50 nudges the angler over to the line
        .attr('x', function(d, i){ return colWidth-50 + (i * colWidth); })
        .attr('y', 0)
        .attr('width', 60)
        .attr('height', 60)
        .attr('translate', "transform(0,0)rotate(90)")
        //        .attr('height', function(d) {return d.Metric/2 })
        .attr("xlink:href", "img/angler-silhuette.jpg")


    g.append("line")
        .attr("x1", function(d, i){ return colWidth + (i * colWidth); })
        .attr("y1", 20)
        .attr("x2", function(d, i){ return colWidth + (i * colWidth); })
        .attr("y2", 20)
        .transition("fish").duration(1250)
        .attr("y2", function(d){return yScale(d.Subsidies);})
        .attr("class", "fishLine")
        .style("stroke", "black")
        .style("stroke-width", "1.5px");

/*
    g.append("defs").selectAll("fishImg")
        .data(data)
        .enter()
        .append("fishImg")
        .attr("id", function(d) { return "land-" + d["Country"] })
        .attr("xlink:href", "img/skeleton.jpg")
        .attr('width', function(d) { return fishScale(d.Landings) })
        .attr('height', function(d) {return fishScale(d.Landings) });



    g.append("rect")
        .attr("x", function(d, i){ return (colWidth + (i * colWidth)); })
        .attr("y", function(d){return yScale(d.Subsidies);})
        //        .attr('y', function(d){return yScale(d.value);})
        .attr('width', function(d) { return fishScale(d.Landings)/2 })
        .attr('height', function(d) {return fishScale(d.Landings) })
        .attr("class", "pcFishImg")
//        .style("fill","url(img/angler-silhuette.jpg)")
        .attr("xlink:href", "img/trout-sillouette.svg")
        //        .transition().delay(1000)
//        .transition("fish").duration(50)

*/

    g.append("svg:image")
        .attr("x", 0)
        .attr("y", -20)
//        .attr('y', function(d){return yScale(d.value);})
        .attr('width', function(d) { return fishScale(d.Landings) })
        .attr('height', function(d) {return fishScale(d.Landings) })
        .attr("class", "pcFishImg")
        .attr("xlink:href", "img/trout-sillouette.svg")
//        .transition().delay(1000)
        .transition("fish").duration(50)
        .attr("transform",function (d, i) {
            tempY = yScale(d.Subsidies)+fishScale(d.Landings);
            tempX = (colWidth + (i * colWidth) +(i*1)-(fishScale(d.Landings)/8));
//            tempX = (colWidth + (i * colWidth) +(i*1));
//            tempX = (colWidth + (i * colWidth) + fishScale(d.Landings));
            //console.log(tempX);
            return "translate(" + tempX + ", " +
            tempY +")rotate(-90)"
        });

    g.append("text")
        .attr('x', -340)
        .attr("y", 0)
        .attr("class", "pcLegend")
        .text(function(d){
            if (d.Subsidies =="0") {
                vText = "No Data";
            }
            else{
                vText = formatNum(d.Subsidies)
            }
            return "Subsidies: " + vText;
        })
        .attr("text-anchor", "start")
        .style("font-weight", "bold")
        .attr("transform",function (d, i) { return "translate(" + (colWidth-10 + (i * colWidth)) + ", " +
            30 +")rotate(-90)" });

    g.append("text")
        .attr('x', -340)
        .attr("y", 25)
        .attr("class", "pcLegend")
        .text(function(d){
            if (d.Landings =="0") {
                vText = "No Data";
            }
            else{
                vText = formatNum(d.Landings)
            }
            return "Landings: " + vText;
        })
        .attr("text-anchor", "start")
        .style("font-weight", "bold")
        .attr("transform",function (d, i) { return "translate(" + (colWidth-10 + (i * colWidth)) + ", " +
            30 +")rotate(-90)" });

    g.append("text")
        .attr('x', 10)
        .attr("y", 15)
        .attr("class", "pcLegend")
        .style("fill", "#0056b3")
        .text(function(d){
            if (d.Country) {
                return d.Country;
            }else{
                return d.Year;
            }
        })
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .attr("transform",function (d, i) { return "translate(" + (colWidth-10 + (i * colWidth)) + ", " +
            0 +")" });


    var zoomed = function() {
        g.attr("transform", d3.event.transform);
    }

    svgFishing.call(d3.zoom()
        .scaleExtent([1 / 2, 12])
        .on("zoom", zoomed));

}

