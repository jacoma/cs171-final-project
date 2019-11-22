//Radar Chart Code from https://gist.github.com/alandunning/4c36eb1abdb248de34c64f5672afd857

// based on N. Bremers radar chart post
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html


//modified to remove the path and incorporate bubbles with radial scale to represent values

var RadarChart = {
    draw: function(id, d, options){
        var cfg = {
            //radius: 5,
            w: 400,
            h: 400,
            factor: 1,
            factorLegend: .85,
            levels: 3,
            maxValue: 0,
            radians: 2 * Math.PI,
            opacityArea: 0.5,
            ToRight: 5,
            TranslateX: 80,
            TranslateY: 30,
            ExtraWidthX: 100,
            ExtraWidthY: 100
        };

        if('undefined' !== typeof options){
            for(var i in options){
                if('undefined' !== typeof options[i]){
                    cfg[i] = options[i];
                }
            }
        }
        var colorCircles = d3.scaleOrdinal()
        //    .range(["#32a871","#308ea6","#308ea6"]);
            .range(["#f5ec42","#f54242","#308ea6"])
            .domain([0,1]);

        var radarTip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        //cfg.maxValue = 100;
        var allAxis = (d[0].map(function(i, j){ return i.axis}));
        var total = allAxis.length;
        var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
        var Format = d3.format('%');
        d3.select(id).select("svg").remove();

        var g = d3.select(id)
            .append("svg")
            .attr("width", cfg.w+cfg.ExtraWidthX)
            .attr("height", cfg.h+cfg.ExtraWidthY)
            .append("g")
            .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

        //Circular segments
        for(var j=0; j<cfg.levels; j++){
            var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
            g.selectAll(".levels")
                .data(allAxis)
                .enter()
                .append("svg:line")
                .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
                .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
                .attr("class", "line")
                .style("stroke", "grey")
                .style("stroke-opacity", "0.75")
                .style("stroke-width", "0.3px")
                .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
        }
/*
        //Text indicating at what % each level is
        for(var j=0; j<cfg.levels; j++){
            var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
            g.selectAll(".levels")
                .data([1]) //dummy data
                .enter()
                .append("svg:text")
                .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
                .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
                .attr("class", "legend")
                .style("font-family", "sans-serif")
                .style("font-size", "10px")
                .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
                .attr("fill", "#737373")
                .text((j+1)*100/cfg.levels);
        }
*/
        //series = 0;

        var axis = g.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", cfg.w/2)
            .attr("y1", cfg.h/2)
            .attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
            .attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
            .attr("class", "line")
            .style("stroke", "grey")
            .style("stroke-width", "1px");

        axis.append("text")
            .attr("class", "legend")
            .text(function(t){return t})
            .style("font-family", "sans-serif")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "1.5em")
            .attr("transform", function(d, i){return "translate(0, -10)"})
            .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
            .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);})
            .text(function(t){ return t;});


        d.forEach(function(y, x){
            dataValues = [];
            g.selectAll(".nodes")
                .data(y, function(j, i){
                    dataValues.push([
                        cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                        cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
                    ]);
                });
            dataValues.push(dataValues[0]);
        });
        series=0;

        d.forEach(function(y, x){
            //console.log(x);
            //console.log(d[x]);
            var max = d3.max(d[x], function(r) { return + r.value; });
            var min = d3.min(d[x], function(r) { return + r.value; })
            var scaleRadius = d3.scaleLinear()
                .domain([min, max])
                .range([5,20]);

//            console.log("Series " + series);
            g.append("text")
                .attr("class", "legend")
                .attr("x", width)
                .attr("y", series * 20)
                .style("fill", function (d) {
                    return colorCircles(series);
                })
                .attr("text-anchor", "end")
                .text(function(d){
                    switch(x){
                        case 0:
                            return "Population"
                            break;
                        case 1:
                            return "Catch"
                            break;
                        case 2:
                            return "Subsidies"
                            break;
                    }

                });


            var gradientRadial = g.append("defs").selectAll("radialGradient")
                .data(d[x])
                .enter()
                .append("radialGradient")
                .attr("id", function(d) { return "gradient-" + series })
                .attr("cx", "30%")
                .attr("cy", "30%")
                .attr("r", "65%");

            gradientRadial.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", function(c) {return d3.rgb(colorCircles(series)).brighter(1);})
            gradientRadial.append("stop")
                .attr("offset", "50%")
                .attr("stop-color", function(c) {return colorCircles(series); })
            gradientRadial.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", function(c) {return d3.rgb(colorCircles(series)).darker(1.5);})


            g.selectAll(".nodes")
                .data(y).enter()
                .append("svg:circle")
                .attr("class", "radar-chart-serie"+series)
                .attr("r", function(j){ return scaleRadius(j.value) })
                .attr("alt", function(j){return Math.max(j.value, 0)})
                .attr("cx", function(j, i){
                    dataValues.push([
                        cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                        cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
                    ]);
                    return cfg.w/2*(1-(Math.max(j.value, 0)/max)*cfg.factor*Math.sin(i*cfg.radians/total));
                })
                .attr("cy", function(j, i){
                    return cfg.h/2*(1-(Math.max(j.value, 0)/max)*cfg.factor*Math.cos(i*cfg.radians/total));
                })
                .attr("data-id", function(j){return j.area})
                .style("stroke", colorCircles(series)).style("fill-opacity", .9)
                .style("fill", function(d){ return "url(#gradient-" + series +")"; })
                .on('mouseover', function (d){
                    var label
                    switch(x){
                        case 0:
                            label ="Population"
                            break;
                        case 1:
                            label ="Catch"
                            break;
                        case 2:
                            label= "Subsidies"
                            break;
                    }
                    console.log(d);
                    radarTip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    radarTip.html((d.axis) + " " + label + ": <br><span>" + (d.value) + "</span>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    radarTip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            series++;
        });
    }
};