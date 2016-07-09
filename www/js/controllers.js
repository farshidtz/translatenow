angular.module('app.controllers', [])

.controller('nameItCtrl', function($scope) {

  $scope.list = [
    { name: '', snippet: ''}
  ];

  $scope.updateList = function(text){
    console.log(text);
    let url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+text+"&namespace=0&format=json";
    $.ajax({
      url: url,
      "Content-Type": "application/json; charset=UTF-8",
      "Origin": "http://localhost:8100",
      dataType: "jsonp",
      success: function( result ) {
        //console.log(result);
        let list = [];
        result[1].forEach(function(title, i){
          let image;
          $.ajax({
            url: "https://en.wikipedia.org/w/api.php?action=query&titles="+title+"&prop=pageimages&format=json&pithumbsize=100",
            "Content-Type": "application/json; charset=UTF-8",
            "Origin": "http://localhost:8100",
            dataType: "jsonp",
            success: function(res) {
              console.log(res);
              $.each( res.query.pages, function( key, value ) {
                console.log(key, value);
                if(typeof value.thumbnail != "undefined"){
                  image = value.thumbnail.source;
                } else {
                  image = "";
                }
                console.log(image);
              });

            }
          });

          list.push(
            {
              name: title,
              snippet: result[2][i],
              img: image
            }
          );
        });


        console.log(list);
        $scope.list = list;
      }
    });
  }

  let onChangeTimeout = 500; // ms
  $scope.inputChanged = function() {
    clearTimeout($scope.inputChangedResponse);
    $scope.inputChangedResponse = setTimeout(function(){
      $scope.updateList($scope.textArea);
    }, onChangeTimeout);
  }


})
