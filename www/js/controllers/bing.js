/* Bing Controller */
app.bingCtrl = function($scope, $http)
{
  // Local vars
  localStorage['bingToken-expires'] = new Date();
  var clientSec = "q3w6XS7A6qk9asSBePAJr6ZhkrG7YRFZrt4zGad9zPWQ7TgtrWVeSM9wpr6WF4ty";
  var clientID = "nameit-translator";

  $scope.getBingToken = function(){
    var url = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13/";
    $http({
      method: 'POST',
      url: url,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj){
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
        return str.join("&");
      },
      data: {
        'client_id': clientID,
        'client_secret': clientSec,
        'scope': "http://api.microsofttranslator.com",
        'grant_type': 'client_credentials'
      }
    }).
    success(function(res, status, headers, config) {
      console.log("Renewed bing token");
      localStorage['bingToken'] = res.access_token;
      var expires = parseInt(res.expires_in);
      localStorage['bingToken-expires'] = new Date(new Date().getTime() + (expires-60)*1000);
    }).
    error(function(data, status, headers, config) {
      if(ionic.Platform.isWebView()){
        $scope.showError(status, data);
      }
    });
  };
  setInterval(function(){
    if(ionic.Platform.isWebView() && Date.parse(localStorage['bingToken-expires']) < new Date()){
      //$scope.log.push("Expired @"+ localStorage['bingToken-expires']);
      $scope.getBingToken();
    }
  }, 1000);


  $scope.getBingTranslation = function(text){
    //console.log("bing", text);
    if(!ionic.Platform.isWebView()){
      $scope.list["bing:"+text] = {
        rank: -1,
        title: text,
        descr: "Directly translated using bing",
        img: BingThumb,
        type: 'bing',
        trans: ["bing translation"]
      };
      $scope.wait.done("getBingTranslation");
      return;
    }
    var token = encodeURIComponent("Bearer "+localStorage['bingToken']);
    var url = "https://api.microsofttranslator.com/V2/Ajax.svc/Translate?appId="+token+"&from="+localStorage['lang-from']+"&to="+localStorage['lang-to']+"&text="+text;
    $http.get(url, {timeout: $scope.canceler.promise, cache: true}).
    success(function(res, status, headers, config) {
        if(res.includes("Exception")){
          $scope.showError("Bing", res);
          return;
        }

        // Success
        $scope.list["bing:"+text] = {
          rank: -1,
          title: text,
          descr: "translated by Bing",
          img: BingThumb,
          type: 'bing',
          trans: [res.replace(/['"]+/g, '')]
        };
        $scope.wait.done("getBingTranslation");
    }).
    error(function(data, status, headers, config) {
      //$scope.showError("bing "+status, data);
      //$scope.log.push("getBingTranslation:"+status);
      console.warn("bing translation error:", data, status);
      $scope.wait.done("getBingTranslation");
    });

  }
}
