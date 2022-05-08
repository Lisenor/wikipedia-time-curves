/*
Implementation of the curve algorithm described in:
B. Bach, C. Shi, N. Heulot, T. Madhyastha, T. Grabowski, and P. Dragicevic, 
“Time curves: Folding time to visualize patterns of temporal evolution in data,
” IEEE Trans. Vis. Comput. Graph., vol. 22, no. 1, pp. 559–568, 2016
 */
function curve(d,i,scaleX,scaleY,controlPoints,coords){
    if (i == 0) {
      //first case only
      controlPoints[i] = [math.matrix(d),math.matrix(d)];
    } else if (i < coords.length-1) {
      
      let p1 = coords[i-1];
      let p2 = coords[i];
      let p3 = coords[i+1];

      //Step 1: calculate control points for p2

      //get slope of line between p1 and p3
      var m = (p3[1] - p1[1])/(p3[0] - p1[0]);

      //check if p1 and p3 are confounded
      //points will be considered confounded if the distance 
      //between their x and y coordinates are both less than or equal to 5 pixels
      var confounded = false;
      if (Math.abs(scaleX(p1[0]) - scaleX(p3[0])) <= 5 && Math.abs(scaleY(p1[1]) - scaleY(p3[1])) <= 5){
        //slope of line which contains control points should be orthogonal to the line between p1 and p2 
        m = -1/((p2[1] - p1[1])/(p2[0] - p1[0]));
        confounded = true;
      }
  
      //distance between p1 and p2 multiplied by smoothing parameter
      var d1 = math.distance(p1,p2)*0.3
      //distance between p2 and p3 multiplied by smoothing parameter
      var d2 = math.distance(p2,p3)*0.3

      //get position of control points
      var c1;
      var c2;

      if (isNaN(m) || math.abs(m) == Infinity){
        //case where p1 and p2 are exactly the same or the control points lie on a vertical line
        c1 = math.matrix([p2[0],p2[1]-d1]);
        c2 = math.matrix([p2[0],p2[1]+d2]);
      } else {
        //get unit vector
        var M = math.norm([1,m])
        var U = math.matrix([1/M,m/M])
        if (confounded) {
          if (p1[0]<p2[0]){
            c1 = math.subtract(math.matrix([p2[0],p2[1]]),math.multiply(U,d1));
            c2 = math.add(math.matrix([p2[0],p2[1]]), math.multiply(U,d2));
          } else {
            c1 = math.add(math.matrix([p2[0],p2[1]]),math.multiply(U,d1));
            c2 = math.subtract(math.matrix([p2[0],p2[1]]), math.multiply(U,d2));
          }
        } else {
            if (p1[0]<p3[0]) {
            c1 = math.subtract(math.matrix([p2[0],p2[1]]),math.multiply(U,d1));
            c2 = math.add(math.matrix([p2[0],p2[1]]), math.multiply(U,d2));
          } else {
            c1 = math.add(math.matrix([p2[0],p2[1]]),math.multiply(U,d1));
            c2 = math.subtract(math.matrix([p2[0],p2[1]]), math.multiply(U,d2));
          } 
        }
      }
      //record control points
      controlPoints[i] = [c1,c2]

      //Step 2: draw curve from p1 to p2 using second control point of p1 and first control point of p2
      c1 = controlPoints[i-1][1];
      c2 = controlPoints[i][0]; 

      var path = d3.path();
      path.moveTo(scaleX(p1[0]),scaleY(p1[1]));
      path.bezierCurveTo(scaleX(c1.get([0])),scaleY(c1.get([1])),scaleX(c2.get([0])),scaleY(c2.get([1])),scaleX(p2[0]),scaleY(p2[1]));

      return path;

    } else {
      //last case
      let p1 = coords[i-1];
      var c1 = controlPoints[i-1][1];
      var path = d3.path();
      path.moveTo(scaleX(p1[0]),scaleY(p1[1]));
      path.bezierCurveTo(scaleX(c1.get([0])),scaleY(c1.get([1])),scaleX(coords[i][0]),scaleY(coords[i][1]),scaleX(coords[i][0]),scaleY(coords[i][1]))
     
      return path;
    }
  }