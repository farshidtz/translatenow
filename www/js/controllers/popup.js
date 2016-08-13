/* Popup Controller */
app.popupCtrl = function($scope, $ionicPopup, $http){
  // Local vars
  var errorPopped = false;
  $http.GetOrJsonp = ionic.Platform.isWebView()? $http.get : $http.jsonp;

  // Show popup for wikipedia article
  $scope.showPopup = function(item, lang) {
    var title = item.title;

    if(item.type=='bing'){
      return;
    } else if(lang=='to' && item.type=='nomatch'){
      return;
    } else if(lang=='to') {
      title = item.trans[0];
    }

    var url = "https://"+localStorage['lang-'+lang]+".wikipedia.org/w/api.php?format=json&action=query&redirects&prop=extracts|pageimages&exintro=&explaintext=&pithumbsize="+PopupThumbSize+"&titles="+title;
    $http.GetOrJsonp(urlFormat(url), {cache: true}).
    success(function(res, status, headers, config) {
      var page = first(res.query.pages);
      // Get thumbnail
      var thumb = "";
      if(page.hasOwnProperty('thumbnail')){
        thumb = page.thumbnail.source;
      }
      $scope.article = {
        title: title,
        img: thumb,
        summary: page.extract
      };

      $ionicPopup.alert({
        //title: title,
        cssClass:'ni-details-alert',
        templateUrl: 'popup-template.html',
        scope: $scope,
        buttons: [
          {
            text: 'Close',
            type: 'button-assertive'
          },
          {
            text: 'Wikipedia',
            type: 'button-calm',
            onTap: function(e) {
              var url = "https://"+localStorage['lang-'+lang]+".wikipedia.org/wiki/"+title;
              window.open(url, '_system');
            }
          }
        ]
      });

    }).
    error(function(data, status, headers, config) {
      $scope.showError(status, data);
    });

  };

  $scope.showError = function(title, message) {
    $scope.wait.done("showError");
    if(title==0){
      console.log("Error "+title+": ", message);
      return;
    }

    // Don't show if there is a popup shown
    if(errorPopped){
      return;
    }

    console.warn("Error "+title+": ", message);
    errorPopped = true;
    $ionicPopup.alert({
      title: title,
      template: message
    }).then(function(){
      errorPopped = false;
    });
  };
}
