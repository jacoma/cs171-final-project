
// SVG drawing area

var margin = {top: 100, right: 40, bottom: 60, left: 50};

var width = 520 - margin.left - margin.right,
		height = 450 - margin.top - margin.bottom;

var svg = d3.select("#viz-subsidies").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Date parser
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");

// 					******* AXES *******
// Create time scale for x-axis and linear scale for y axis
var xScale = d3.scaleTime()
	.range([0, width]);
var yScale = d3.scaleLinear()
	.range([height, 0]);
//Create x and y axes
var xAxis = d3.axisBottom()
	.scale(xScale);
var yAxis = d3.axisLeft()
	.scale(yScale);
//Create axes groups in svg
var yAxisGroup = svg.append("g")
	.attr("class", "y-axis axis");
var xAxisGroup = svg.append("g")
	.attr("class", "x-axis axis")
	.attr("transform", "translate(0," + height + ")");

var data = {};
var curr_data = [];

// Y label
var y_label = svg.append("text")
	.attr("class", "ylabel");
var initialline = svg.append("path")
	.attr("class","line")
	.style("stroke", "#ccc");

queue()
	.defer(d3.csv, "data/FisheriesSupport2000-2019.csv")
    .defer(d3.json, "data/CountryCodes.json")
	.await(function(error, SubsidiesData, CountryCodes){
		// --> PROCESS DATA

		var Years = [];
		// Cleans and processes the data
		SubsidiesData.forEach (function(d,i) {

			d.Country = CountryCodes[d.LOCATION];
            d.YEAR = parseDate(d.TIME);
            d.TIME = +d.TIME;
			d.Value = +d.Value;
			d.Value = d.Value/1000000;
			// Stores years to the year array
			if (+d.TIME >= 2008 && +d.TIME <= 2017) {
				Years.push(+d.TIME);
			}
		});
		// console.log(Years);
		// // Fills JSON container based on number of years
		// Years.forEach(function(d) {
		//     data[d] = {};
        // })
        //
        // // Adds country to year
        // SubsidiesData.forEach (function(d,i) {
        //     data[d.TIME][d.Country] = d;
        // });
        data = SubsidiesData;
        // Filters out data for between 2008 and 2018;
        new_data = data.filter(function(d) { return d.TIME > 2007; });
		new_data = new_data.filter(function(d) { return d.TIME < 2019; });
		data = new_data;

		// TO DO: Solve issue with countries not having dots in certain years.
        // console.log(data);

        // Initializes the default visualization by filtering data for total Funding
        var default_selection = "TOT";
        curr_data = [];
        data.forEach(function(d) {
            if (d.LOCATION == default_selection)
                curr_data.push(d);
        });
        // console.log(curr_data);

        // Makes call to create Selectbox
        createSelectBox(CountryCodes);

        // Makes first call to draw initial visualization
        updateVisualization(curr_data);

	});


// Render visualization
function updateVisualization(data) {

	// Get min, max date values for scaling
	var date_min = d3.min(data, function(d) {
		return d.YEAR;
	});
	var date_max = d3.max(data, function(d) {
		return d.YEAR;
	});
	// Update scales
	yScale.domain([0, d3.max(data, function(d) { return d.Value;})]);
	xScale.domain([date_min, date_max]);

	// Makes d3 line object to be called later
	line = d3.line()
			.x(function(d) {
				return xScale(d.YEAR);
			})
			.y(function(d) {
				return yScale(d.Value);
			});

	// Update visualization based on line
	subsidies_line = svg.selectAll(".line")
		// .attr("class", "line")
		.datum(data);
	// subsidies_line.exit().remove();
	//Enter
	var linepath = subsidies_line.enter()
		.append("path")
	//Update
		.merge(subsidies_line);

	linepath.transition()
		.duration(1600)
		.attr("d",line(data))
		.attr("class", "line")
		// .style("stroke", "#916b44")
		.attr("stroke-width", 1)
		.style("stroke", "#ccc");
	//Exit
	subsidies_line.exit().remove();

	// Draw circles for events
	yearly_value_pts = svg.selectAll("circle")
	// .attr("class", "line")
		.data(data);
	//Enter
	circles = yearly_value_pts.enter()
		.append("circle")
	//Update
		.merge(yearly_value_pts);
	circles.transition().duration(1600)
		.attr("r", 4)
		.attr("cx", function (d) { return xScale(d.YEAR); })
		.attr("cy", function (d) { return yScale(d.Value); })
		.attr("stroke-width", 1)
		.style("stroke", "#a7c9bb")
		.style("fill", "#a7c9bb");
	circles.on('mouseover', tool_tip.show)
		.on('mouseout', tool_tip.hide)
		.on('click', function(d) {
			// var curr_year = d.TIME;
            var curr_year;
            if (d.TIME <= 2018 && d.TIME >= 2005) {
                $("#bubble-year").val(d.TIME);
                curr_year = d.TIME;
            }
            else {
                $("#bubble-year").val(2005);
                curr_year = 2005;
                alert("No data available for this year. Please select a year between 2005 and 2018!");
            }
            var curr_selection = d3.select("#select-box").property("value");
			updateBubbles(curr_year, curr_selection);
		});
	//Exit
	yearly_value_pts.exit().remove();


	// Call axis functions
	// BEFORE CALLING THE BELOW NEED TO IMPLEMENT THIS FUNCTION SOMEWHERE:
	// var yAxis = d3.axisLeft()
	// 	.scale(y);
	svg.select(".y-axis")
		.transition()
		.duration(1600)
		.call(yAxis);
	svg.select(".x-axis")
		.transition()
		.duration(1600)
		.call(xAxis);

	svg.selectAll(".ylabel")
		.attr("x", -50)
		.attr("y", -10)
		.attr("text-anchor", "center")
		.attr("class", "ylabel")
		.style("font-size", "15px")
		.style("fill", "grey")
		.text(function(d) {
			return "$ Million USD"
		});

	svg.append("text")
		.attr("y", -60)
		.attr("x", 200)
		.attr("class","ylabel")
		.text(function() {
			return "Global Fisheries Funding from 2000 - 2018"
		})
		.attr("text-anchor","middle")
		.style("font-size", "25px")
		.attr("fill","Grey");
}


//Updates the visualization based on changes in user selection
function changeSelection() {
    // Gets current country selection
    var curr_selection = d3.select("#select-box").property("value");

    curr_data = [];
    data.forEach(function(d) {
        if (d.LOCATION == curr_selection)
            curr_data.push(d);
    });
    var curr_year = d3.select("#bubble-year").property("value");
	updateVisualization(curr_data);
	updateBubbles(curr_year,curr_selection);
}

/*
// Show details for a specific FIFA World Cup
function showEdition(d){
	$("#details").empty();
	$("#details").append(
		"<div id = callout>" +
		"<h2>" + d.EDITION + "</h2>" +
		"<table class='table table-hover'>" +
		"<tr><td>Location</td><td>" + d.LOCATION + "</td></tr>" +
		"<tr><td>Matches</td><td>" + d.MATCHES + "</td></tr>" +
		"<tr><td>Teams</td><td>" + d.TEAMS + "</td></tr>" +
		"<tr><td>Winner</td><td>" + d.WINNER + "</td></tr>" +
		"<tr><td>Goals</td><td>" + d.GOALS + "</td></tr>" +
		"<tr><td>Average Goals</td><td>" + d.AVERAGE_GOALS + "</td></tr>" +
		"<tr><td>Average Attendance</td><td>" + d.AVERAGE_ATTENDANCE + "</td></tr>" +
		"</table>" + "</div>"
	);
}
*/
function createSelectBox(CountryCodes) {
    // $("#details").append(
    //     "<label for='ranking-type'>Select Funding by Country:<label>
    //         <select class='form-control' id='select-box' onchange=changeSelection() autocomplete='off'>
    //             <option value='GOALS'>Goals</option>
    //             <option value='AVERAGE_GOALS'>Average Goals</option>
    //         <option value='MATCHES'>Matches</option>
    //             <option value='TEAMS'>Teams</option>
    //             <option value='AVERAGE_ATTENDANCE'>Average Attendance</option>
    //         </select>")
}

// ******* Setting up tooltips *******
var tool_tip = d3.tip()
	.attr("class", "d3-tip")
	.offset([-10, 199])
	.html(function(d){ return "Year: " + d.TIME + ", Amount of Funding: $" + Math.round(d.Value) + " Million USD" });

svg.call(tool_tip);
