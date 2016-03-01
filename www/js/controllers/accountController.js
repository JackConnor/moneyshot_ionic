angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl);

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar'];

  function acctCtrl($http, $state, $scope, navbar){
    console.log('acountttts');
    // alert('yooooooooo');
    console.log(navbar);
    $scope.navbar = navbar;
    function checkToken(){
      var maybeToken = window.localStorage.webToken;
      if(maybeToken.length > 4){
        console.log('signed in already');
        // takePicture();
      }
      else {
        console.log('no token');
        window.location.hash = "#/";
      }
    }
    // checkToken();

  }
