var width = 500;
var height = 500;

var svgAqua = d3.select("#aqua-chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("data/aqua_timeseries.csv", function(data1) {
    // convert selected values from string to numeric
    data1.forEach(function(d) {
        d.COUNTRY = +d.COUNTRY;
        d.YEAR = +d.YEAR;
        d.QUANTITY = +d.QUANTITY;
    });

    d3.csv("data/aqua_countries.csv", function(data2) {
        data2.forEach(function(d) {
            d.UN_Code = +d.UN_Code;
        });

        console.log(data1);
        console.log(data2);

        // Filter by year
        data1.filter(function(d) {
            return d.YEAR === 2000;
        });

        // Add total quantity to second dataset
        for (var i = 0; i < data2.length; i++) {
            data2[i].Total_Quantity = 0;

            for (var j = 0; j < data1.length; j++) {
                if (data2[i].UN_Code === data1[j].COUNTRY) {
                    data2[i].Total_Quantity += data1[j].QUANTITY;
                }
            }
        }

        var quantity = [];

        for (var i = 0; i < data2.length; i++) {
            quantity.push(data2[i].Total_Quantity);
        }

        // Pie chart initialization; WILL MOVE TO SEPARATE FUNCTION
        var pie = d3.pie();

        var colors = d3.scaleOrdinal(d3.schemeCategory10);

        var outerRadius = width/2;
        var innerRadius = 0;

        var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        console.log(quantity);

        var chart = svgAqua.selectAll(".pie")
            .data(pie(quantity))
            .enter()
            .append("g")
            .attr("class", "pie");

        chart.append("path")
            .attr("fill", function(d, i) {
                return colors(i);
            })
            .attr("d", arc);

        chart.append("text")
            .attr("transform", function(d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .text(function(d, i) {
                if (d.value > 50000000) {
                    console.log(d.value);

                    return data2[i].Name_En;
                }
            });
    });
});
