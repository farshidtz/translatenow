/* Popup Controller */
app.popupCtrl = function($scope, $ionicPopup, $http){
  // Local vars
  var errorPopped = false;

  // Show popup for wikipedia article
  $scope.showPopup = function(title, lang) {

    if(lang=='to' && $scope.list[title].trans.length>0 && $scope.list[title].trans[0] != 'No match'){
      title = $scope.list[title].trans[0];
    } else if (lang=='to') {
      return;
    }

    var url = "https://"+localStorage['lang-'+lang]+".wikipedia.org/w/api.php?callback=JSON_CALLBACK&format=json&action=query&redirects&prop=extracts|pageimages&exintro=&explaintext=&pithumbsize="+PopupThumbSize+"&titles="+title;
    url = encodeURI(url);
    $http.jsonp(url, {cache: true}).
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
    if(title==0){
      console.log("http "+title+": ", message);
      return;
    }
    // Don't show if there is a popup shown
    if(errorPopped){
      return;
    }
    //$scope.list = [];
    $("#loading").addClass("invisible");
    console.warn("App Error "+title+": ", message);
    errorPopped = true;
    $ionicPopup.alert({
      title: 'Error ' + title,
      template: message
    }).then(function(){
      errorPopped = false;
    });
  };
}
