"use strict";

// Global
var OnChangeTimeout = 300; // ms
var ListThumbSize = 100;
var PopupThumbSize = 400;
var DefaultThumb = "img/wikipedia.png";
var BingThumb = "img/bing.png";
var DefaultLang = {From:'en',  To:'de'};
var app = angular.module('app.controllers', []);

app.controller('nameItCtrl', function($scope, $http, $q, $ionicPopup, $ionicScrollDelegate, $ionicPlatform, $window, focus) {
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

  $ionicPlatform.ready(function() {
    if ($window.cordova && $window.cordova.plugins && $window.cordova.plugins.permissions) {
      var permissions = window.cordova.plugins.permissions;
      permissions.hasPermission(permissions.INTERNET, checkPermissionCallback, errorCallback);
    }
  });


  function checkPermissionCallback(status) {
    if(!status.hasPermission) {
      var errorCallback = function() {
        $scope.showError("No Internet", "The application does not work without internet connection.");
      }

      permissions.requestPermission(permissions.INTERNET, function(status) {
        if(!status.hasPermission){
          errorCallback();
        }
      }, errorCallback);
    }
  }

  $scope.hasConnection = function(){
    if(ionic.Platform.isWebView() && navigator.connection.type==Connection.NONE){
      return false;
    }
    return true;
  }

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
      $scope.updateList($scope.textArea);
    }, OnChangeTimeout);
  }

  $scope.updateList = function(input){
    if($scope.langFromSelected==$scope.langToSelected){
      $scope.showError("Oops!", "Cannot translate to the same language.");
      return;
    }
    if(!$scope.hasConnection()){
      $scope.showError("No Connection", "Cannot translate without an internet connection.");
      return;
    }
    if(typeof input != "undefined" && input != ""){
      $ionicScrollDelegate.scrollTop();
      $scope.list = {};
      $scope.wait.add(2);
      $scope.getWikiList($scope.textArea);
      $scope.getBingTranslation($scope.textArea);
    }
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
