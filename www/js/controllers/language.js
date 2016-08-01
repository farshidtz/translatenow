/* Language Controller */
app.languageCtrl = function($scope, $ionicScrollDelegate)
{
  // Initialize the language selection
  $scope.initLangSelection = function(){
    if(!('lang-from' in localStorage)){
      // defaults
      localStorage['lang-from'] = DefaultLang.From;
      localStorage['lang-to'] = DefaultLang.To;
    }
    $scope.langFromSelected = localStorage['lang-from'];
    $scope.langToSelected = localStorage['lang-to'];
  }();

  $scope.langFromChanged = function(code){
    console.log(code);
    localStorage['lang-from'] = code;
    $scope.langFromSelected = code;
    $scope.textArea = "";
    $scope.list = {};
    $ionicScrollDelegate.scrollTop();
    focus('input');
  }

  $scope.langToChanged = function(code){
    console.log(code);
    localStorage['lang-to'] = code;
    $scope.langToSelected  = code;
    $ionicScrollDelegate.scrollTop();
    $scope.updateList($scope.textArea);
  }

  $scope.swapLanguages = function(){
    // Swap language selection in memory
    var lf = localStorage['lang-from'];
    localStorage['lang-from'] = localStorage['lang-to'];
    localStorage['lang-to'] = lf;

    $scope.langFromSelected = localStorage['lang-from'];
    $scope.langToSelected = localStorage['lang-to'];
    $scope.updateList($scope.textArea);
  }
}
