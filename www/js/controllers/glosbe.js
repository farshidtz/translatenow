/* Glosbe Controller */
app.glosbeCtrl = function($scope, $http)
{
  // Local vars
  $http.GetOrJsonp = ionic.Platform.isWebView()? $http.get : $http.jsonp;

  $scope.getGlosbeTranslation = function(text, fallback){
    //console.log("bing", text);

    var url = "https://glosbe.com/gapi/translate?format=json&from="+localStorage['lang-from']+"&dest="+localStorage['lang-to']+"&phrase="+text
      +(ionic.Platform.isWebView()?"":"&callback=JSON_CALLBACK");
    $http.GetOrJsonp(url, {timeout: $scope.canceler.promise, cache: true}).
    success(function(res, status, headers, config) {
      if(res.result != "ok"){
        $scope.wait.done("getGlosbeTranslation: result not ok");
        return;
      }
      if(res.tuc.length==0 || !res.tuc[0].hasOwnProperty('phrase')){
        $scope.wait.done("getGlosbeTranslation: no translation");
        fallback();
        return;
      }
      var trans = [];
      for(var i=0; i<res.tuc.length && i<3; i++){
        if(res.tuc[i].hasOwnProperty('phrase')){
          trans.push(res.tuc[i].phrase.text);
        }
      }
      var descr = "";
      if(res.tuc[0].hasOwnProperty('meanings') && res.tuc[0].meanings.length>0){
        descr = res.tuc[0].meanings[0].text;
      }

      // Success
      $scope.list["glosbe:"+text] = {
        rank: -1,
        title: text,
        descr: descr,
        img: NoImageThumb,
        type: 'glosbe',
        trans: trans
      };
      $scope.wait.done("getGlosbeTranslation");
    }).
    error(function(data, status, headers, config) {
      $scope.wait.done("getGlosbeTranslation");
      $scope.showError(status, data);
      //$scope.log.push("getBingTranslation:"+status);
      //console.warn("glosbe translation error:", status, data);
    });

  }
}
