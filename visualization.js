/**
 * Main funtion to generate a time curve based on the provided coordinates
 * @param {*} dataset The coordinates of the points representing each revision
 * @param {*} differences The table of differences between the revisions that was used to generate the dataset 
 * @param {*} revisions The list of revisions that corresponds to the coordinates in the dataset
 */
function timeCurves(dataset, differences, revisions){

  var info = d3.select(".info");
  info.style("font-size","12px")
  let div = d3.select(".graph");
  
  let width = 500;
  let height = width;

  let dimensions = div.node().getBoundingClientRect();
  let xPadding = (dimensions.width - dimensions.height)/2;
  let yPadding = 10;

  graph = div.append("svg")
    .attr("height",dimensions.height)
    .attr("width",dimensions.width)
    .append("g");

  //set up color scale for curves
  var colorScale = d3.scaleLinear().domain([1,dataset[0].length]).range([d3.lab("red"),d3.lab("aqua")])

  //Legend
  var legend = graph.append("svg")
    .attr("x", 5)
    .attr("y",dimensions.height - 30)
    .append("g")
    .attr("stroke-width", 1)
    .attr("stroke", "black");
  legend.append("rect")
    .attr("height",10)
    .attr("width",10)
    .attr("fill","aqua")
    legend.append("rect")
    .attr("height",10)
    .attr("width",10)
    .attr("fill","red")
    .attr("y", 15);
  legend.append("text").text("Older").attr("y", 9).attr("x", 12).attr("font-size",10);
  legend.append("text").text("Newer").attr("y", 23).attr("x", 12).attr("font-size",10);

  //create scales for axes
  var x = d3.scaleLinear().range([yPadding+xPadding,width+xPadding-yPadding]);
  var y = d3.scaleLinear().range([yPadding,height-yPadding]);

  //set domain of axes
  //use same domain for both - minimum range that fits all the data
  var xCoords = dataset[0];
  var yCoords = dataset[1];
  var xMax = d3.extent(xCoords)[1];
  var yMax = d3.extent(yCoords)[1];
  var xMin = d3.extent(xCoords)[0];
  var yMin = d3.extent(yCoords)[0];
  var max = Math.max(xMax,yMax);
  var min = Math.min(xMin,yMin);
  x.domain([min,max]);
  y.domain([min,max]);

  //format data for easier retrieval
  const originalCoords = new Array(dataset[0].length);
  for (let i = 0; i<originalCoords.length; i++){
      originalCoords[i] = new Array(2);
      originalCoords[i][0] = dataset[0][i] 
      originalCoords[i][1] = dataset[1][i]
  }

  //rotate so that oldest point is in top left
  var startX = (originalCoords[originalCoords.length-1][0]);
  var startY = (originalCoords[originalCoords.length-1][1]);
  let midX = xMin + (xMax - xMin)/2;
  let midY = yMin + (yMax - yMin)/2;
  if (startX > midX){
    //flip horizontal
    for (i in originalCoords) {
      originalCoords[i][0] -= 2*(originalCoords[i][0] - midX);
    }
  }
  if (startY > midY) {
    //flip vertical
    for (i in originalCoords) {
      originalCoords[i][1] -= 2*(originalCoords[i][1] - midY);
    }
  }
 
  //record duplicate points so they can be indicated on the time curve
  var duplicates = recordDuplicatePoints(originalCoords);

  //coords that will be used to plot the time curve
  var currentCoords = originalCoords;

  //declare graph elements
  var halos = graph.append("g");
  var curves = graph.append("g");
  var points = graph.append("g");
  var controlPoints = new Array(originalCoords.length);
  var selectedPoint = null;
  var locationClicked;
  var highlight = graph.append("circle")
    .attr("r",10)
    .attr("fill","red")
    .attr("opacity",0);
  highlight.lower();

  //set intial transition duration to 0 to skip first transition
  var duration = 0;
  function t(){
    let t = d3.transition()
      .ease(d3.easeSin)
      .duration(duration);
    return t;
  }

  //create time curve
  updateData();

  //subsequent changes to data will animate
  duration = 1000;

  //function to create the time curve using the current value of currentCoords
  function updateData(){
    
    //create curves
    let newCurves = curves.selectAll("path")
      .data(currentCoords)
    newCurves.enter()
      .append("path")
      .merge(newCurves)
      .transition(t())
      .attr("d",(d,i) => curve(d,i,x,y,controlPoints,currentCoords))
      .attr("fill", "none")
      .attr("stroke", (d,i)=>(colorScale(i)))
      .attr("stroke-width",1);

    //create halos around duplicate points
    let duplicateHalos = halos.selectAll("circle")
      .data(currentCoords)
    duplicateHalos.enter()
      .append("circle")
      .merge(duplicateHalos)
      .transition(t())
      .attr("cx", function (d) {return x(d[0]); })
      .attr("cy", function (d) {return y(d[1]); })
      .attr("r",10)
      .attr("opacity",function(d,i) {
        if (isDuplicatePoint(duplicates,originalCoords[i])) {
          return 0.1;
        }
        return 0;
      });

    //create points
    let newPoints = points.selectAll("circle")
      .data(currentCoords)
    newPoints.enter()
      .append("circle")
      .merge(newPoints)
      .on("mouseover", function(d,i) { 
        var index = currentCoords.indexOf(i);
        var user = revisions[index]["user"];
        var timestamp = revisions[index]["timestamp"];
        var comment = revisions[index]["comment"];
        if (comment === "") {
          comment = "no comment";
        }
        info.html("<b><u>Revision details</u></b><p><b>Author:</b> "+user+"<p><b>Timestamp:</b> "+timestamp+"<p><b>Comment:</b> "+comment);
      })
      .on("mousemove", function (d){
      })
      .on("mouseleave", function(d) {
        info.html("");
      })
      .on("click",function(d,i) {
        if (selectedPoint != null && i[0] == selectedPoint[0] && i[1] == selectedPoint[1]){
          selectedPoint = null;
          currentCoords = originalCoords;
          updateData();
        } else {
          locationClicked = d3.pointer(d);
          focus(i);
        }
      })
      .transition(t())
      .attr("cx", function (d) {return x(d[0]); })
      .attr("cy", function (d) {return y(d[1]); })
      .attr("r", 3)

    //highlight selected point with red halo
    if (selectedPoint != null){
      highlight.attr("opacity",0.3)
      .attr("cx", (locationClicked[0]))
      .attr("cy", (locationClicked[1]));
      highlight.transition(t())
        .attr("cx", x(selectedPoint[0]))
        .attr("cy", y(selectedPoint[1]));
    } else {
      highlight.attr("opacity",0);
    }
  }

  //Zoom feature
  var zoom = d3.zoom()
    .scaleExtent([1, 20]) 
    .on("zoom", updateZoom);

  //Create clickable area for panning and resetting zoom
  graph.append("rect").lower()
    .attr("width",dimensions.width)
    .attr("height",dimensions.height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(zoom)
    .on("dblclick.zoom",resetZoom);
  
  function updateZoom() {

    var zoomX = d3.zoomTransform(this).rescaleX(x);
    var zoomY = d3.zoomTransform(this).rescaleY(y);
  
    points.selectAll("circle")
      .attr("cx",(d)=>(zoomX(d[0])))
      .attr("cy",(d)=>(zoomY(d[1])));
    
    halos.selectAll("circle")
      .attr("cx",(d)=>(zoomX(d[0])))
      .attr("cy",(d)=>(zoomY(d[1])));
    
    if (selectedPoint != null) {
      highlight.attr("cx", zoomX(selectedPoint[0]))
        .attr("cy", zoomY(selectedPoint[1]));
    }

    //zoom in curves as well
    graph.selectAll("path")
      .attr("d",(d,i) => curve(d,i,zoomX,zoomY,controlPoints,currentCoords));
  }

  function resetZoom(){
    graph.selectAll("rect").call(zoom.transform, d3.zoomIdentity.scale(1));
  }


  //additional functions 

  /**
   * Moves points so that they accurately reflect the distance to the selected point
   * @param {*} point the selected point
   */
  function focus(point){

    var index = currentCoords.indexOf(point);
    var differencesFromPoint = differences[index];
    var accurateCoords = new Array(originalCoords.length);
    var start = originalCoords[index];

    for(let i = 0; i<originalCoords.length; i++) {
      var end = originalCoords[i];
      accurateCoords[i] = calculatePositionOnLine(start,end,differencesFromPoint[i]);
    }

    let minX = accurateCoords[0][0];
    let minY = accurateCoords[0][1];
    let maxX = accurateCoords[0][0];
    let maxY = accurateCoords[0][1];

    for(let i = 0; i<accurateCoords.length; i++) {
      let coord = accurateCoords[i];
      minX = Math.min(minX,coord[0]);
      minY = Math.min(minY,coord[1]);
      maxX = Math.max(maxX,coord[0]);
      maxY = Math.max(maxY,coord[1]);
    }

    //rescale new points so that they fall within the graph area
    var originalDataRange = x.domain(); 

    var focusScale = d3.scaleLinear().range(originalDataRange);
    focusScale.domain([Math.min(minX,minY),Math.max(maxX,maxY)]);

    for(let i = 0; i<accurateCoords.length; i++) {
    accurateCoords[i][0] = focusScale(accurateCoords[i][0]);
    accurateCoords[i][1] = focusScale(accurateCoords[i][1]);
    }
    currentCoords = accurateCoords;
    selectedPoint = [focusScale(start[0]),focusScale(start[1])];

    updateData();
  }

  /**
   * 
   * @param {*} start the selected point
   * @param {*} end the point to move
   * @param {*} distance the accurate distance that should be between the selected point and the moved point
   * @returns {*} the new coordinates of the moved point
   */
  function calculatePositionOnLine(start,end,distance) {
    newCoord = new Array(2);
      var slope = (end[1]-start[1])/(end[0]-start[0]);
    if (isNaN(slope) || math.abs(slope) == Infinity){
      //case start and end points are the same or the line from start to end is vertical
      if (slope == -Infinity){
        newCoord = [start[0],start[1]-distance];
      } else {
        newCoord = [start[0],start[1]+distance];
      }
    } else {
      var M = math.norm([1,slope]);
      var U = math.matrix([1/M,slope/M]);
      var movedPoint;

      //get new points
      if (start[0]<end[0]) {
        movedPoint = math.add(math.matrix([start[0],start[1]]),math.multiply(U,distance));
      } else {
        movedPoint = math.subtract(math.matrix([start[0],start[1]]),math.multiply(U,distance));
      }
      newCoord[0] = movedPoint.get([0]);
      newCoord[1] = movedPoint.get([1]);
    }
    return newCoord;
  }  

  /**
   * @param {*} points the coordinates
   * @returns A map with all the coordinates as keys 
   * and whethor or not they have a duplicate point as the value
   */
  function recordDuplicatePoints(points) {
    console.log(differences)
    var duplicates = new Map();
    for (let i = 0; i<points.length; i++) {
      let p = points[i];
      let key = Math.round(p[0])+","+Math.round(p[1]);
      if (duplicates.has(key)) {
        duplicates.set(key,true);
      } else {
        duplicates.set(key,false);
      }
    }
    return duplicates;
  }

  function isDuplicatePoint(duplicates, p) {
    var key = Math.round(p[0])+","+Math.round(p[1]);
    return (duplicates.get(key));
  }
}
  