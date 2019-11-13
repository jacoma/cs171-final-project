var parseDate = d3.timeParse("%Y");
var fishSpecies = [];
var countries = [];
var landingData;

/*** VARIABLES FOR VIZ */
var stackedArea, barchart;

queue()
    .defer(d3.csv, "data/landings_2.csv")
    .await(createVis);

function createVis(error, landings){
    if(error) { console.log(error); }

    landings.forEach(function(d){
        if(countries.indexOf(d.Country) < 0) {
            countries.push(d.Country);
        }
    });
        
    landings.forEach(function(d){
        if(fishSpecies.indexOf(d.Species) < 0) {
            fishSpecies.push(d.Species);
        }
    });

    landingData = landings;

    // (3) Create event handler
	var MyEventHandler = {};

    /*** CREATE VISUALZATIONS */
    stackedArea = new StackedAreaChart("viz-area", landingData, MyEventHandler);

    barchart = new BarChart("viz-bar", landingData);

    // (5) Bind event handler
    $(MyEventHandler).bind("selectionChanged", function(event, speciesFilter){

		barchart.onSelectionChange(speciesFilter);

		stackedArea.onSelectionChange(speciesFilter);
	});

}