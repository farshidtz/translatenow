"use strict";


// Global
let onChangeTimeout = 300; // ms


angular.module('app.controllers', [])

.controller('nameItCtrl', function($scope) {

  // Local vars
  $scope.list = [];
  $scope.languages = languages;

  //window.localStorage['lang-from'] = 'en';
  //window.localStorage['lang-to'] = 'de';
  //console.log(window.localStorage['lang-from']);
  $scope.langFromSelected = window.localStorage['lang-from'];
  $scope.langToSelected = window.localStorage['lang-to'];


  $scope.langFromChanged = function(code){
    console.log(code);
    window.localStorage['lang-from'] = code;
    //$scope.textArea = "";
    //$scope.list = [];
  }

  $scope.langToChanged = function(code){
    console.log(code, $scope.textArea);
    window.localStorage['lang-to'] = code;
    //$scope.updateList($scope.textArea);
  }

  $scope.updateList = function(text){
    console.log(text);
    let url = "https://"+window.localStorage['lang-from']+".wikipedia.org/w/api.php?action=opensearch&search="+text+"&namespace=0&format=json";
    $.ajax({
      url: url,
      dataType: "jsonp",
      success: function( result ) {

        $scope.getImages(result[1], result[2]);

      }
    });
  }


  $scope.getImages = function(titles, snippets){
    let list = new Array(titles.length);
    let pending = titles.length;
    //let titles = [];

    titles.forEach(function(title, i){
      //titles.push(title);
      $.ajax({
        url: "https://"+window.localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&titles="+title+"&prop=pageimages&format=json&pithumbsize=100",
        dataType: "jsonp",
        success: function(res) {


          let thumbnail = first(res.query.pages).thumbnail;
          let image;
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
    let pending = titles.length;
    let results = new Array(titles.length);
    titles.forEach(function(title, i){
      $.ajax({
        url: "https://"+window.localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&prop=langlinks&lllang="+window.localStorage['lang-to']+"&format=json&titles="+title,
        dataType: "jsonp",
        success: function(res) {
          //console.log(res.query.pages);
          let page = first(res.query.pages);
          let word;
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
        url: "https://"+window.localStorage['lang-to']+".wikipedia.org/w/api.php?action=query&list=backlinks&format=json&blfilterredir=redirects&bltitle="+title,
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
  let value;
  $.each(objs, function(k,v){
    value = v;
    return false;
  });
  return value;
}

// Static content
// https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&format=json&titles=Main%20Page&lllimit=100&llprop=langname
//let languages = [{"lang":"ar","langname":"Arabic","*":""},{"lang":"bg","langname":"Bulgarian","*":""},{"lang":"bs","langname":"Bosnian","*":""},{"lang":"ca","langname":"Catalan","*":""},{"lang":"cs","langname":"Czech","*":""},{"lang":"da","langname":"Danish","*":""},{"lang":"de","langname":"German","*":""},{"lang":"el","langname":"Greek","*":""},{"lang":"eo","langname":"Esperanto","*":""},{"lang":"es","langname":"Spanish","*":""},{"lang":"et","langname":"Estonian","*":""},{"lang":"eu","langname":"Basque","*":""},{"lang":"fa","langname":"Persian","*":""},{"lang":"fi","langname":"Finnish","*":""},{"lang":"fr","langname":"French","*":""},{"lang":"gl","langname":"Galician","*":""},{"lang":"he","langname":"Hebrew","*":""},{"lang":"hr","langname":"Croatian","*":""},{"lang":"hu","langname":"Hungarian","*":""},{"lang":"id","langname":"Indonesian","*":""},{"lang":"it","langname":"Italian","*":""},{"lang":"ja","langname":"Japanese","*":""},{"lang":"ka","langname":"Georgian","*":""},{"lang":"ko","langname":"Korean","*":""},{"lang":"lt","langname":"Lithuanian","*":""},{"lang":"lv","langname":"Latvian","*":""},{"lang":"ms","langname":"Malay","*":""},{"lang":"nl","langname":"Dutch","*":""},{"lang":"nn","langname":"Norwegian Nynorsk","*":""},{"lang":"no","langname":"Norwegian","*":""},{"lang":"pl","langname":"Polish","*":""},{"lang":"pt","langname":"Portuguese","*":""},{"lang":"ro","langname":"Romanian","*":""},{"lang":"ru","langname":"Russian","*":""},{"lang":"sh","langname":"Serbo-Croatian","*":""},{"lang":"simple","langname":"Simple English","*":""},{"lang":"sk","langname":"Slovak","*":""},{"lang":"sl","langname":"Slovenian","*":""},{"lang":"sr","langname":"Serbian","*":""},{"lang":"sv","langname":"Swedish","*":""},{"lang":"th","langname":"Thai","*":""},{"lang":"tr","langname":"Turkish","*":""},{"lang":"uk","langname":"Ukrainian","*":""},{"lang":"vi","langname":"Vietnamese","*":""},{"lang":"zh","langname":"Chinese","*":""}];
let languages = {"ar":"Arabic","eu":"Basque","bs":"Bosnian","bg":"Bulgarian","ca":"Catalan","zh":"Chinese","hr":"Croatian","cs":"Czech","da":"Danish","nl":"Dutch","en":"English","eo":"Esperanto","et":"Estonian","fi":"Finnish","fr":"French","gl":"Galician","ka":"Georgian","de":"German","el":"Greek","he":"Hebrew","hu":"Hungarian","id":"Indonesian","it":"Italian","ja":"Japanese","ko":"Korean","lv":"Latvian","lt":"Lithuanian","ms":"Malay","no":"Norwegian","nn":"Norwegian Nynorsk","fa":"Persian","pl":"Polish","pt":"Portuguese","ro":"Romanian","ru":"Russian","sr":"Serbian","sh":"Serbo-Croatian","simple":"Simple English","sk":"Slovak","sl":"Slovenian","es":"Spanish","sv":"Swedish","th":"Thai","tr":"Turkish","uk":"Ukrainian","vi":"Vietnamese"};
