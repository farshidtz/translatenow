/* Bing Controller */
app.bingCtrl = function($scope, $http)
{
  // Local vars
  localStorage['bingToken-expires'] = new Date();
  // // Secret encoder
  // var clientSec = "subscription key";
  // var clientID = "nameit-translator";
  // var s = btoa(btoa(clientID).length + btoa(btoa(clientSec)) + btoa(clientID));
  // console.log(s); // divide this into 3 sections

  var bing2 = "NUVVWGRPTWtrMVRVUk5kMDlVU1RSTmFrSnRUVlJWZV";

  $scope.getBingToken = function(callback){
    var url = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
    var s = atob($scope.bing1+bing2+$scope.bing3);
    var cs = atob(s.substr(2,s.length-s.substr(0,2)-2));
    return new Promise(function(resolve, reject) {
      $http({
        method: 'POST',
        url: url,
        timeout: $scope.canceler.promise,
        headers: {'Ocp-Apim-Subscription-Key': atob(cs)}
      }).
      success(function(res, status, headers, config) {
        console.log("Renewed bing token");
        localStorage['bingToken'] = res;
        var expires = 600; // seconds
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
      var url = "https://api.microsofttranslator.com/V2/Ajax.svc/Translate?from="+localStorage['lang-from']+"&to="+localStorage['lang-to']+"&text="+text;
      $http({
        method: 'GET',
        url : url,
        timeout: $scope.canceler.promise,
        cache: true,
        headers: {'Authorization': "Bearer "+localStorage['bingToken']}
      }).
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
