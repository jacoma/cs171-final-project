var parseDate = d3.timeParse("%Y");
var fishSpecies = [];
var areaYears = [];
var countries = [];
var landingData;

statFishStocks = [
    {Stat: "Already Gone", Metric:90, Tip:"Approximately 90% of fish stocks of large predatory fish are already gone."},
    {Stat:"Remaining", Metric: 10, Tip: "Overfishing has disproportionately targeted the largest fish at the top of the food chain"},
]

statStockStatus = [
    {Stat: "Overexploited", Metric: 17, Tip: "According to the United Nations, 17% of fish stocks worldwide are currently overexploited."},
    {Stat: "Fully Exploited", Metric: 52, Tip: "According to the United Nations, 52% of fish stocks worldwide are fully exploited. Only an estimated 20% of worldwide fish stocks are not already at or above their capacity"},
    {Stat: "Depleted", Metric: 7, Tip: "According to the United Nations, 7% of fish stocks worldwide are depleted." },
]

// Percent decrease in catches since 1960
statCatches = [
    {Stat: "Pacific Herring", Metric: 71, Tip: "Catches of Pacific herring have decreased by 71% since the 1960s"},
    {Stat: "Atlantic Herring", Metric: 63, Tip: "Catches of Atlantic herring have decreased by 63% since the 1960s"},
    {Stat: "Atlantic Cod", Metric: 69, Tip: "Catches of Atlantic Cod have decreased by 69% since the 1960s"},
]

statIllegal = [
    {Stat: "Leagal Catch", Metric: 70, Tip:"Experts estimate illegal, unreported, and unregulated (IUU) fishing nets criminals up to $36.4 billion each year"},
    {Stat: "Illegal Catch", Metric: 30, Tip:"Some of the worst ocean impacts are caused by pervasive illegal fishing, which is estimated at up to 30% of catch"}
]

statConsumption = [
    {Stat: "Wild Seafood", Metric: 75, Tip:"Of the 90.4 Million metric tons of wild seafood produced only 67.2 Million metric tons is consumed"},
    {Stat: "Farmed Seafood", Metric: 100, Tip:"Of the 63.6.4 Million metric tons of farmed seafood produced all 63.6 Million metric tons is consumed"}
]


/*** VARIABLES FOR VIZ */
var stackedArea, barchart, bubblechart, fishStock, stockStatus;

queue()
    .defer(d3.csv, "data/landings_top.csv")
    .defer(d3.csv, "data/global_population.csv")
    .await(createVis);

function createVis(error, landings, bubbles){
    if(error) { console.log(error); }

    // console.log(landings);

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

    // console.log(areaYears, fishSpecies);

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