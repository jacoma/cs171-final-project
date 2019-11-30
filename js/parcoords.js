

var pcMargin = {top: 10, right: 0, bottom: 40, left: 10};


var pcWidth = 800 - pcMargin.left - pcMargin.right,
    pcHeight = 400 - pcMargin.top - pcMargin.bottom;

itemWidth = 390;

var arrayTops = [];
var fishTitle;

var svgCompare = d3.select("#viz-parcoords").append("svg")
    .attr("width", itemWidth)
    .attr("height", pcHeight)
    .append("g")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");


var svgFishing = d3.select("#viz-parcoords").append("svg")
    .attr("width", itemWidth)
    .attr("height", pcHeight)
    .append("g")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");

//****************PARALLEL VIS ***************************

var parallelCompare = [];
var compareSubsidies, compareLandings, comparePopulation;

queue()
    .defer(d3.csv, "data/Subsidies_SA.csv")
    .defer(d3.csv, "data/landings_SA2.csv")
    .defer(d3.csv, "data/global_population_SA.csv")
    .await(loadCompareData);

function loadCompareData(error, subsidies, landings, population) {
    var compareYear = "2014";
    var currentYearSubs = [];
    var currentYearLands = [];
    compareLandings = landings;
    comparePopulation = population;
    compareSubsidies = subsidies;

    compareSubsidies.forEach(function(d){
        temp = {Country: d.Country, Value: d[compareYear]}
        currentYearSubs.push(temp)
    })

    compareLandings.forEach(function(d){
        temp = {Country: d.Country, Value: d[compareYear]}
        currentYearLands.push(temp)
    })

    comparePopulation.forEach(function(d){
        var sub = currentYearSubs.filter(function(e) {return e.Country == d.Country_Name});
        var land = currentYearLands.filter(function(e) {return e.Country == d.Country_Name});
        tempCompare = {
            Country: d.Country_Name,
            Subsidies: parseInt(sub[0].Value),
            Population: parseInt(d[compareYear]),
            Landings: parseInt(land[0].Value),
        }
        parallelCompare.push(tempCompare);
    })
    parallelCompare = parallelCompare.sort(function(a, b){ return b.Subsidies - a.Subsidies })
    //console.log(parallelCompare);

    createParalell()
}

function createParalell() {

    //take out country since its the label
    dimensions = d3.keys(parallelCompare[0])//.filter(function(d) { return d != "Country" });
    var y = {}
    for (i in dimensions) {
        name = dimensions[i]
        //this is creating a sale for each of the dimensions
        if (name == "Country") {
            y[name] = d3.scaleBand()
                .domain(["Argentina", "Australia", "Canada", "Chile", "China", "Chinese Taipei", "Denmark", "France", "Iceland", "Indonesia", "Italy", "Japan", "Korea", "Mexico", "Netherlands", "New Zealand", "Norway", "Peru", "Portugal", "Spain", "Sweden", "Thailand", "Turkey", "UK", "USA"])
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

    svgCompare.selectAll("comparePath")
        .data(parallelCompare)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "comparePath")
        .on("mouseover", function() {
            d3.select(this).classed("comparePath", false)
            d3.select(this).classed("highlightPath", true)
        } )
        .on("mouseout", function() {
            d3.select(this).classed("comparePath", true)
            d3.select(this).classed("highlightPath", false)
        })
        .on("click", function(d){ createFishing(d.Country)});

    // Draw the axis:
    var axes = svgCompare.selectAll(".compareAxis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "compareAxis")
        //.style("stroke", "#919190")
        //        .style("fill", "#919190")
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
        .style("fill", "#919190")

    svgCompare.selectAll(".compareAxis").append("g")
        .attr("class", "brush")
        .each(function (d) {
            d3.select(this).call(d.brush = d3.brushY()
                .extent([[-10, 0], [10, pcHeight]])
                .on("start", brushstart)
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
                console.log(d);
                return d3.brushSelection(this);
            })
            .each(function (d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });
        console.log(actives);
        var selected = parallelCompare.filter(function (d) {
            if (actives.every(function (active) {
//                var dim = active.dimension;
//                return dim.type.within(d[dim.key], active.extent, dim);
            })) {
                return true;
            }
        });
    }
createFishing();
}



function createFishing(country) {
//****************FISHING VIS ***************************

    var testYear = 2014;
    //console.log(country);
if (!country) {
//    console.log(parallelCompare);

    arrayTops = parallelCompare.sort(function (a, b) {
        return d3.descending(a.Landings, b.Landings)
    }).slice(0, 5);
    //console.log(arrayTops);
    fishTitle = "Top 5 Landings in " + testYear;
}
else{
    console.log(country);

}
    updateFishers();
}

function updateFishers() {
// Create scales and axis for fishing
    var yScale = d3.scaleLinear()
        .range([200, pcHeight - 45]);
    var fishScale = d3.scaleLinear()
        .range([30, 90]);

    var colWidth = itemWidth / 5;


    count = 1;
    maxLine = d3.max(arrayTops, function(d) { return + d.Subsidies; });
    minLine = d3.min(arrayTops, function(d) { return + d.Subsidies; })
    yScale.domain([minLine, maxLine])

    maxFish = d3.max(arrayTops, function(d) { return + d.Landings; });
    minFish = d3.min(arrayTops, function(d) { return + d.Landings; })
    fishScale.domain([minFish, maxFish]);

    t = svgFishing.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .text(function(d) {return fishTitle })
        .attr("class", "pcFishTitle");

    g = svgFishing.selectAll("g")
        .data(arrayTops)
        .enter()
        .append("g")
        .attr("class", "fisher")
        .attr("transform", "translate(0,20)");

    g.append("svg:image")
        .attr('x', function(d, i){ return colWidth-50 + (i * colWidth); })
        .attr('y', 0)
        .attr('width', 60)
        .attr('height', 60)
        .attr('translate', "transform(0,0)rotate(90)")
        //        .attr('height', function(d) {return d.Metric/2 })
        .attr("xlink:href", "img/angler-silhuette.jpg");

    g.append("line")
        .attr("x1", function(d, i){ return colWidth + (i * colWidth); })
        .attr("y1", 20)
        .attr("x2", function(d, i){ return colWidth + (i * colWidth); })
        .attr("y2", function(d){return yScale(d.Subsidies);})
        .attr("class", "line")
        .style("stroke", "black")
        .style("stroke-width", "1px");

    g.append("svg:image")
        .attr("x", 0)
        .attr("y", -20)
//        .attr('y', function(d){return yScale(d.value);})
        .attr('width', function(d) { return fishScale(d.Landings) })
        .attr('height', function(d) {return fishScale(d.Landings)/2 })
        .attr("xlink:href", "img/trout-sillouette.svg")
        .attr("transform",function (d, i) { return "translate(" + (colWidth + (i * colWidth) +i*3) + ", " +
            yScale(d.Subsidies) +")rotate(-90)" });

    g.append("text")
        .attr('x', -50)
//        .attr('y', function(d){return yScale(d.value)/2;})
        .attr("y", 0)
        .attr("class", "pcLegend")
        .text(function(d){return "Subsidies: " + d.Subsidies})
        .attr("transform",function (d, i) { return "translate(" + (colWidth-10 + (i * colWidth)) + ", " +
            yScale(d.Subsidies)/2 +")rotate(-90)" });


}

