"use strict";

// Global
var OnChangeTimeout = 300; // ms
var ListThumbSize = 100;
var PopupThumbSize = 400;
var DefaultThumb = "";
var app = angular.module('app.controllers', []);

app.controller('nameItCtrl', function($scope, $http, $q, $ionicPopup, $ionicScrollDelegate, focus) {
  // Initialize
  $scope.list = {};
  $scope.log = [];
  $scope.canceler = $q.defer();

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
    $('#loading').addClass("invisible");

    if($scope.textArea == ""){
      $ionicScrollDelegate.scrollTop();
      $scope.list = {};
      return;
    }

    $scope.inputChangedResponse = setTimeout(function(){
      $('#loading').removeClass("invisible");
      $ionicScrollDelegate.scrollTop();
      $scope.updateList($scope.textArea);
    }, OnChangeTimeout);
  }

}); // end controller
