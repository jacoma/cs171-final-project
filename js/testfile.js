

var margin = {top: 0, right: 20, bottom: 0, left: 0};

var width = 300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//****************FISHING VIS ***************************
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
//    console.log(arrayTops);

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
    console.log(parallelCompare);

    createParalell()
}

function createParalell(){
    var marginComp = {top: 60, right: 10, bottom: 0, left: 0};

    var widthComp = 500 - marginComp.left - marginComp.right,
        heightComp = 400 - marginComp.top - marginComp.bottom;

    var svgCompare = d3.select("#compare").append("svg")
        .attr("width", widthComp + marginComp.left + marginComp.right)
        .attr("height", heightComp + marginComp.top + marginComp.bottom)
        .append("g")
        .attr("transform", "translate(" + marginComp.left + "," + marginComp.top + ")");


    //take out country since its the label
    dimensions = d3.keys(parallelCompare[0])//.filter(function(d) { return d != "Country" });
    var y = {}
    for (i in dimensions) {
        name = dimensions[i]
        //this is creating a sale for each of the dimensions
        if (name == "Country") {
            y[name] = d3.scaleBand()
                .domain(["Argentina","Australia", "Canada", "Chile","China", "Chinese Taipei", "Denmark", "France", "Iceland", "Indonesia", "Italy", "Japan", "Korea", "Mexico", "Netherlands", "New Zealand", "Norway", "Peru", "Portugal", "Spain", "Sweden", "Thailand", "Turkey", "UK", "USA"])
                .range([heightComp, 0])
        } else {
            y[name] = d3.scaleLinear()
                .domain(d3.extent(parallelCompare, function (d) {
                    return +d[name];
                }))
                .range([heightComp, 0])
        }
    }
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

    //console.log(dimensions);
        x = d3.scalePoint()
            .range([0,widthComp])
            .padding(1)
            .domain(dimensions);

    function path(d) {
//        console.log(d)
        return d3.line()(dimensions.map(function(p) {
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
        .style("fill", "none")
        .style("stroke", "#4957d1")
        .style("opacity", .7);

    // Draw the axis:
    svgCompare.selectAll("compareAxis")
        .data(dimensions)
        .enter()
        .append("g")
        //.style("stroke", "#919190")
//        .style("fill", "#919190")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .each(function(d) {
            if(d=="Country"){
                d3.select(this).call(d3.axisLeft().scale(y[d]));
            }else {
                d3.select(this).call(d3.axisRight().scale(y[d]));
            }
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "#919190")

}