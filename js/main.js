var parseDate = d3.timeParse("%Y");
var landingData = [];

/*** VARIABLES FOR VIZ */
var stackedArea;

/*** LOAD DATA */
loadData();

function loadData() {
    queue()
    .defer(d3.csv, "data/landings.csv")
    .await(function(error, landings){
        if(!error){

            console.log(landings);

            /*** CREATE STACKED AREA CHART DATA */
            years = Object.keys(landings[0]);

            for(y = 0; y < years.length; y++){
                yearObj = {};
                yearObj["Year"] = parseDate(years[y]);
                landings.forEach(function(d){
                        yearObj[d.Species] = +d[years[y]];
                    })

                landingData.push(yearObj);
            }

            console.log(landingData);
            
            createVis();
        }
    });
}

/*** CREATE VISUALZATIONS */
function createVis(){

    stackedArea = new StackedAreaChart("viz-area", landingData);

}