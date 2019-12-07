# Smells Fishy

[Link to project website](https://jacoma.github.io/smellsfishy.github.io/)

[Link to Screencast](https://drive.google.com/drive/u/0/folders/0ANwQ8mygqUzKUk9PVA?fbclid=IwAR26hdrpK0Iw3OkPNE8KAlN6k9kcvYnmYKu9n37QbwYaIkK6R6NPmtN0Y5Q)

This repository contains our team's HTML file, our JS files and libraries, our CSS stylesheets, our .csv data, and the images included in the HTML.

The JS libraries we are using are:
- D3
- D3-tip
- D3-scale-chromatic
- D3-array
- JQuery
- Popper
- Queue

The rest of the .js files are our code.

In addition, we use Bootstrap to style our webpage layout.

The website has the following Visualizations which are each explained below:
- Fish landings by Species: Stacked Area Chart linked to Bar Chart for Country
- Landings, Population and Subsidies: Parallel Coordinates linked to custom view
- Subsidies by Country with Employment, Exports and Fleet: Line chart linked to bubble charts
- Statistics Data (no interaction)
- Aquaculture Pie Chart
 ---
 ### Fish Landings by Species
 - **main.js**
 The data is defined and the object created in main.js. Three arrays are also dynamically created from the fish landings dataset - one each for Country, Species, and Year. Finally, a MyEventHandler object is created to facilitate the filtering interaction capability between the stacked area chart and bar chart.

 - **vis.stackedArea.js**
 First in initVis(), the layout of the visualiation (svg) is created. The axes and scales for the visualization are defined using the arrays created in main.js (i.e. fish species, country). Likewise the path generators are built to be used later in the file after the data is wrangled. The tooltip for the stacked area chart is created followed by the legend which included event listeners for a user click. This event filters both the stacked area and horizontal bar charts.

In wrangleDate(), the display data is created by looping through each value in the years array as well as each fish species value in the species array (both created in main.js) and grabbing the "Sum of Value" which is the weight in tonnes of the fish landings. This output is then used to create the keys for the stacked area chart, then the stacked data itself using the d3.stack functions. Finally, an if statement checks to see which fish species may be selected by the user and filters accordingly.

In updateVis(), the domain of the y axis is updated with the appropriate range of the landings. The stacked area chart is then actually created. Four event listeners are used to apply interactions - click which will filter the dataset and subsequently the bar chart; mouseover which will highlight the moused over species and display the tooltip; mousemove which will update the tooltip values with the appropriate values for the specific species and year; mouseout which will hide the tooltip and stop the highlighting of a species selection. The axis are finally created.

responsify() makes the visualization scale to the size of the viewport. It first grabs the original dimensions of the svg then uses this ratio for scaling up or down.

onSelectionChange() updates two variables used to grab a user selection - speciesFilter and countryFilter. These are then used to filter the original dataset. wrangleData() is then called again.

 - **vis.barcharts.js**
 First in initVis(), the layout of the visualiation (svg) is created. The axes and scales for the visualization are also defined.

In wrangleDate(), the display data is created by nesting filteredData by each country and calculating a count of landings. This data is then sorted.

In updateVis(), the domain of the x and y axes is updated with the appropriate range of the landings and countries. The bar chart visualization is created. Three event listeners are used - click which changes the color of the selected bar and grabs the user selection and calls the MyEventHandler; mouseenter which changes the opacity of the highlighted bar; mouseleave which returns all bars to the original styles. The axes are finally created.

responsify() makes the visualization scale to the size of the viewport. It first grabs the original dimensions of the svg then uses this ratio for scaling up or down.

onSelectionChange() updates two variables used to grab a user selection - speciesFilter and countryFilter. These are then used to filter the original dataset. wrangleData() is then called again.
 
 ---
 ### Landings, Population and Subsidies  

- **parcoords.js**  
Standalone javascript file that creates the parallel coordinates vis and the firsherman detail visualization.  
Two svg's are createdin the div. The three data sources are queued up and calls loadCompareData.   
- In **parallelCompare** function, the selected year is captured and an array with just that years data for subsidies and landings.  
The populations data is then iterated and an array created for the combined dataset.  
The scales are created for each of the dimensions by reading the keys.
The countries are hard coded into the scale since they have no numeric value.  
An axis is drawn for each of the dimensions. a path is then created across the axis to create the parallel path.  
A mouseover event highlights the target path, and a click event triggers the update of the fisherman detail vis.
Brushing is applied to each of the axis to allow the user to select countries with a range of any of the dimensions.
Clicking on a country will also clear any brushing already applied as the dataset is typically too small to require this level of drill down.
A reset brush button is also available if the user wants to reset all brushes.  
The brush function itself filters the dimensions data so that the fisherman vis is updated to remove any un-selected elements from the vis.  
- The **createFishing** function takes an optional country argument. If no country is passed, the vis is created with all countries in order of fish landings.
If a country is passed, the year over year data for the country will be displayed. The country will be passed if a user clicks on the country in the parallel coordinates vis.
The "fishing line" is scaled to the subsidies and the fish image is scaled to the amount of fish landings for the country.  
A blank rect is placed behind the vis itself to allow the user to 'grab' the vis for panning.
The zoom extent is set to 1 since zooming does not offer any value to the user



 ---
 ### Subsidies by Country with Employment, Exports and Fleet
 
 - **subsidies_main.js** 
 Main javascript file that uses subsidies data to plot a line chart. 
 Subsidies data is first imported and matched with country codes from "CountryCodes.JSON". 
 updateVisualization() takes the data to plot a dynamic line chart along with tool tips. 
 changeSelection() is called whenever a different country is toggeled and filters data accordingly.    
 
 - **bubblechart.js**
 Main javascript file that creates a bubblechart visualization for Fleet, Export and Employment data in the updateVis() function using d3.forcesimulation. 
 Size and location of bubbles is correlated to their respective values for Fleet, Export and Employment. 
 A tool tip can also be toggled to show this specific data. 
 Additionally, colors of bubbles are assigned based on their subsidies value. 
 
 - **bubblevis.js**  
 Javascript file that handles Fleet, Export and Employment data processing. 
 wrangleData() processes data from these 3 sources as well as for subsidies and calls drawChart().
 updateBubbles() is called whenever the country or year filter changes and calls drawChart accordingly.
 drawChart() is responsible for handling filtered data dynamically, as well as updating the legend. 
 
 ---
 ### Statistics Data
 - **main.js**   
 The data is defined and the object created in main.js.   
 - **statobj.js**   
 is the object constructor. This takes in the parent element, 
 the data, the title and if opacity should be applied - the item should fade out.  
 In the initvis function, the svg is created, the scales and tooltips are set-up 
 and the title is created and added to the svg.  
 wrangleData will sort the data and call the updateVis function.  
 the updateVis adds the text label and image tot he svg, applying scales for the size and opacity.
 Mouse effects are created using the 'Tip' data in the data source.
 
 
 ---
 ### Aquaculture Pie Chart
 - **aquaculture.js** creates the aquaculture visualization.
 Timeseries data for aquaculture production from **aqua_timeseries.csv** is filtered by year to create a pie chart
 showing the percentage of aquaculture production done by each of our top 25 countries in the range of years we have 
 chosen. The **aqua_countries.csv** file matches the country names to their numerical codes, and is used to display 
 country names in the tooltips. The tooltips themselves are created using D3-tip, with the style defined in 
 **style.css**. A separate svg defined in aquaculture.js contains the legend for the pie chart.
 
 ---
 ### Archieve or unused files
- data/global_population_top.csv
-  data/landings_SA.csv
- subsidies.html
- testfile.html
- img/trout.svg
- js/bubblechart_jm.js
- js/bubblechart_phan_edits.js
- js/RadaraChart.js
- js/radarvis.js
- js/radarvis_test_phan.js
- js/statistics.js
- js/testfile.js
