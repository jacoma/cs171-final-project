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
    
    var count = 0;

    for (var i = 0; i < data2.length; i++) {
        quantity.push(data2[i].Total_Quantity);
        
        count += quantity[i];
    }

    // Pie chart initialization
    var pie = d3.pie();

    var outerRadius = (aWidth/2)*(count/90000000);
    var innerRadius = 0;

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // console.log(quantity);

    var chart = svgAqua.selectAll(".pie")
        .data(pie(quantity));

    chart.enter()
        .append("path")
        .attr("class", "pie")
        .merge(chart)
        .transition()
        .duration(1000)
        .attr("fill", function(d) {
            if (d.value > 50000000) {
                return "#BA529B";
            }
            else if (d.value > 5000000) {
                return "#5071A2";
            }
            else if (d.value > 500000) {
                return "#C6E967";
            }
            else {
                return "#F6C46D";
            }
        })
        .attr("d", arc)
        .on("mouseover", function(d, i) {
            aquaTip.html("Country: " + data2[i].Name_En
                         + "<br>Aquaculture: " + d.value + " tons")
                .show();
        })
        .on("mouseout", function(d) {
            aquaTip.hide();
        });
    
    chart.exit().remove();
}

// Create legend

var svgLegend = d3.select("#aqua-legend").append("svg")
    .attr("width", aWidth)
    .attr("height", 100);

svgLegend.append("circle")
    .attr("cx", 30)
    .attr("cy", 10)
    .attr("r", 8)
    .style("fill", "#BA529B");

svgLegend.append("circle")
    .attr("cx", 30)
    .attr("cy", 30)
    .attr("r", 8)
    .style("fill", "#5071A2");

svgLegend.append("circle")
    .attr("cx", 30)
    .attr("cy", 50)
    .attr("r", 8)
    .style("fill", "#C6E967");

svgLegend.append("circle")
    .attr("cx", 30)
    .attr("cy", 70)
    .attr("r", 8)
    .style("fill", "#F6C46D");

svgLegend.append("text")
    .attr("x", 50)
    .attr("y", 15)
    .text(">50,000,000 tons");

svgLegend.append("text")
    .attr("x", 50)
    .attr("y", 35)
    .text(">5,000,000 tons");

svgLegend.append("text")
    .attr("x", 50)
    .attr("y", 55)
    .text(">500,000 tons");

svgLegend.append("text")
    .attr("x", 50)
    .attr("y", 75)
    .text("<500,000 tons");
