
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

//static content
    $scope.languages = [{"lang":"ar","langname":"Arabic","*":""},{"lang":"bg","langname":"Bulgarian","*":""},{"lang":"bs","langname":"Bosnian","*":""},{"lang":"ca","langname":"Catalan","*":""},{"lang":"cs","langname":"Czech","*":""},{"lang":"da","langname":"Danish","*":""},{"lang":"de","langname":"German","*":""},{"lang":"el","langname":"Greek","*":""},{"lang":"eo","langname":"Esperanto","*":""},{"lang":"es","langname":"Spanish","*":""},{"lang":"et","langname":"Estonian","*":""},{"lang":"eu","langname":"Basque","*":""},{"lang":"fa","langname":"Persian","*":""},{"lang":"fi","langname":"Finnish","*":""},{"lang":"fr","langname":"French","*":""},{"lang":"gl","langname":"Galician","*":""},{"lang":"he","langname":"Hebrew","*":""},{"lang":"hr","langname":"Croatian","*":""},{"lang":"hu","langname":"Hungarian","*":""},{"lang":"id","langname":"Indonesian","*":""},{"lang":"it","langname":"Italian","*":""},{"lang":"ja","langname":"Japanese","*":""},{"lang":"ka","langname":"Georgian","*":""},{"lang":"ko","langname":"Korean","*":""},{"lang":"lt","langname":"Lithuanian","*":""},{"lang":"lv","langname":"Latvian","*":""},{"lang":"ms","langname":"Malay","*":""},{"lang":"nl","langname":"Dutch","*":""},{"lang":"nn","langname":"Norwegian Nynorsk","*":""},{"lang":"no","langname":"Norwegian","*":""},{"lang":"pl","langname":"Polish","*":""},{"lang":"pt","langname":"Portuguese","*":""},{"lang":"ro","langname":"Romanian","*":""},{"lang":"ru","langname":"Russian","*":""},{"lang":"sh","langname":"Serbo-Croatian","*":""},{"lang":"simple","langname":"Simple English","*":""},{"lang":"sk","langname":"Slovak","*":""},{"lang":"sl","langname":"Slovenian","*":""},{"lang":"sr","langname":"Serbian","*":""},{"lang":"sv","langname":"Swedish","*":""},{"lang":"th","langname":"Thai","*":""},{"lang":"tr","langname":"Turkish","*":""},{"lang":"uk","langname":"Ukrainian","*":""},{"lang":"vi","langname":"Vietnamese","*":""},{"lang":"zh","langname":"Chinese","*":""}];

  })

