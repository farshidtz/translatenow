/* Bing Controller */
app.bingCtrl = function($scope, $http)
{
  // Local vars
  localStorage['bingToken-expires'] = new Date();
  // // Secret encoder
  // var clientSec = "q3w6XS7A6qk9asSBePAJr6ZhkrG7YRFZrt4zGad9zPWQ7TgtrWVeSM9wpr6WF4ty";
  // var clientID = "nameit-translator";
  // var s = btoa(btoa(clientID).length + btoa(btoa(clientSec)) + btoa(clientID));

  var bing2 = "c5aE0wcElUakZzVTFKc2NIbGtSRkkyVWpKR2EwOVljRkZXTVVVelZrZGtNR05zWkZkYVZrNU9UMW";

  $scope.getBingToken = function(callback){
    var url = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13/";
    var s = atob($scope.bing1+bing2+$scope.bing3);
    var cs = atob(s.substr(2,s.length-s.substr(0,2)-2));
    return new Promise(function(resolve, reject) {
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
          'client_id': atob(s.substr(s.length-s.substr(0,2),s.length)),
          'client_secret': atob(cs),
          'scope': "http://api.microsofttranslator.com",
          'grant_type': 'client_credentials'
        }
      }).
      success(function(res, status, headers, config) {
        console.log("Renewed bing token");
        localStorage['bingToken'] = res.access_token;
        var expires = parseInt(res.expires_in);
        localStorage['bingToken-expires'] = new Date(new Date().getTime() + (expires-60)*1000);
        resolve(status);
      }).
      error(function(data, status, headers, config) {
        if(ionic.Platform.isWebView()){
          //$scope.wait.done("getBingTranslation");
          $scope.showError(status, data);
          reject(status);
        }
      });
    }); // promise
  };

  $scope.getBingTranslation = function(text){
    //console.log("bing", text);
    // in a browser
    if(!ionic.Platform.isWebView()){
      $scope.list["bing:"+text] = {
        rank: -1, title: text, descr: "", img: NoImageThumb, type: 'bing', trans: ["bing translation"]
      };
      $scope.wait.done("getBingTranslation");
      return;
    }

    var translate = function(){
      var token = encodeURIComponent("Bearer "+localStorage['bingToken']);
      var url = "https://api.microsofttranslator.com/V2/Ajax.svc/Translate?appId="+token+"&from="+localStorage['lang-from']+"&to="+localStorage['lang-to']+"&text="+text;
      $http.get(url, {timeout: $scope.canceler.promise, cache: true}).
      success(function(res, status, headers, config) {
          if(res.includes("Exception")){
            console.warn("Bing Exception:", res);
            $scope.wait.done("getBingTranslation"); //$scope.showError("Bing", res);
            return;
          }

          // Success
          $scope.list["bing:"+text] = {
            rank: -1,
            title: text,
            descr: "",
            img: NoImageThumb,
            type: 'bing',
            trans: [res.replace(/['"]+/g, '')]
          };
          $scope.wait.done("getBingTranslation");
      }).
      error(function(data, status, headers, config) {
        $scope.wait.done("getBingTranslation"); //$scope.showError("bing "+status, data);
        //$scope.log.push("getBingTranslation:"+status);
        console.warn("bing translation error:", status, data);
      });
    };

    if(Date.parse(localStorage['bingToken-expires']) < new Date()){
      $scope.getBingToken().then(translate);
    } else {
      translate();
    }

  }
}
