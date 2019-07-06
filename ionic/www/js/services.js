angular.module('app.services', [])

.factory('focus', function ($rootScope, $timeout) {
  return function(name) {
    $timeout(function (){
      $rootScope.$broadcast('focusOn', name);
    });
  }
})
// .factory('BlankFactory', [function(){
//
// }])

.service('BlankService', [function(){

}]);
