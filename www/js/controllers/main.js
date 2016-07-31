"use strict";

// Global
var OnChangeTimeout = 300; // ms
var ListThumbSize = 100;
var PopupThumbSize = 400;
var DefaultThumb = "img/wikipedia.png";
var BingThumb = "img/bing.png";
var app = angular.module('app.controllers', []);

app.controller('nameItCtrl', function($scope, $http, $q, $ionicPopup, $ionicScrollDelegate, focus) {
  // Initialize
  $scope.languages = LANGUAGES;
  $scope.list = {};
  $scope.log = [];
  $scope.canceler = $q.defer();
  $scope.loading = 0;

  // Sub-Controllers
  app.languageCtrl($scope, $ionicScrollDelegate);
  app.wikipediaCtrl($scope, $http);
  app.bingCtrl($scope, $http);
  app.popupCtrl($scope, $ionicPopup, $http);

  $scope.bringFocusToSearch = function(){
    //bring focus to input only if list object is empty
    if(Object.keys($scope.list).length === 0 && $scope.list.constructor === Object){
      focus('input');
    }
  }

  $scope.inputChanged = function() {
    clearTimeout($scope.inputChangedResponse);
    $scope.canceler.resolve();
    $scope.canceler = $q.defer();
    $scope.wait.allDone("inputChanged");

    if($scope.textArea == ""){
      $ionicScrollDelegate.scrollTop();
      $scope.list = {};
      return;
    }

    $scope.inputChangedResponse = setTimeout(function(){
      if($scope.textArea != ""){
        $ionicScrollDelegate.scrollTop();
        $scope.list = {};
        $scope.wait.add(2);
        $scope.updateList($scope.textArea);
        $scope.getBingTranslation($scope.textArea);
      }
    }, OnChangeTimeout);
  }

  // Keep track of pending tasks
  $scope.wait = {
    add: function(tasks){
      $scope.loading+=tasks;
      $("#loading").removeClass("invisible");
      //console.log("add", $scope.loading);
    },
    done: function(caller){
      $scope.loading--;
      //console.log("done",caller, $scope.loading);
      if($scope.loading<=0){
        $("#loading").addClass("invisible");
      }
    },
    allDone: function(caller){
      $scope.loading = 1;
      $scope.wait.done(caller);
    }
  }

}); // end controller
