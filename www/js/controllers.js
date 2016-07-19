"use strict";


// Global
var onChangeTimeout = 300; // ms


angular.module('app.controllers', [])

.filter('listSortFilter', function () {
  return function (items) {
    var sortable = [];
    for (var key in items){ sortable.push(items[key]); }
    sortable.sort( function(a, b) { return a.rank - b.rank; } );
    return sortable;
  };
})

.controller('nameItCtrl', function($scope, $http, $q, $ionicPopup, focus) {

  // Local vars
  $scope.list = {};
  $scope.languages = LANGUAGES;
  var canceler = $q.defer();

  // Initialize the language selection
  $scope.initLangSelection = function(){
    if(!('lang-from' in localStorage)){
      // defaults
      localStorage['lang-from'] = 'en';
      localStorage['lang-to'] = 'de';
    }
    $scope.langFromSelected = localStorage['lang-from'];
    $scope.langToSelected = localStorage['lang-to'];
  }();

  $scope.langFromChanged = function(code){
    console.log(code);
    localStorage['lang-from'] = code;
    $scope.textArea = "";
    $scope.list = {};
    focus('input');
  }

  $scope.langToChanged = function(code){
    console.log(code);
    localStorage['lang-to'] = code;
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

  $scope.kbButtonClicked = function(){
    focus('input');
  }

  $scope.updateList = function(text){
    if(text=="" || typeof text == "undefined")
    return;
    console.log(text);
    $('#loading').removeClass("invisible");
    var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?callback=JSON_CALLBACK&action=opensearch&redirects=resolve&limit=10&search="+text;
    $http.jsonp(url, {timeout: canceler.promise}).
    success(function(result, status, headers, config) {
      $scope.getProperties(result[1], result[2]);
    }).
    error(function(data, status, headers, config) {
      $scope.showError(status, data);
    });

  }

  $scope.getProperties = function(titles, snippets){
    $scope.list = {};
    var pending = titles.length;

    function seq(i){
      //console.log(i);
      var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?callback=JSON_CALLBACK&action=query&prop=pageterms|pageimages|links&format=json&pithumbsize=100&&pllimit=max&titles="+titles[i];
      $http.jsonp(url, {timeout: canceler.promise}).
      success(function(res, status, headers, config) {
        var page = first(res.query.pages)
        // Get page description
        var descr = "no description";
        if(page.hasOwnProperty('terms') && page.terms.hasOwnProperty('description') && page.terms.description.length>0){
          descr = page.terms.description[0];
        }
        // Check if this is Wikipedia disambiguation page
        var links = [];
        if(descr.toLowerCase().includes(DISAMBIGUATIONS[localStorage['lang-from']].toLowerCase())){
          if($scope.textArea != ""){
            $scope.disambiguate(titles[i], page.links, i);
          }
        } else {
          // Get thumbnail
          var thumb = "";
          if(page.hasOwnProperty('thumbnail')){
            thumb = page.thumbnail.source;
          }

          $scope.list[titles[i]] = {
            rank: i,
            title: titles[i],
            //snippet: snippets[i],
            descr: descr,
            img: thumb,
            trans: []
          };

          $scope.getTranslations(titles[i]);
        }

        pending--;
        if(pending>0){
          seq(i+1);
        }
      }).
      error(function(data, status, headers, config) {
        $scope.showError(status, data);
      });

    };
    seq(0);
  }

  $scope.disambiguate = function(ambiguousTitle, links, rank){
    links.forEach(function(link, i){
      var title = link['title'];
      //console.log(title);
      var re = new RegExp("^"+ambiguousTitle+" [(][a-z|A-Z]+[)]$");
      var matched = re.test(title);
      if(matched){
        //console.warn(title);
        var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?callback=JSON_CALLBACK&action=query&prop=pageterms|pageimages&format=json&pithumbsize=100&titles="+title;
        $http.jsonp(url, {timeout: canceler.promise}).
        success(function(res, status, headers, config) {
          var page = first(res.query.pages)
          // Get page description
          var descr = "no description";
          if(page.hasOwnProperty('terms') && page.terms.hasOwnProperty('description') && page.terms.description.length>0){
            descr = page.terms.description[0];
          }
          // Get thumbnail
          var thumb = "";
          if(page.hasOwnProperty('thumbnail')){
            thumb = page.thumbnail.source;
          }

          $scope.list[title] = {
            rank: rank,
            title: title,
            //snippet: snippets[i],
            descr: descr,
            img: thumb,
            trans: []
          } ;

          $scope.getTranslations(title);
        }).
        error(function(data, status, headers, config) {
          $scope.showError(status, data);
        });

      }
    });
  }

  $scope.getTranslations = function(title) {
    var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?callback=JSON_CALLBACK&action=query&prop=langlinks&lllang="+localStorage['lang-to']+"&format=json&titles="+title;
    $http.jsonp(url, {timeout: canceler.promise}).
    success(function(res, status, headers, config) {
      var page = first(res.query.pages);
      var word = "";
      if(page.hasOwnProperty('langlinks') && page.langlinks.length>0 && page.langlinks[0].hasOwnProperty('*')){
        word = page.langlinks[0]['*'];
      }

      if(word != ""){
        if($scope.textArea != "" && $scope.list.hasOwnProperty(title)){
          $scope.list[title].trans.push(word);
          $scope.getSynonyms(title, word);
        }
      } else {
        // No match in the destination language
        if($scope.list.hasOwnProperty(title)){
          //delete $scope.list[title];
          $scope.list[title].trans.push("No match");
          $('#loading').addClass("invisible");
        }
      }
    }).
    error(function(data, status, headers, config) {
      $scope.showError(status, data);
    });

  }


  $scope.getSynonyms = function(title, word){
    var url = "https://"+localStorage['lang-to']+".wikipedia.org/w/api.php?callback=JSON_CALLBACK&action=query&list=backlinks&format=json&blfilterredir=redirects&bltitle="+word;
    $http.jsonp(url, {timeout: canceler.promise}).
    success(function(res, status, headers, config) {
      res.query.backlinks.forEach(function(backlink){
        if($scope.list.hasOwnProperty(title)){
          $scope.list[title].trans.push(backlink.title);
          $('#loading').addClass("invisible");
        }
      });
    }).
    error(function(data, status, headers, config) {
      $scope.showError(status, data);
    });

  }


  $scope.inputChanged = function() {
    clearTimeout($scope.inputChangedResponse);
    canceler.resolve();
    canceler = $q.defer();
    $('#loading').addClass("invisible");

    if($scope.textArea == ""){
      $scope.list = [];
      return;
    }

    $scope.inputChangedResponse = setTimeout(function(){
      $('#loading').removeClass("invisible");
      $scope.updateList($scope.textArea);
    }, onChangeTimeout);
  }

  //popUp for showing details of list item
  $scope.showAlert = function(title) {

    var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?callback=JSON_CALLBACK&format=json&action=query&prop=extracts&exintro=&explaintext=&titles="+title;
    url = encodeURI(url);
    $http.jsonp(url).
    success(function(res, status, headers, config) {
      var page = first(res.query.pages);
      $scope.article = {
        img: $scope.list[title].img,
        summary: page.extract
      };
      $scope.$apply();
      var htmlTemplate = $('#ni-popup-template').html();
      $ionicPopup.alert({
        title: title,
        template: htmlTemplate
      }).then(function(res) {

      });

    }).
    error(function(data, status, headers, config) {
      $scope.showError(status, data);
    });

  };

  $scope.showError = function(title, message) {
    if(title==0){
      console.log("App Error "+title+": ", message);
      return;
    }
    $scope.list = [];
    $("#loading").addClass("invisible");
    $ionicPopup.alert({
      title: 'Error ' + title,
      template: message
    }).then(function(res) {
      console.warn("App Error "+title+": ", message);
    });
  };

}) // end controller


// Returns value of the first object
var first = function(objs){
  var value;
  $.each(objs, function(k,v){
    value = v;
    return false;
  });
  return value;
}
