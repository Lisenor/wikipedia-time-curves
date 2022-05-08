//Code for creating the help menu

var menuOpen = false;

instructions = "<b><u>Instructions</u></b>" 
    + "<p><b>Search:</b> Enter an article title and the number of recent revisions to display. Press the draw button to create the time curve."
    + "<p><b>Revision details:</b> Hover over a point to display revision information."
    + "<p><b>Focused view:</b> Click on a point to see accurate differences from the selected point to all other points. Click on the point again to unselect."
    + "<p><b>Zoom:</b> Scroll to zoom in and out. Double click anywhere on the graph area to reset the view."
    + "<p><b>Pan:</b> Click and drag to pan."
 
let menu = d3.select(".graph")
    .append("div")
    .style("position","absolute")
    .style("background-color","white")
    .style("margin-left","471px")
    .style("margin-top","130px")
    .style("width","250px")
    .style("height","350px")
    .style("display","none");

menu.style("font-size","14px").html(instructions);

let helpButton = d3.select(".graph").append("text")
    .text("Help?")
    .style("margin-left","690px")
    .style("margin-top","475px")
    .style("position","absolute")
    .attr("font-size",10)
    .on("click",function(){
        if (menuOpen) {
            menuOpen = false;
            helpButton.text("Help?")
            helpButton.style("margin-left","690px")
            menu.style("display","none");
        } else {
            menuOpen = true;
            helpButton.text("Close(x)")
            helpButton.style("margin-left","675px")
            menu.style("display","block");
        }
    });
