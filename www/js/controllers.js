angular.module('app.controllers', [])

.controller('nameItCtrl', function($scope) {

  $scope.list = [];
  $scope.updateList = function(text){

    console.log(text);
    let url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+text+"&namespace=0&format=json";
    $scope.ongoingReq = $.ajax({
      url: url,
      "Content-Type": "application/json; charset=UTF-8",
      "Origin": "http://localhost:8100",
      dataType: "jsonp",
      success: function( result ) {
        let list = new Array(result[1].length);
        let pending = result[1].length;

        result[1].forEach(function(title, i){
          $.ajax({
            url: "https://en.wikipedia.org/w/api.php?action=query&titles="+title+"&prop=pageimages&format=json&pithumbsize=100",
            "Content-Type": "application/json; charset=UTF-8",
            "Origin": "http://localhost:8100",
            dataType: "jsonp",
            success: function(res) {

              $.each( res.query.pages, function( key, value ) {
                let image;
                if(typeof value.thumbnail != "undefined"){
                  image = value.thumbnail.source;
                } else {
                  image = "";
                }

                list[i] = {
                  title: title,
                  snippet: result[2][i],
                  img: image
                };
                pending--;
                if(pending<=0){
                  $scope.list = list;
                  $scope.$apply();
                }

                return false;
              });

            }
          });

        });

      }
    });
  }

  let onChangeTimeout = 300; // ms
  $scope.inputChanged = function() {
    //if(typeof $scope.ongoingReq != "undefined"){
      //$scope.ongoingReq.abort();
    //}
    clearTimeout($scope.inputChangedResponse);
    $scope.inputChangedResponse = setTimeout(function(){
      $scope.updateList($scope.textArea);
    }, onChangeTimeout);
  }


})
