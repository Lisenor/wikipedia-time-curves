//getRevisions function adapted from https://www.mediawiki.org/wiki/API:Revisions#JavaScript
getRevisions = function(title,limit){
    return new Promise((resolve,reject) => {

    var url = "https://en.wikipedia.org/w/api.php?origin=*"
        + "&action=query"
        + "&prop=revisions"
        + "&titles="+title
        + "&rvprop=timestamp|user|comment|ids"
        + "&rvlimit="+limit
        + "&continue=||"
        + "&format=json";

    fetch(url)
        .then(function(response){
            return response.json();})
        .then(function(response) {

            var pages = response.query.pages;
      
            for (var p in pages) {
                if (p == -1) {
                    reject("Not a valid article title");
                }
                var revisions = pages[p].revisions;
            } 

            resolve(revisions);
           
        }).catch(function(error){
            console.log(error);
            reject("Network error, could not fetch revisions");
        });
    });
}

async function caculateRevisionDifferences(title,revisions){
   
    //calculate the number of comparisons necessary and create array to hold promises
    var comparisons = 0;
    for (let i = 0; i<revisions.length; i++) {
        for (let j = 0; j<revisions.length && j<i; j++) {
            comparisons++;
        }
    }        
    var promises = new Array(comparisons);
    var index = 0;
    
    //create difference matrix
    var differences = new Array(revisions.length);
    for (let i = 0; i<revisions.length; i++){
        differences[i] = new Array(revisions.length);
        for (let j = 0; j<revisions.length && j<=i; j++){
            if (j == i){
                differences[i][j] = 0;
            } else {
                var first = revisions[i]["revid"];
                var second = revisions[j]["revid"];
                //add request to array of promises
                promises[index] = getDiff(title,first,second);
                index++;                   
            }  
        }
    }
    
    //send request at a limited rate
    var limit = 1;
    var requests = new Array(limit);
    var results = new Array(promises.length);
    var resultsIndex = 0;

    index = 0;
    for (let i = 0; i<promises.length; i++){
        //add pending request
        requests[index] = promises[i];
        index++;
    
        if ((index == limit)||i == promises.length - 1) {
            //send requests
            try {
                var result = await Promise.all(requests)
            } catch(error){
                throw(error);
            }
            /*  await new Promise(function(resolve) {
                console.log("waiting")
                setTimeout(resolve, 1000)})
            */
            //reset requests
            index = 0;
            if (promises.length - 1 - i < limit && i != promises.length - 1) {
                requests = new Array(promises.length - 1 - i);
            }
        }
    }

    //fill in difference matrix with results
    index = 0;
    for (let i = 0; i<revisions.length; i++) {
        for (let j = 0; j<revisions.length && j<i; j++) {
            promises[index].then(function(response){
                differences[i][j] = response;
                differences[j][i] = response
            });
            index++;
        }
    }
    return (differences);
}

 