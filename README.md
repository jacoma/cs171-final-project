# Smells Fishy

[Link to project website](https://jacoma.github.io/smellsfishy.github.io/)

Link to Screencast

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
 
 ---
 ### Landings, Population and Subsidies  

- **parcoords.js**  
Standalone javascript file that creates the parallel coordinates vis and the firsherman detail visualization.  
Two svg's are createdin the div. The three data sources are queued up and calls loadCompareData.   
In **parallelCompare** function, the selected year is captured and an array with just that years data for subsidies and landings.  
The populations data is then iterated and an array created for the combined dataset.  
The scales are created for each of the dimensions by reading the keys.
The countries are hard coded into the scale since they have no numeric value.  
An axis is drawn for each of the dimensions. a path is then created across the axis to create the parallel path.  
A mouseover event highlights the target path, and a click event triggers the update of the fisherman detail vis.
Brushing is applied to each of the axis to allow the user to select countries with a range of any of the dimensions.
Clicking on a country will also clear any brushing already applied as the dataset is typically too small to require this level of drill down.
A reset brush button is also available if the user wants to reset all brushes.  
The brush function itself filters the dimensions data so that the fisherman vis is updated to remove any un-selected elements from the vis.  
The **createFishing** function takes an optional country argument. If no country is passed, the vis is created with all countries in order of fish landings.
If a country is passed, the year over year data for the country will be displayed. The country will be passed if a user clicks on the country in the parallel coordinates vis.
The "fishing line" is scaled to the subsidies and the fish image is scaled to the amount of fish landings for the country.  
A blank rect is placed behind the vis itself to allow the user to 'grab' the vis for panning.
The zoom extent is set to 1 since zooming does not offer any value to the user



 ---
 ### Subsidies by Country with Employment, Exports and Fleet
 
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
