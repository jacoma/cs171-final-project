var parseDate = d3.timeParse("%Y");
var fishSpecies = [];
var areaYears = [];
var countries = [];
var landingData;

statFishStocks = [
    {Stat: "Already Gone", Metric:90},
    {Stat:"Remaining", Metric: 10},
    ]

//Status of fish stocks worldwide
statStockStatus = [
    {Stat: "Overexploited", Metric: 17},
    {Stat: "Fully Exploited", Metric: 52},
    {Stat: "Depleted", Metric: 7},
]

// Percent decrease in catches since 1960
statCatches = [
    {Stat: "Pacific Herring", Metric: 71},
    {Stat: "Atlantic Herring", Metric: 63},
    {Stat: "Atlantic Cod", Metric: 69},
]

statIllegal = [
    {Stat: "Leagal Catch", Metric: 70},
    {stat: "Illegal Catch", Metric: 30}
]

statConsumption = [
    {Stat: "Wild Seafood", Metric: 75},
    {Stat: "Farmed Seafood", Metric: 100}
]


/*** VARIABLES FOR VIZ */
var stackedArea, barchart, bubblechart, fishStock, stockStatus;

queue()
    .defer(d3.csv, "data/landings_top.csv")
    .defer(d3.csv, "data/global_population.csv")
    .await(createVis);

function createVis(error, landings, bubbles){
    if(error) { console.log(error); }

    console.log(landings);

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

    landings.forEach(function(d){
        if(areaYears.indexOf(d.YEAR) < 0) {
            areaYears.push(d.YEAR);
        }
    });

    areaYears = areaYears.sort(function(a,b){return a-b});

    console.log(areaYears, fishSpecies);

    landingData = landings;

    // (3) Create event handler
	var MyEventHandler = {};

    /*** CREATE VISUALZATIONS */
    stackedArea = new StackedAreaChart("viz-area", landingData, MyEventHandler);

    barchart = new BarChart("viz-bar", landingData, MyEventHandler);

    //bubblechart = new BubbleChart("viz-bubbles", bubbles);

    fishStock = new Statistics("viz-fishStock", statFishStocks, "Global Fish Stock", true);

    stockStatus = new Statistics("viz-statusStock", statStockStatus, "Status of Fish Stocks", true);

    stockDecrease = new Statistics("viz-statusDecrease", statCatches, "% decrease catch since 1960", true);

    illegalFish = new Statistics("viz-illegal", statIllegal, "% Illegal Fishing", false);

    consumption = new Statistics("viz-consumption", statConsumption, "% of Production Consumed", false);

    // (5) Bind event handler
    $(MyEventHandler).bind("selectionChanged", function(event, speciesFilter, countryFilter, MyEventHandler){

		barchart.onSelectionChange(speciesFilter, countryFilter);

		stackedArea.onSelectionChange(speciesFilter, countryFilter);
	});

}