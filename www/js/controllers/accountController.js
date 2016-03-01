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
          var userPhotos = userInfo.data.photos;////this is all of a signed-in user's
          function mapPhotos(){
            var soldPhotos = [];
            for (var i = 0; i < userPhotos.length; i++) {
              if(userPhotos[i].status === 'sold'){
                console.log('sold one');
                soldPhotos.push(userPhotos[i]);
              }
            }
            return soldPhotos;
          }
          $scope.soldPhotos = mapPhotos();
          console.log($scope.soldPhotos);

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
