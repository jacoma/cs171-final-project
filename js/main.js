var parseDate = d3.timeParse("%Y");
var fishSpecies = [];
var countries = [];
var landingData;

statFishStocks = [
    {Stat: "Already Gone", Metric:90},
    {Stat:"Remaining", Metric: 10},
    ]

statStockStatus = [
    {Stat: "Overexploited", Metric: 17},
    {Stat: "Fully Exploited", Metric: 52},
    {Stat: "Depleted", Metric: 7},
]

/*** VARIABLES FOR VIZ */
var stackedArea, barchart, bubblechart, fishStock, stockStatus;

queue()
    .defer(d3.csv, "data/landings_2.csv")
    .defer(d3.csv, "data/global_population.csv")
    .await(createVis);

function createVis(error, landings, bubbles){
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

    barchart = new BarChart("viz-bar", landingData, MyEventHandler);

    bubblechart = new BubbleChart("viz-bubbles", bubbles);

    fishStock = new Statistics("viz-fishStock", statFishStocks, "Global Fish Stock");

    stockStatus = new Statistics("viz-statusStock", statStockStatus, "Status of Fish Stocks");

    // (5) Bind event handler
    $(MyEventHandler).bind("selectionChanged", function(event, speciesFilter, countryFilter, MyEventHandler){

		barchart.onSelectionChange(speciesFilter, countryFilter);

		stackedArea.onSelectionChange(speciesFilter, countryFilter);
	});

}

// function blowBubbles(){

//     bubbleData.forEach(function(d){
//         d.Value = parseFloat(d.Value)
//     });

//     supportData = bubbleData;
//     //console.log(bubbleData);

//     supportData = supportData.filter(function(d){ return d.TIME == "2010"})
//         .sort(function(a,b) { return b.Value - a.Value })

// }