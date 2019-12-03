
var allEmpData;
var allVesselData;
var allExportData;
var allSubsData;
var employmentData = [];
var vesselData=[];
var exportData=[];
var filterYear;
var empChart;
var vesselChart;
var selectedCountry;


queue()
    .defer(d3.csv, "data/Employment.csv")
    .defer(d3.csv, "data/TotalVessels.csv")
    .defer(d3.csv, "data/Exports.csv")
    .defer(d3.csv,"data/Subsidies_SA.csv")
    .await(loadData);

function loadData(error, empData, vessels, exports, subsidies){
     if(!error) {
            allEmpData = empData;
            allVesselData = vessels;
            allExportData = exports;
            allSubsData = subsidies;
//            console.log(empData);
            wrangleData();
        }
}

function wrangleData(){
    employmentData=[];
    vesselData=[];
    exportData=[];
    var subs =[];
    if (filterYear == null){
        filterYear = 2017;
    }
    //if (selectedCountry == null){
    //    selectedCountry ="USA";
    //}
    //*************PREPARE SUBSIDIES DATA*******************

    allSubsData.forEach(function(d){
        temp = {Country: d.Country, Value: parseInt(d[filterYear])}
        subs.push(temp)
    })
    console.log(subs);
    //*************EMPLOYMENT DATA*******************
    tempEmpData = allEmpData.filter(function(d){ return d.Year == filterYear; });

    //console.log(allEmpData);
    tempEmpData = d3.rollup(tempEmpData, function(v) {
        return d3.sum(v, function(d) {return d.Value; })},
        function(d) {
        return d.COUNTRY + "-" + d.Country})
    //console.log(tempEmpData);
    var tempData = Array.from(tempEmpData);
    //console.log(tempData);
    for (i=0;i<tempData.length; i++){
            country=tempData[i][0].split("-")
            s = subs.filter(function(s) {return s.Country == country[1]})
            if (s[0]){
                s= s[0].Value;
            }
            else{
                    s = 0;
                }
            //console.log(s);
            var temp = {key: country[0], value: tempData[i][1], name: country[1], subs: s}
            employmentData.push(temp);
        };

    employmentData.sort(function(a,b) {return b.value - a.value});
//    console.log(employmentData);

    //*************VESSELS DATA*******************
    tempVesselData = allVesselData.filter(function(d){ return d.Year == filterYear; });
    tempVesselData.forEach(function(d){
        s = subs.filter(function(s) {return s.Country == d.Country})
        if (s[0]){
            s= s[0].Value;
        }
        else{
            s = 0;
        }
        vesselData.push({key: d.COUNTRY, value: d.Value, name: d.Country, subs: s})
    })

    vesselData.sort(function(a,b) {return b.value - a.value});

//    console.log(vesselData);

    //*************EXPORT DATA*******************
    allExportData.forEach(function(d){
        s = subs.filter(function(s) {return s.Country == d.Country})
        if (s[0]){
            s= s[0].Value;
        }
        else{
            s = 0;
        }
        exportData.push({key: d.Code, value: parseInt(d[filterYear]), name: d.Country, subs: s})
    });
    exportData.sort(function(a,b) {return b.value - a.value});

    //console.log(exportData);
    createLegend()
    drawChart();
//    drawBubbles(employmentData);
//    drawVessels(allVesselData);
}

function drawChart() {
    if (empChart) {
        //console.log("chart already exists");
        empChart.updateVis(employmentData, selectedCountry);
        vesselChart.updateVis(vesselData, selectedCountry);
        exportChart.updateVis(exportData, selectedCountry);
    } else {
        //console.log(selectedCountry);
        empChart = new BubbleChart("viz-employment", employmentData, selectedCountry);
        vesselChart = new BubbleChart("viz-vessels", vesselData, selectedCountry)
        exportChart = new BubbleChart("viz-exports", exportData, selectedCountry)

    }
}

function updateBubbles(year, country) {
    selectedCountry = country;
    filterYear = d3.select("#bubble-year").property("value");
    //console.log(filterYear);
    wrangleData();

}


function createLegend() {
//viz-bubbleLegend
    var legendData=[{x: "Low", value: 10, subs: 10 },
        {x: "Med", value: 20, subs: 20 },
        {x: "High", value: 30, subs: 30 }];
    svgLegend = d3.select("#viz-bubbleLegend").append("svg")
        .attr("width", 200)
        .attr("height", 200);
    var colorCircles = d3.scaleOrdinal(d3.schemeBlues[3]);
    var scaleRadius = d3.scaleLog()
        .domain([
            d3.min(legendData, function(d) { return +d.value; }),
            d3.max(legendData, function(d) { return +d.value; })])
        .range([5,20]);

    var gLegSize = svgLegend.append("g");
    gLegSize.selectAll(".szLegend")
        .data(legendData)
        .enter()
        .append("svg:circle")
        .attr("class", "legend")
        .attr("r", function(d){ return scaleRadius(d.value) })
        .attr("cx", function(d, i){return 10+ ((30* i) + (i * 55));})
        .attr("cy", 35)
        .style("fill", function(d){ return colorCircles(20); })
    gLegSize.append("text")
        .attr("x", 5)
        .attr("y", 15)
        .style("fill", "black")
        .text("Circle Size (Volume)")
        .attr("text-anchor", "start")
    gLegSize.selectAll(".leg-size")
        .data(legendData)
        .enter()
        .append("text")
        .attr("class", "pcLegend")
        .attr("x", function(d, i){return i * 85;})
        .attr("y", 70)
        .style("fill", "black")
        .text(function(d){ return d.x})
        .attr("text-anchor", "start")

    var gLegColor = svgLegend.append("g");
    gLegColor.selectAll(".clrLegend")
        .data(legendData)
        .enter()
        .append("svg:circle")
        .attr("class", "legend")
        .attr("r", function(d){ return scaleRadius(d.value) })
        .attr("cx", function(d, i){return 10+ ((30* i) + (i * 55));})
        .attr("cy", 140)
        .style("fill", function(d){ return colorCircles(d.subs); })
    gLegColor.append("text")
        .attr("x", 5)
        .attr("y", 110)
        .style("fill", "black")
        .text("Circle Color (Subsidies)")
        .attr("text-anchor", "start")
    gLegColor.selectAll(".leg-size")
        .data(legendData)
        .enter()
        .append("text")
        .attr("class", "pcLegend")
        .attr("x", function(d, i){return i * 85;})
        .attr("y", 180)
        .style("fill", "black")
        .text(function(d){ return d.x})
        .attr("text-anchor", "start")


}
