
width = 800;
height=500;
bubbleSVG = d3.select("#bubbles").append("svg")
    .attr("width", width)
    .attr("height", height )
    .attr("class", "bubble")
    .attr("id", "bubblesvg");

var allPopData;
var populationData = [];
var filterYear = 2018
loadData();


// prepare data
function loadData(){
    d3.csv("data/global_population.csv", function(error, popData){
        if(!error) {
            allPopData = popData;
            //console.log(bubbleData);
            wrangleData();
        }
    })
}

function wrangleData(){
    filterYear = d3.select("#bubble-year").property("value");
    // console.log(filterYear);
    allPopData.forEach(function(d) {
        var temp = {Name: d.Country_Name,
        Value: parseInt(d[filterYear]) };
        populationData.push(temp)
    })

    populationData.sort(function(a,b) {return b.Value - a.Value})
    // console.log(populationData)

    drawBubbles(populationData);

}

function drawBubbles(bData) {

    bubbleChart = new BubbleChart("viz-bubbles", bData);

}