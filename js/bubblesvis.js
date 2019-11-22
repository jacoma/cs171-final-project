
var allEmpData;
var allVesselData;
var allExportData;
var employmentData = [];
var vesselData=[];
var exportData=[];
var filterYear;
var empChart;
var vesselChart;


queue()
    .defer(d3.csv, "data/Employment.csv")
    .defer(d3.csv, "data/TotalVessels.csv")
    .defer(d3.csv, "data/Exports.csv")
    .await(loadData);

function loadData(error, empData, vessels, exports){
     if(!error) {
            allEmpData = empData;
            allVesselData = vessels;
            allExportData = exports;
//            console.log(empData);
            wrangleData();
        }
}

function wrangleData(){
    employmentData=[];
    vesselData=[];
    exportData=[];

    if (filterYear == null){
        filterYear = 2008;
    }

    //*************EMPLOYMENT DATA*******************
    tempEmpData = allEmpData.filter(function(d){ return d.Year == filterYear; });

    //console.log(allEmpData);
    tempEmpData = d3.rollup(tempEmpData, function(v) {
        return d3.sum(v, function(d) {return d.Value; })},
        function(d) {
        return d.COUNTRY + "-" + d.Country})
    console.log(tempEmpData);
    var tempData = Array.from(tempEmpData);
    //console.log(tempData);
    for (i=0;i<tempData.length; i++){
            country=tempData[i][0].split("-")
            var temp = {key: country[0], value: tempData[i][1], name: country[1]}
            employmentData.push(temp);
        };

    employmentData.sort(function(a,b) {return b.value - a.value});
    //console.log(employmentData);

    //*************VESSELS DATA*******************
    tempVesselData = allVesselData.filter(function(d){ return d.Year == filterYear; });
    tempVesselData.forEach(function(d){
        vesselData.push({key: d.COUNTRY, value: d.Value, name: d.Country})
    })

    vesselData.sort(function(a,b) {return b.value - a.value});

    //console.log(vesselData);

    //*************EXPORT DATA*******************
    allExportData.forEach(function(d){
        exportData.push({key: d.Code, value: parseInt(d[filterYear]), name: d.Country})
    });
    exportData.sort(function(a,b) {return b.value - a.value});

    //console.log(exportData);

    drawChart();
//    drawBubbles(employmentData);
//    drawVessels(allVesselData);
}

function drawChart() {
    if (empChart) {
        console.log("chart already exists");
        empChart.updateVis(employmentData);
        vesselChart.updateVis(vesselData);
        exportChart.updateVis(exportData);
    } else {
        empChart = new BubbleChart("viz-employment", employmentData, "bubble");
        vesselChart = new BubbleChart("viz-vessels", vesselData, "vessel")
        exportChart = new BubbleChart("viz-exports", exportData, "bubble")

    }
}

function updateBubbles() {
    filterYear = d3.select("#bubble-year").property("value");
    //console.log(filterYear);
    wrangleData();

}

/*
function drawBubbles(bData) {
//    console.log(bData);
    bubbleChart = new BubbleChart("viz-employment", bData, "bubble");

}
*/
