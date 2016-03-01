angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl);

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken){

    /////global variables
    $scope.showSold      = true;
    $scope.showSubmitted = false;
    $scope.showFinance   = false;

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

    function showSoldFunc(){
      $scope.showSold      = true;
      $scope.showSubmitted = false;
      $scope.showFinance   = false;
    }
    $scope.showSoldFunc = showSoldFunc;

    function showSubmittedFunc(){
      $scope.showSold      = false;
      $scope.showSubmitted = true;
      $scope.showFinance   = false;
    }
    $scope.showSubmittedFunc = showSubmittedFunc;

    function showFinanceFunc(){
      $scope.showSold      = false;
      $scope.showSubmitted = false;
      $scope.showFinance   = true;
    }
    $scope.showFinanceFunc = showFinanceFunc;

    // checkToken();

  }
