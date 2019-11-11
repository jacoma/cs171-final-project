
width = 800;
height=500;
bubbleSVG = d3.select("#bubbles").append("svg")
    .attr("width", width)
    .attr("height", height )
    .attr("class", "bubble")
    .attr("id", "bubblesvg");



loadData();

var supportData;

// prepare data
function loadData(){
    d3.csv("data/FisheriesSupport2000-2019.csv", function(error, bubbleData){
        if(!error) {
            //set up data into array of objects
            bubbleData.forEach(function(d){
                d.Value = parseFloat(d.Value)
            })
            supportData = bubbleData;
            //console.log(bubbleData);
            wrangleData();
        }
    })
}

function wrangleData(){
    supportData = supportData.filter(function(d){ return d.TIME == "2010"})
    supportData = supportData.sort(function(a,b) { return b.Value - a.Value })
    drawBubbles(supportData);

}

function drawBubbles(bData) {

    bubbleChart = new BubbleChart("bubblesvg", bData);

}