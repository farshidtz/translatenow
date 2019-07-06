app.filter('sortByRankFilter', function () {
  return function (items) {
    var sortable = [];
    for (var key in items){ sortable.push(items[key]); }
    sortable.sort( function(a, b) { return a.rank - b.rank; } );
    return sortable;
  };
});
