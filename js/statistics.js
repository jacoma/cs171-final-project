
statFishStocks = [
    {Stat: "Already Gone", Metric:90},
    {Stat:"Remaining", Metric: 10},
    ]

statStockStatus = [
    {Stat: "Overexploited", Metric: 17},
    {Stat: "Fully Exploited", Metric: 52},
    {Stat: "Depleted", Metric: 7},
]

drawStatistics();

function drawStatistics(){
        statFishStocks = statFishStocks.sort(function(a, b){ return a.Metric - b.Metric })
        fishStock = new Statistics("fishstocks", statFishStocks, "Global Fish Stock");
        statStockStatus = statStockStatus.sort(function(a, b){ return a.Metric - b.Metric })
        stockStatus = new Statistics("stockstatus", statStockStatus, "Status of Fish Stocks");
    }
