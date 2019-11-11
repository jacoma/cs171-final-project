
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
        fishStock = new Statistics("fishstocks", statFishStocks, "Global Fish Stock");
        stockStatus = new Statistics("stockstatus", statStockStatus, "Status of Fish Stocks");
    }
