angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl);

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken){

    var userToken = window.localStorage.webToken;
    function getUserPhotos(token){
      decodeToken(token)
      .then(function(decToken){
        console.log(decToken);
        userPhotos(decToken.data.userId)
        .then(function(userInfo){
          $scope.userInfo = userInfo.data;
          console.log($scope.userInfo);
          $scope.userPhotos = userInfo.data.photos;
        })
      })
    }
    getUserPhotos(userToken);
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

    function signoutUser(){
      console.log('yoyoy');
      window.localStorage.webToken = "";
      window.location.hash = "#/tab/upload";
      window.location.reload();
    }
    $scope.signoutUser = signoutUser;

  }
