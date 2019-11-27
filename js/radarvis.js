//based on Nadieh Bremer - VisualCinnamon.com radar chart
//http://bl.ocks.org/nbremer/21746a9668ffdf6d8242

var width = 300,
    height = 300;
margin = { top: 10, right: 10, bottom: 10, left: 10 };

/*
var radarColor = d3.scaleOrdinal()
    .range(["#f5ec42","#f54242","#308ea6"]);
*/
var config = {
    w: width,
    h: height,
    maxValue: 100,
    levels: 10,
    ExtraWidthX: 300,
//    color: radarColor
}

//variables to create radar data
var radarData=[[], [], []];
var allLandings;
var allPopulation;
var allSubsidies;

var sortDataA = [];
var sortDataB = [];
var sortDataC = [];
var radarChart;



queue()
    .defer(d3.csv, "data/landings_SA2.csv")
    .defer(d3.csv, "data/global_population_SA.csv")
    .defer(d3.csv, "data/Subsidies_SA.csv")
    .await(createRadar);

function createRadar(error, landings, population, subsidies) {
//Call function to draw the Radar chart
    if (error) throw error;
    allLandings = landings;
    allPopulation = population;
    allSubsidies = subsidies;
        //create data from 3 data sets
        //expects arrays of objects
//    console.log(radarData);
    updateRadar();
//    updateCircles();
    }


function updateRadar() {
    sortDataA=[];
    sortDataB=[];
    sortDataC=[];
    radarYear = d3.select("#radar-year").property("value");
    //radarYear = 2009;

    var yearPopulation = allPopulation.forEach(function (d) {
        //console.log(parseInt(d[2001])/popMax);
        var pops = {
            axis: d.Country_Name,
            value: parseInt(d[radarYear])
        };
        sortDataA.push(pops)
    });
    radarData[0] = sortDataA.slice().sort((a, b) => d3.ascending(a.axis, b.axis))


    var yearLandings = allLandings.forEach(function (d) {
        //console.log(parseInt(d[2001])/popMax);
        var lands = {
            axis: d.Country,
            value: parseInt(d[radarYear])
        };
        sortDataB.push(lands)
    });
    radarData[1] = sortDataB.slice().sort((a, b) => d3.ascending(a.axis, b.axis))

    /*    var yearLandings = d3.rollup(allLandings, function (v) {
                return d3.sum(v, function (d) {
                    return d[radarYear];
                })
            },
            function (d) {
                return d.Country
            });
    //    console.log(landings);

    var tempData = Array.from(yearLandings);
    console.log(tempData);
    //console.log(tempData);
    for (i = 0; i < tempData.length; i++) {
        var temp = {axis: tempData[i][0], value: tempData[i][1]}
        sortDataB.push(temp);
    }
    ;

    radarData[1] = sortDataB.slice().sort((a, b) => d3.ascending(a.axis, b.axis))
*/
    var yearSubsidies = allSubsidies.forEach(function (d) {
        var subs = {
            axis: d.Country,
            value: parseInt(d[radarYear])
        };
        sortDataC.push(subs)
    });
    radarData[2] = sortDataC.slice().sort((a, b) => d3.ascending(a.axis, b.axis))


    if (radarChart) {
        radarChart.updateRadar();
    } else {
        radarChart = new RadarChart("#viz-radar", radarData, config)
    }
}


function updateCircles(){



    if (circlesChart) {
        circlesChart.updateCircles();
    } else {
        circlesChart = new RadarChart("#viz-radar", radarData, config)
    }


}


