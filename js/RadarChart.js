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
    vis.oMargin = {top:10, right:20, bottom:10, left:0};


    //radar chart configs
    vis.cfg = {
        //radius: 5,
        w: 300,
        h: 300,
        factor: 1,
        factorLegend: .85,
        levels: 3,
        maxValue: 0,
        radians: 2 * Math.PI,
        opacityArea: 0.5,
//        ToRight: 5,
        TranslateX: 65,
        TranslateY: 30,
        ExtraWidthX: 100,
        ExtraWidthY: 80
    };

    vis.hCircleChart = 50;

    vis.format = d3.format(",")

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
            return d.axis + series + ": " + d3.format("0.3s")(d.value) });


    vis.allAxis = (vis.data[0].map(function(i, j){ return i.axis}));
    //console.log(vis.allAxis);
    vis.total = vis.allAxis.length;
    vis.radius = vis.cfg.factor*Math.min(vis.cfg.w/2, vis.cfg.h/2);

    vis = this;
    //d3.select(vis.parentElement).select("svg").remove();
    vis.svgRadar = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", 800)
        .attr("height", 550);

    // group for the Radar
        vis.r = vis.svgRadar.append("g")
            .attr("width", vis.cfg.w+vis.cfg.ExtraWidthX)
            .attr("height", vis.cfg.h+vis.cfg.ExtraWidthY)
        .attr("transform", "translate(" + vis.cfg.TranslateX + "," + vis.cfg.TranslateY + ")");

    // group for teh circles
        vis.c = vis.svgRadar.append("g")
            .attr("height", 180)
            .attr("width", 800 - vis.oMargin.right - vis.oMargin.left)
            .attr("transform", "translate(" + vis.oMargin.left +", " + 380 +")");




    //Circular segments in Radar
    for(var j=0; j<vis.cfg.levels; j++){
        vis.levelFactor = vis.cfg.factor*vis.radius*((j+1)/vis.cfg.levels);
        vis.r.selectAll(".levels")
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

    //build the Radar axis
    vis.axis = vis.r.selectAll(".axis")
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


//circles Axis
    vis.cText = vis.c.selectAll("text")
        .data(vis.allAxis)
        .enter()
        .append("text")
        .attr("class", "legend")
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("x", function(j, i){
            return 25 + (25 * i);
        })
        .attr("y", 150)
        .text(function(t){ return t ;})
        .selectAll("text")
            .attr("transform", "rotate(-65)");


    vis.radar_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 100])
        .html(function (d) {
            return d.axis + ": " + vis.format(d.value)
        });
    vis.r.call(vis.radar_tip);

    this.updateRadar();
   // this.updateCircles();
}

RadarChart.prototype.updateRadar = function() {
console.log("updating radar");

    series=0;

    vis.data.forEach(function(y, x){
        //console.log(x);
        //console.log(d[x]);

        var circleMax
        switch(series){
            case 0:
                circleMax =30
                break;
            case 1:
                circleMax =25
                break;
            case 2:
                circleMax =20
                break;
        };

        vis.max = d3.max(vis.data[x], function(r) { return + r.value; });
        vis.min = d3.min(vis.data[x], function(r) { return + r.value; })
        vis.scaleRadius = d3.scaleLinear()
            .domain([vis.min, vis.max])
            .range([3,circleMax])

        vis.r.append("text")
            .attr("class", "legend")
            .attr("x", -60)
            .attr("id", "legend-" + series)
            .attr("y", series * 15)
            .style("font-size", "12px")
            .style("fill", function (d) {
                return vis.colorCircles(series);
            })
            .attr("text-anchor", "start")
            .html(function(d){
                switch(x){
                    case 0:
                        return "<a id='legend-'" + series +" onclick='removeLevel("+ series + ")'>- Population</a>"
                        break;
                    case 1:
                        return "<a id='legend-'" + series +" onclick='removeLevel("+ series + ")'>- Catch</a>"
                        break;
                    case 2:
                        return "<a id='legend-'" + series +" onclick='removeLevel("+ series + ")'>- Subsidies</a>"
                        break;
                }

            });

        vis.r.selectAll(".gradient-" + series).remove();
        vis.r.selectAll(".radar-chart-serie"+series).remove();

        vis.gradientRadial = vis.r.append("defs")
            .attr("class",function(d) { return "gradient-" + series } )
            .selectAll("radialGradient")
            //.remove()
            .data(vis.data[x])
            .enter()
            .append("radialGradient");
            vis.gradientRadial.merge(vis.gradientRadial)
                .transition().duration(250);
            vis.gradientRadial.attr("id", function(d) { return "gradient-" + series })
                .attr("class", function(d) { return "gradient-" + series } )
            .attr("cx", "30%")
            .attr("cy", "30%")
            .attr("r", "65%")
            .exit().remove();

        vis.gradientRadial.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", function(c) {return d3.rgb(vis.colorCircles(series)).brighter(1);})
        vis.gradientRadial.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", function(c) {return vis.colorCircles(series); })
        vis.gradientRadial.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", function(c) {return d3.rgb(vis.colorCircles(series)).darker(1.5);})

        vis.cRadar = vis.r.selectAll(".nodes")
            .data(y).enter()
            .append("svg:circle");
            vis.cRadar.merge(vis.cRadar)
                .transition().duration(500);
            vis.cRadar.attr("class", "radar-chart-serie"+series)
            .attr("r", function(j){ return vis.scaleRadius(j.value) })
            .attr("cx", function(j, i){
                return vis.cfg.w/2*(1-(Math.max(j.value, 0)/vis.max)*vis.cfg.factor*Math.sin(i*vis.cfg.radians/vis.total));
            })
            .attr("cy", function(j, i){
                return vis.cfg.h/2*(1-(Math.max(j.value, 0)/vis.max)*vis.cfg.factor*Math.cos(i*vis.cfg.radians/vis.total));
            })
            .style("stroke", vis.colorCircles(series)).style("fill-opacity", .9)
            .style("fill", function(d){ return "url(#gradient-" + series +")"; })
            .style("opacity", .5)
            .on('mouseover', vis.radar_tip.show)
            .on('mouseout', vis.radar_tip.hide)
            .on('click', function(d){ return createCountry(d.axis)});

/*          vis.r.selectAll(".radarlabel")
              .data(y)
              .enter()
              .append("text")
              .attr("x", function(j, i){
                  return vis.cfg.w/2*(1-(Math.max(j.value, 0)/vis.max)*vis.cfg.factor*Math.sin(i*vis.cfg.radians/vis.total));
              })
              .attr("class", "radarlabel")
              .attr("y", function(j, i){
            return ((vis.cfg.h/2) + series)*(1-(Math.max(j.value, 0)/vis.max)*vis.cfg.factor*Math.cos(i*vis.cfg.radians/vis.total));
        })
              .text(function(j){
                  switch(series){
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
*/
//            console.log("Series " + series);
        vis.c.append("text")
            .attr("class", "legend")
            .attr("x", 25)
            .attr("y", 15 + (series * 50))
            .style("fill", function (d) {
                return vis.colorCircles(series);
            })
            .attr("text-anchor", "start")
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


        // circle chart below radar chart

        vis.c.selectAll(".gradient-" + series).remove();
        vis.c.selectAll(".circle-chart-serie"+series).remove();
        vis.cCircle = vis.c.selectAll(".nodes")
            .data(y)
            .enter()
            .append("svg:circle");
        vis.cCircle.attr("class", "circle-chart-serie"+series)
            .attr("r", function(j){ return vis.scaleRadius(j.value) })
            .attr("cy", function(j, i){
                return 30 + (50 * series);
            })
            .attr("cx", function(j, i){
                return 25 + (25 * i);
            })
            .attr("data-id", function(j){return j.area})
            .style("stroke", vis.colorCircles(series)).style("fill-opacity", .9)
            .style("fill", function(d){ return "url(#gradient-" + series +")"; })
            .style("opacity", .5)
            .on('mouseover', vis.radar_tip.show)
            .on('mouseout', vis.radar_tip.hide)
            .on('click', function(d){ return createCountry(d.axis)});

        series++;
    });


}


function createCountry(country){
    console.log(country)


}

function removeLevel(level){
    console.log(level);
    switch(level){
        case 0:
            text= "Population"
            break;
        case 1:
            text="Catch"
            break;
        case 2:
            text ="Subsidies"
            break;
    }


    vis.r.selectAll(".radar-chart-serie" + level)
        .style("display", "none");

    vis.r.selectAll("#legend-" + level)
        .html("<a id='legend-'" + level +" onclick='addLevel("+ level + ")'>+ " + text +"</a>" )

}

function addLevel(level){
//    console.log(level);
    switch(level){
        case 0:
            text= "Population"
            break;
        case 1:
            text="Catch"
            break;
        case 2:
            text ="Subsidies"
            break;
    }

    vis.r.selectAll(".radar-chart-serie" + level)
        .style("display", "inline");

    vis.r.selectAll("#legend-" + level)
        .html("<a id='legend-'" + level +" onclick='removeLevel("+ level + ")'>- " + text +"</a>" )

}