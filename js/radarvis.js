//based on Nadieh Bremer - VisualCinnamon.com radar chart
//http://bl.ocks.org/nbremer/21746a9668ffdf6d8242

var width = 300,
    height = 300;
margin = { top: 10, right: 10, bottom: 10, left: 10 };

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
    .await(createRadar);

function createRadar(error, landings, population) {
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

    landings = d3.rollup(landings, function(v) {
            return d3.sum(v, function(d) {return d[2001]; })},
        function(d) {
            return d.Country_Code});
    console.log(landings);

    var tempData = Array.from(landings);
    //console.log(tempData);
    for (i=0;i<tempData.length; i++){
        var temp = {axis: tempData[i][0], value: tempData[i][1]}
        radarData[1].push(temp);
    };


    console.log(radarData);
    updateVis();
    }


function updateVis() {
    RadarChart.draw("#radar", radarData, config )
}



