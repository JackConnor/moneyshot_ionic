angular.module('signupController', [])

  .controller('signupCtrl', signupCtrl);

  signupCtrl.$inject = ['$scope', 'signup', 'signin', 'newToken']

  function signupCtrl($scope, signup, signin, newToken){
    console.log('in the signin controller');

    function signoutUser(){
      window.sessionStorage.webToken = "";
      window.location.hash = "#/";
    }
    $scope.signoutUser = signoutUser;
  }
