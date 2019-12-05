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
