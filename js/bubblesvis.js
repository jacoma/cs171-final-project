
width = 800;
height=500;
bubbleSVG = d3.select("#bubbles").append("svg")
    .attr("width", width)
    .attr("height", height )
    .attr("class", "bubble")
    .attr("id", "bubblesvg");

var allEmpData;
var employmentData = [];
var filterYear = 2018
loadData();


// prepare data
function loadData(){
    d3.csv("data/Employment.csv", function(error, empData){
        if(!error) {
            allEmpData = empData;
//            console.log(empData);
            wrangleData();
        }
    })
}

function wrangleData(){
//    filterYear = d3.select("#bubble-year").property("value");
    // console.log(filterYear);
    filterYear=2008;
    allEmpData = allEmpData.filter(function(d){ return d.Year == filterYear; });
    allEmpData.sort(function(a,b) {return b.value - a.value});

    console.log(allEmpData);
    allEmpData = d3.rollup(allEmpData, function(v) {
        return d3.sum(v, function(d) {return d.Value; })},
        function(d) {
        return d.Country});
    console.log(allEmpData);

    var tempData = Array.from(allEmpData);
    //console.log(tempData);
    for (i=0;i<tempData.length; i++){
            var temp = {key: tempData[i][0], value: tempData[i][1]}
            employmentData.push(temp);
        };


   // console.log(employmentData);

    drawBubbles(employmentData);

}

function drawBubbles(bData) {
//    console.log(bData);
    bubbleChart = new BubbleChart("viz-employment", bData);

}