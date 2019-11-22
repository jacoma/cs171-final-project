//based on Nadieh Bremer - VisualCinnamon.com radar chart
//http://bl.ocks.org/nbremer/21746a9668ffdf6d8242

var width = 300,
    height = 300;
margin = { top: 10, right: 10, bottom: 10, left: 10 };

// Date parser
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");

var radarColor = d3.scaleOrdinal()
    .range(["#32a871","#308ea6","#308ea6"]);

var config = {
    w: width,
    h: height,
    maxValue: 100,
    levels: 10,
    ExtraWidthX: 300,
    color: radarColor
}

//var radarData=[[],[],[]];
var radarData=[[], []];

queue()
    .defer(d3.csv, "data/landings.csv")
    .defer(d3.csv, "data/global_population.csv")
    .defer(d3.csv, "data/FisheriesSupport2000-2019.csv")
    .defer(d3.json, "data/CountryCodes.json")
    .await(createRadar);

function createRadar(error, landings, population, SubsidiesData, CountryCodes) {
//Call function to draw the Radar chart
    if (error) throw error;

    //create data from 3 data sets
    //expects arrays of objects

    //ALL OF THESE HAVE HARD CODED YEAR FOR NOW
    //MAYBE FILTER TO THE TOP 5????
    //WHAT IS INTERACTION


    population.forEach(function(d) {
        //console.log(parseInt(d[2001])/popMax);
        var pops = {
            axis: d.Country_Code,
            value: parseInt(d[2001])
        };
        radarData[0].push(pops)
    });

    landings = landings.filter(function(d){ return d[2001] > 0})

    // landings = d3.rollup(landings, function(v) {
    //         return d3.sum(v, function(d) {return d[2001]; })},
    //     function(d) {
    //         return d.Country_Code});
    // console.log(landings);
    //
    // var tempData = Array.from(landings);
    // //console.log(tempData);
    // for (i=0;i<tempData.length; i++){
    //     var temp = {axis: tempData[i][0], value: tempData[i][1]}
    //     radarData[1].push(temp);
    // };

    // Add subsidies data

        var Years = [];
        // Cleans and processes the data
        SubsidiesData.forEach (function(d,i) {

            d.Country = CountryCodes[d.LOCATION];
            d.YEAR = parseDate(d.TIME);
            d.Value = +d.Value;
            d.Value = d.Value/1000000;
            // Stores years to the year array
            Years.push(+d.TIME);
        });

        // // Fills JSON container based on number of years
        // Years.forEach(function(d) {
        //     data[d] = {};
        // })
        //
        // // Adds country to year
        // SubsidiesData.forEach (function(d,i) {
        //     data[d.TIME][d.Country] = d;
        // });
    radarData.push(SubsidiesData);

    console.log(radarData);
    updateVis();
}


function updateVis() {
    RadarChart.draw("#radar", radarData, config )
}



