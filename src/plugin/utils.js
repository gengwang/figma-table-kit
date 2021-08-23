//Source: https://stackoverflow.com/questions/4492678/swap-rows-with-columns-transposition-of-a-matrix-in-javascript
function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
      return a.map(function(r) {
        return r[c];
      });
    });
}

export {transpose};