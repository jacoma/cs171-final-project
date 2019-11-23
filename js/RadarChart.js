//Radar Chart Code from https://gist.github.com/alandunning/4c36eb1abdb248de34c64f5672afd857

// based on N. Bremers radar chart post
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html


//modified to remove the path and incorporate bubbles with radial scale to represent values
RadarChart = function(_parentElement, _data, _options){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.options = _options;
    this.initVis();
}


RadarChart.prototype.initVis = function() {
    vis = this;
    vis.cfg = {
        //radius: 5,
        w: 400,
        h: 400,
        factor: 1,
        factorLegend: .85,
        levels: 3,
        maxValue: 0,
        radians: 2 * Math.PI,
        opacityArea: 0.5,
//        ToRight: 5,
        TranslateX: 50,
        TranslateY: 30,
        ExtraWidthX: 100,
        ExtraWidthY: 100
    };

    vis.colorCircles = d3.scaleOrdinal()
    //    .range(["#32a871","#308ea6","#308ea6"]);
        .range(["#e377c2","#17becf","#1f77b4"])
        .domain([0,1]);

    vis.radarTip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    vis.radar_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 100])
//        .html("testing tool tip")
        .html(function(d){
/*            var label
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
                } */
            return d.axis + ": " + d.value });


    vis.allAxis = (vis.data[0].map(function(i, j){ return i.axis}));
    vis.total = vis.allAxis.length;
    vis.radius = vis.cfg.factor*Math.min(vis.cfg.w/2, vis.cfg.h/2);
//    var Format = d3.format('%');


    this.updateRadar();
}

RadarChart.prototype.updateRadar = function() {

    vis = this;
    d3.select(vis.parentElement).select("svg").remove();
    vis.g = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.cfg.w+vis.cfg.ExtraWidthX)
        .attr("height", vis.cfg.h+vis.cfg.ExtraWidthY)
        .append("g")
        .attr("transform", "translate(" + vis.cfg.TranslateX + "," + vis.cfg.TranslateY + ")");

    //Circular segments
    for(var j=0; j<vis.cfg.levels; j++){
        vis.levelFactor = vis.cfg.factor*vis.radius*((j+1)/vis.cfg.levels);
        vis.g.selectAll(".levels")
            .remove()
            .data(vis.allAxis)
            .enter()
            .append("svg:line")
            .attr("x1", function(d, i){return vis.levelFactor*(1-vis.cfg.factor*Math.sin(i*vis.cfg.radians/vis.total));})
            .attr("y1", function(d, i){return vis.levelFactor*(1-vis.cfg.factor*Math.cos(i*vis.cfg.radians/vis.total));})
            .attr("x2", function(d, i){return vis.levelFactor*(1-vis.cfg.factor*Math.sin((i+1)*vis.cfg.radians/vis.total));})
            .attr("y2", function(d, i){return vis.levelFactor*(1-vis.cfg.factor*Math.cos((i+1)*vis.cfg.radians/vis.total));})
            .attr("class", "line")
            .style("stroke", "grey")
            .style("stroke-opacity", "0.75")
            .style("stroke-width", "0.3px")
            .attr("transform", "translate(" + (vis.cfg.w/2-vis.levelFactor) + ", " + (vis.cfg.h/2-vis.levelFactor) + ")");
    }
    vis.g.call(vis.radar_tip);


    vis.axis = vis.g.selectAll(".axis")
        .data(vis.allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

    vis.axis.append("line")
        .attr("x1", vis.cfg.w/2)
        .attr("y1", vis.cfg.h/2)
        .attr("x2", function(d, i){return vis.cfg.w/2*(1-vis.cfg.factor*Math.sin(i*vis.cfg.radians/vis.total));})
        .attr("y2", function(d, i){return vis.cfg.h/2*(1-vis.cfg.factor*Math.cos(i*vis.cfg.radians/vis.total));})
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-width", "1px");

    vis.axis.append("text")
        .attr("class", "legend")
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .attr("transform", function(d, i){return "translate(0, -10)"})
        .attr("x", function(d, i){return vis.cfg.w/2*(1-vis.cfg.factorLegend*Math.sin(i*vis.cfg.radians/vis.total))-60*Math.sin(i*vis.cfg.radians/vis.total);})
        .attr("y", function(d, i){return vis.cfg.h/2*(1-Math.cos(i*vis.cfg.radians/vis.total))-20*Math.cos(i*vis.cfg.radians/vis.total);})
        .text(function(t){ return t;});

    vis.data.forEach(function(y, x){
        dataValues = [];
        vis.g.selectAll(".nodes")
//            .remove()
            .data(y, function(j, i){
                dataValues.push([
                    vis.cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/vis.cfg.maxValue)*vis.cfg.factor*Math.sin(i*vis.cfg.radians/vis.total)),
                    vis.cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/vis.cfg.maxValue)*vis.cfg.factor*Math.cos(i*vis.cfg.radians/vis.total))
                ]);
            });
        dataValues.push(dataValues[0]);
    });
    series=0;

    vis.data.forEach(function(y, x){
        //console.log(x);
        //console.log(d[x]);
        vis.max = d3.max(vis.data[x], function(r) { return + r.value; });
        vis.min = d3.min(vis.data[x], function(r) { return + r.value; })
        vis.scaleRadius = d3.scaleLinear()
            .domain([vis.min, vis.max])
            .range([5,20]);

//            console.log("Series " + series);
        vis.g.append("text")
            .attr("class", "legend")
            .attr("x", vis.width)
            .attr("y", series * 20)
            .style("fill", function (d) {
                return vis.colorCircles(series);
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


        vis.gradientRadial = vis.g.append("defs").selectAll("radialGradient")
            .data(vis.data[x])
            .enter()
            .append("radialGradient")
            .attr("id", function(d) { return "gradient-" + series })
            .attr("cx", "30%")
            .attr("cy", "30%")
            .attr("r", "65%");

        vis.gradientRadial.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", function(c) {return d3.rgb(vis.colorCircles(series)).brighter(1);})
        vis.gradientRadial.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", function(c) {return vis.colorCircles(series); })
        vis.gradientRadial.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", function(c) {return d3.rgb(vis.colorCircles(series)).darker(1.5);})

//        vis.g.selectAll(".nodes").remove();
        var cRadar = vis.g.selectAll(".nodes")
            .data(y).enter()
            .append("svg:circle")
            .attr("class", "radar-chart-serie"+series)
            .attr("r", function(j){ return vis.scaleRadius(j.value) })
            .attr("alt", function(j){return Math.max(j.value, 0)})
            .attr("cx", function(j, i){
                dataValues.push([
                    vis.cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/vis.cfg.maxValue)*vis.cfg.factor*Math.sin(i*vis.cfg.radians/vis.total)),
                    vis.cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/vis.cfg.maxValue)*vis.cfg.factor*Math.cos(i*vis.cfg.radians/vis.total))
                ]);
                return vis.cfg.w/2*(1-(Math.max(j.value, 0)/vis.max)*vis.cfg.factor*Math.sin(i*vis.cfg.radians/vis.total));
            })
            .attr("cy", function(j, i){
                return vis.cfg.h/2*(1-(Math.max(j.value, 0)/vis.max)*vis.cfg.factor*Math.cos(i*vis.cfg.radians/vis.total));
            })
            .attr("data-id", function(j){return j.area})
            .style("stroke", vis.colorCircles(series)).style("fill-opacity", .9)
            .style("fill", function(d){ return "url(#gradient-" + series +")"; })
            .on('mouseover', vis.radar_tip.show)
            .on('mouseout', vis.radar_tip.hide);


        /*            .on('mouseover', function (d){
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
                        console.log(d.axis + " | " + label + " | "+ d.value)

                        vis.radarTip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        vis.radarTip.html((d.axis) + " " + label + ": <br><span>" + (d.value) + "</span>")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        vis.radarTip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
        */
        series++;
    });



}
