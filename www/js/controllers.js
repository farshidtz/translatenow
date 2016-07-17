"use strict";


// Global
var onChangeTimeout = 300; // ms


angular.module('app.controllers', [])

.controller('nameItCtrl', function($scope, focus) {

  // Local vars
  $scope.list = [];
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
    $scope.list = [];
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
    var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=opensearch&search="+text+"&namespace=0&format=json";
    $.ajax({
      url: url,
      dataType: "jsonp",
      success: function( result ) {

        $scope.getImages(result[1], result[2]);

      }
    });
  }


  $scope.getImages = function(titles, snippets){
    var list = new Array(titles.length);
    var pending = titles.length;
    //var titles = [];

    titles.forEach(function(title, i){
      //titles.push(title);
      $.ajax({
        url: "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&titles="+title+"&prop=pageimages&format=json&pithumbsize=100",
        dataType: "jsonp",
        success: function(res) {


          var thumbnail = first(res.query.pages).thumbnail;
          var image;
          if(typeof thumbnail != "undefined"){
            image = thumbnail.source;
          } else {
            image = "";
          }

          list[i] = {
            title: title,
            snippet: snippets[i],
            img: image,
            trans: []
          };

          pending--;
          if(pending<=0){
            if($scope.textArea != ""){
              $scope.list = list;
              $scope.$apply();
              $scope.getTranslations(titles);
            }
          }
        }
      });

    });
  }

  $scope.getTranslations = function(titles) {
    var pending = titles.length;
    var results = new Array(titles.length);
    titles.forEach(function(title, i){
      $.ajax({
        url: "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&prop=langlinks&lllang="+localStorage['lang-to']+"&format=json&titles="+title,
        dataType: "jsonp",
        success: function(res) {
          //console.log(res.query.pages);
          var page = first(res.query.pages);
          var word;
          if(typeof page.langlinks != "undefined"){
            word = page.langlinks[0]['*'];
          }

          //console.log(word);
          if(typeof word != "undefined"){
            results[i] = word;
            //console.log(word, i);
            if($scope.textArea != ""){
              $scope.list[i].trans.push(word);
            }
          } else {
            if($scope.textArea != ""){
              $scope.list[i].trans.push("No match");
              $('#loading').addClass("invisible");
            }
          }
          $scope.$apply();

          pending--;
          if(pending<=0){
            $scope.getSynonyms(results);
          }
        }
      });
    });

  }


  $scope.getSynonyms = function(titles){
    //console.log("getting syns");

    titles.forEach(function(title, i){

      //console.log(title);
      $.ajax({
        url: "https://"+localStorage['lang-to']+".wikipedia.org/w/api.php?action=query&list=backlinks&format=json&blfilterredir=redirects&bltitle="+title,
        dataType: "jsonp",
        success: function(res) {
          //console.log("done", res, i);
          res.query.backlinks.forEach(function(backlink){
            //console.log(backlink.title);
            if($scope.textArea != ""){
              $scope.list[i].trans.push(backlink.title);
              $('#loading').addClass("invisible");
              $scope.$apply();
            }
          });
        }
      });


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
