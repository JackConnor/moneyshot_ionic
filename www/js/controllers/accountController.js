angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl);

  acctCtrl.$inject = ['$http', '$scope', 'navbar'];

  function acctCtrl($http, $scope, navbar){
    console.log(navbar);
    $scope.navbar = navbar;


  }
