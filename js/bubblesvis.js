
width = 800;
height=500;
bubbleSVG = d3.select("#bubbles").append("svg")
    .attr("width", width)
    .attr("height", height )
    .attr("class", "bubble")
    .attr("id", "bubblesvg");

var allEmpData;
var allVesselData;
var employmentData = [];
var vesselData=[];
var filterYear = 2018;



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
//    filterYear = d3.select("#bubble-year").property("value");
    // console.log(filterYear);
    filterYear=2008;

    //*************EMPLOYMENT DATA*******************
    allEmpData = allEmpData.filter(function(d){ return d.Year == filterYear; });

    //console.log(allEmpData);
    allEmpData = d3.rollup(allEmpData, function(v) {
        return d3.sum(v, function(d) {return d.Value; })},
        function(d) {
        return d.Country});
    //console.log(allEmpData);
    var tempData = Array.from(allEmpData);
    //console.log(tempData);
    for (i=0;i<tempData.length; i++){
            var temp = {key: tempData[i][0], value: tempData[i][1]}
            employmentData.push(temp);
        };

    employmentData.sort(function(a,b) {return b.value - a.value});
    console.log(employmentData);

    //*************VESSELS DATA*******************
    allVesselData = allVesselData.filter(function(d){ return d.Year == filterYear; });
    allVesselData.forEach(function(d){
        vesselData.push({key: d.COUNTRY, value: d.Value})
    })
    console.log(vesselData);

    empChart = new BubbleChart("viz-employment", employmentData, "bubble");
    vesselChart = new BubbleChart("viz-vessels", vesselData, "vessel")

//    drawBubbles(employmentData);
//    drawVessels(allVesselData);
}


/*
function drawBubbles(bData) {
//    console.log(bData);
    bubbleChart = new BubbleChart("viz-employment", bData, "bubble");

}
*/
