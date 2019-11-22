
var allEmpData;
var allVesselData;
var employmentData = [];
var vesselData=[];
var filterYear;
var empChart;
var vesselChart;


queue()
    .defer(d3.csv, "data/Employment.csv")
    .defer(d3.csv, "data/TotalVessels.csv")
    .await(loadData);

function loadData(error, empData, vessels){
     if(!error) {
            allEmpData = empData;
            allVesselData = vessels;
//            console.log(empData);
            wrangleData();
        }
}

function wrangleData(){
    employmentData=[];
    vesselData=[]

    if (filterYear == null){
        filterYear = 2005;
    }

    //*************EMPLOYMENT DATA*******************
    tempEmpData = allEmpData.filter(function(d){ return d.Year == filterYear; });

    //console.log(allEmpData);
    tempEmpData = d3.rollup(tempEmpData, function(v) {
        return d3.sum(v, function(d) {return d.Value; })},
        function(d) {
        return d.COUNTRY});
    //console.log(allEmpData);
    var tempData = Array.from(tempEmpData);
    //console.log(tempData);
    for (i=0;i<tempData.length; i++){
            var temp = {key: tempData[i][0], value: tempData[i][1]}
            employmentData.push(temp);
        };

    employmentData.sort(function(a,b) {return b.value - a.value});
    //console.log(employmentData);

    //*************VESSELS DATA*******************
    tempVesselData = allVesselData.filter(function(d){ return d.Year == filterYear; });
    tempVesselData.forEach(function(d){
        vesselData.push({key: d.COUNTRY, value: d.Value})
    })

    vesselData.sort(function(a,b) {return b.value - a.value});

    //console.log(vesselData);
    drawChart();
//    drawBubbles(employmentData);
//    drawVessels(allVesselData);
}

function drawChart() {
    if (empChart) {
        console.log("chart already exists");
        empChart.updateVis(employmentData);
        vesselChart.updateVis(vesselData);
    } else {
        empChart = new BubbleChart("viz-employment", employmentData, "bubble");
        vesselChart = new BubbleChart("viz-vessels", vesselData, "vessel")

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
