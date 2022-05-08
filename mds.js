/*Implementation of classical multidimensional scaling 
based on the algorithm presented in:
(2005) Classical Scaling. In: Modern Multidimensional Scaling. 
Springer Series in Statistics. Springer, New York, NY. pp. 261-267.
https://doi.org/10.1007/0-387-28981-X_12
*/
mdsClassic = function(dissimilarities) {
  
  //Matrix of squared dissimilarities
  var matrix = math.square(math.matrix(dissimilarities));
    
  var size = matrix.size()[0];
  var ones = math.multiply(math.ones(size,size),(1/size));

  //compute and apply double centering matrix
  var J = math.subtract(math.identity(size), ones);
  var B = math.multiply(-.5,J,matrix,J);

  //compute eigendecomposition
  var eigs = math.eigs(B,1);
  var values = eigs.values;

  //get 2 largest eigenvalues
  var min1Index = 0;
  var min2Index = 1;
  
  for (let i = 1; i<size; i++){
    if (values.get([i])>values.get([min1Index])){
      min2Index = min1Index;
      min1Index = i;
    } else if (values.get([i])>values.get([min2Index])){
      min2Index = i;
    }
  }

  var value1 = values.get([min1Index]);
  var value2 = values.get([min2Index]);

  //corresponding eigenvectors
  var vector1 = math.column(eigs.vectors,min1Index);
  var vector2 = math.column(eigs.vectors,min2Index);
  var vectors = math.concat(vector1,vector2);

  //compute coordinates
  var largestValues = math.matrix([[value1,0],[0,value2]]);
  var coords = math.multiply(vectors, math.sqrt(largestValues));

  var xCoords = new Array(size);
  var yCoords = new Array(size);

  for(let i = 0; i<size; i++) {
    xCoords[i] = coords.subset(math.index(i,0));
    yCoords[i] = coords.subset(math.index(i,1));
  }
  return [xCoords,yCoords];
};