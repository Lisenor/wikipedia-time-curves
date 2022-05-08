/**
 * Adapted from https://www.mediawiki.org/wiki/API:Compare#JavaScript
 */
function getDiff(title,rev1,rev2) {
    return new Promise((resolve,reject) => {

    var url = "https://en.wikipedia.org/w/api.php?origin=*"
        + "&action=compare"
        + "&format=json"
        + "&fromrev="+rev1
        + "&torev="+rev2
        + "&prop=diffsize";

    fetch(url)
        .then(function(response){
            return response.json();})
        .then(function(response) {
            resolve(response.compare["diffsize"]);        
        }).catch(function(error){
            console.log(error);
            reject("Network error, could not fetch diff");
        });
    });
}

