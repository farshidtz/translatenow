"use strict";


// Global
var onChangeTimeout = 300; // ms


angular.module('app.controllers', [])

.filter('listSortFilter', function () {
  return function (items) {
    var sortable = [];
    for (var key in items){
      sortable.push(items[key]);
    }

    sortable.sort(
      function(a, b) {
        return a.rank - b.rank;
      }
    )
    return sortable;
  };
})

.controller('nameItCtrl', function($scope,$ionicPopup, focus) {

  // Local vars
  $scope.list = {};
  $scope.languages = languages;

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
    var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=opensearch&redirects=resolve&limit=10&search="+text;
    $.ajax({
      url: url,
      dataType: "jsonp",
      success: function( result ) {
        $scope.getProperties(result[1], result[2]);
      }
    });
  }

  $scope.disambiguate = function(ambiguousTitle, links, rank){
    links.forEach(function(link, i){
      var title = link['title'];
      //console.log(title);
      var re = new RegExp("^"+ambiguousTitle+" [(][a-z|A-Z]+[)]$");
      var matched = re.test(title);
      if(matched){
        //console.warn(title);
        $.ajax({
          url: "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&prop=pageterms|pageimages&format=json&pithumbsize=100&titles="+title,
          dataType: "jsonp",
          success: function(res) {
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
            $scope.$apply();
            $scope.getTranslations(title);
          }
        });
      }
    });
  }

  $scope.getProperties = function(titles, snippets){
    $scope.list = {};
    var pending = titles.length;

    function seq(i){
      //console.log(i);
      $.ajax({
        url: "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&prop=pageterms|pageimages|links&format=json&pithumbsize=100&&pllimit=max&titles="+titles[i],
        dataType: "jsonp",
        success: function(res) {
          var page = first(res.query.pages)
          // Get page description
          var descr = "no description";
          if(page.hasOwnProperty('terms') && page.terms.hasOwnProperty('description') && page.terms.description.length>0){
            descr = page.terms.description[0];
          }
          // Check if this is Wikipedia disambiguation page
          var links = [];
          if(descr.includes("disambiguation")){
            $scope.disambiguate(titles[i], page.links, i);
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
            $scope.$apply();
            $scope.getTranslations(titles[i]);
          }

          pending--;
          if(pending>0){
            seq(i+1);
          }
        }
      });

    };
    seq(0);
  }

  $scope.getTranslations = function(title) {
    $.ajax({
      url: "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&prop=langlinks&lllang="+localStorage['lang-to']+"&format=json&titles="+title,
      dataType: "jsonp",
      success: function(res) {
        var page = first(res.query.pages);
        var word = "";
        if(page.hasOwnProperty('langlinks') && page.langlinks.length>0 && page.langlinks[0].hasOwnProperty('*')){
          word = page.langlinks[0]['*'];
        }

        if(word != ""){
          if($scope.textArea != ""){
            //console.warn("***", title, $scope.list[title]);
            $scope.list[title].trans.push(word);
            $scope.getSynonyms(title, word);
          }
        } else {
          // No match in the destination language
          if($scope.textArea != ""){
            //console.warn("***", title, $scope.list[title]);
            //delete $scope.list[title];
            $scope.list[title].trans.push("No match");
            $('#loading').addClass("invisible");
          }
        }
        $scope.$apply();
      }
    });
  }


  $scope.getSynonyms = function(title, word){
    $.ajax({
      url: "https://"+localStorage['lang-to']+".wikipedia.org/w/api.php?action=query&list=backlinks&format=json&blfilterredir=redirects&bltitle="+word,
      dataType: "jsonp",
      success: function(res) {
        res.query.backlinks.forEach(function(backlink){
          if($scope.textArea != ""){
            $scope.list[title].trans.push(backlink.title);
            $('#loading').addClass("invisible");
            $scope.$apply();
          }
        });
      }
    });
  }


  $scope.inputChanged = function() {

    if($scope.textArea == ""){
      //$scope.spinner = "hidden";
      $scope.list = [];
      $("#loading").addClass("invisible");
    } else {
      $('#loading').removeClass("invisible");
    }

    clearTimeout($scope.inputChangedResponse);
    $scope.inputChangedResponse = setTimeout(function(){
      $scope.updateList($scope.textArea);
    }, onChangeTimeout);
  }

    //popUp for showing details of list item
    $scope.showAlert = function() {
      var htmlTemplate = $('#ni-popup-template').html();
      var alertPopup = $ionicPopup.alert({
        title: 'Farshid!',
        template: htmlTemplate
      });
      alertPopup.then(function(res) {
        console.log('Thank you for not eating my delicious ice cream cone');
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

// Static content
// https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&format=json&titles=Main%20Page&lllimit=100&llprop=langname
//var languages = [{"lang":"ar","langname":"Arabic","*":""},{"lang":"bg","langname":"Bulgarian","*":""},{"lang":"bs","langname":"Bosnian","*":""},{"lang":"ca","langname":"Catalan","*":""},{"lang":"cs","langname":"Czech","*":""},{"lang":"da","langname":"Danish","*":""},{"lang":"de","langname":"German","*":""},{"lang":"el","langname":"Greek","*":""},{"lang":"eo","langname":"Esperanto","*":""},{"lang":"es","langname":"Spanish","*":""},{"lang":"et","langname":"Estonian","*":""},{"lang":"eu","langname":"Basque","*":""},{"lang":"fa","langname":"Persian","*":""},{"lang":"fi","langname":"Finnish","*":""},{"lang":"fr","langname":"French","*":""},{"lang":"gl","langname":"Galician","*":""},{"lang":"he","langname":"Hebrew","*":""},{"lang":"hr","langname":"Croatian","*":""},{"lang":"hu","langname":"Hungarian","*":""},{"lang":"id","langname":"Indonesian","*":""},{"lang":"it","langname":"Italian","*":""},{"lang":"ja","langname":"Japanese","*":""},{"lang":"ka","langname":"Georgian","*":""},{"lang":"ko","langname":"Korean","*":""},{"lang":"lt","langname":"Lithuanian","*":""},{"lang":"lv","langname":"Latvian","*":""},{"lang":"ms","langname":"Malay","*":""},{"lang":"nl","langname":"Dutch","*":""},{"lang":"nn","langname":"Norwegian Nynorsk","*":""},{"lang":"no","langname":"Norwegian","*":""},{"lang":"pl","langname":"Polish","*":""},{"lang":"pt","langname":"Portuguese","*":""},{"lang":"ro","langname":"Romanian","*":""},{"lang":"ru","langname":"Russian","*":""},{"lang":"sh","langname":"Serbo-Croatian","*":""},{"lang":"simple","langname":"Simple English","*":""},{"lang":"sk","langname":"Slovak","*":""},{"lang":"sl","langname":"Slovenian","*":""},{"lang":"sr","langname":"Serbian","*":""},{"lang":"sv","langname":"Swedish","*":""},{"lang":"th","langname":"Thai","*":""},{"lang":"tr","langname":"Turkish","*":""},{"lang":"uk","langname":"Ukrainian","*":""},{"lang":"vi","langname":"Vietnamese","*":""},{"lang":"zh","langname":"Chinese","*":""}];
var languages = {"ar":"Arabic","eu":"Basque","bs":"Bosnian","bg":"Bulgarian","ca":"Catalan","zh":"Chinese","hr":"Croatian","cs":"Czech","da":"Danish","nl":"Dutch","en":"English","eo":"Esperanto","et":"Estonian","fi":"Finnish","fr":"French","gl":"Galician","ka":"Georgian","de":"German","el":"Greek","he":"Hebrew","hu":"Hungarian","id":"Indonesian","it":"Italian","ja":"Japanese","ko":"Korean","lv":"Latvian","lt":"Lithuanian","ms":"Malay","no":"Norwegian","nn":"Norwegian Nynorsk","fa":"Persian","pl":"Polish","pt":"Portuguese","ro":"Romanian","ru":"Russian","sr":"Serbian","sh":"Serbo-Croatian","simple":"Simple English","sk":"Slovak","sl":"Slovenian","es":"Spanish","sv":"Swedish","th":"Thai","tr":"Turkish","uk":"Ukrainian","vi":"Vietnamese"};

/* // Parse language codes
var x = {};
var z = {};
var keys = [];
for(var i=0; i<languages.length; i++){
  x[languages[i].lang] = languages[i].langname;
  z[languages[i].langname] = languages[i].lang;
  keys.push(languages[i].langname);
}
keys.sort();
var y = {};
for(var i=0; i<languages.length; i++){
  y[z[keys[i]]] = x[z[keys[i]]];
}
y['en'] = 'English';
console.log(JSON.stringify(y));
*/
