var aWidth = 300;
var aHeight = 500;

var svgAqua = d3.select("#aqua-chart").append("svg")
    .attr("width", aWidth)
    .attr("height", aHeight)
    .append("g")
    .attr("transform", "translate(" + aWidth / 2 + "," + aHeight / 2 + ")");

var aquaText = svgAqua.append("g")
    .append("text")
    .attr("x", 0)
    .attr("y", -200)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text("Aquaculture Per Year");

var data1 = {};
var data1display = {};
var data2 = {};

var aquaTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([40, 100])
    .html("Test text");

svgAqua.call(aquaTip);

d3.csv("data/aqua_timeseries.csv", function(tData) {
    // convert selected values from string to numeric
    tData.forEach(function(d) {
        d.COUNTRY = +d.COUNTRY;
        d.YEAR = +d.YEAR;
        d.QUANTITY = +d.QUANTITY;
    });

    d3.csv("data/aqua_countries.csv", function(cData) {
        cData.forEach(function(d) {
            d.UN_Code = +d.UN_Code;
        });

        // console.log(tData);
        // console.log(cData);

        data1 = tData;
        data2 = cData;

        updateAquaculture();
    });
});

function updateAquaculture() {
    // Filter by year
    data1display = data1.filter(function(d) {
        return d.YEAR === +d3.select("#aqua-year").property("value");
    });

    // Add total quantity to second dataset
    for (var i = 0; i < data2.length; i++) {
        data2[i].Total_Quantity = 0;

        for (var j = 0; j < data1display.length; j++) {
            if (data2[i].UN_Code === data1display[j].COUNTRY) {
                data2[i].Total_Quantity += data1display[j].QUANTITY;
            }
        }
    }

    var quantity = [];

    for (var i = 0; i < data2.length; i++) {
        quantity.push(data2[i].Total_Quantity);
    }

    // Pie chart initialization
    var pie = d3.pie();

    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    var outerRadius = aWidth/2;
    var innerRadius = 0;

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // console.log(quantity);

    var chart = svgAqua.selectAll(".pie")
        .data(pie(quantity));

    chart.exit().remove();

    chart.enter()
        .append("path")
        .attr("fill", function(d, i) {
            return colors(i);
        })
        .attr("d", arc)
        .merge(chart)
        .on("mouseover", function(d, i) {
            aquaTip.html("Country: " + data2[i].Name_En
                         + "<br>Aquaculture: " + d.value + " tons")
                .show();
        })
        .on("mouseout", function(d) {
            aquaTip.hide();
        });
}
