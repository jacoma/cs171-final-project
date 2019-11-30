
statFishStocks = [
    {Stat: "Already Gone", Metric:90, Tip:"Approximately 90% of fish stocks of large predatory fish are already gone."},
    {Stat:"Remaining", Metric: 10, Tip: "Overfishing has disproportionately targeted the largest fish at the top of the food chain"},
    ]

statStockStatus = [
    {Stat: "Overexploited", Metric: 17, Tip: "According to the United Nations, 17% of fish stocks worldwide are currently overexploited."},
    {Stat: "Fully Exploited", Metric: 52, Tip: "According to the United Nations, 52% of fish stocks worldwide are fully exploited. Only an estimated 20% of worldwide fish stocks are not already at or above their capacity"},
    {Stat: "Depleted", Metric: 7, Tip: "According to the United Nations, 7% of fish stocks worldwide are depleted." },
]

drawStatistics();

function drawStatistics(){
        statFishStocks = statFishStocks.sort(function(a, b){ return a.Metric - b.Metric })
        fishStock = new Statistics("fishstocks", statFishStocks, "Global Fish Stock");
        statStockStatus = statStockStatus.sort(function(a, b){ return a.Metric - b.Metric })
        stockStatus = new Statistics("stockstatus", statStockStatus, "Status of Fish Stocks");
    }
