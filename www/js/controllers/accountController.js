angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  })

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken){

    /////global variables
    $scope.showSold      = true;
    $scope.showSubmitted = false;
    $scope.showFinance   = false;
    $scope.hamburgerOpen = false;

    var userToken = window.localStorage.webToken;
    // console.log(userToken);
    function getUserPhotos(token){
      decodeToken(token)
      .then(function(decToken){
        userPhotos(decToken.data.userId)
        .then(function(userInfo){
          $scope.userInfo = userInfo.data;
          var userPhotos = userInfo.data.photos;////this is all of a signed-in user's
          $scope.userPhotos = userPhotos.reverse();
          $scope.userSubmissions = userInfo.data.submissions.reverse();
          $scope.totalEarned = 0;
          function mapPhotos(){
            var soldPhotos = [];
            for (var i = 0; i < userPhotos.length; i++) {
              if(userPhotos[i].status === 'sold'){
                console.log('sold one');
                soldPhotos.push(userPhotos[i]);
                $scope.totalEarned += userPhotos[i].price;
              }
            }
            $scope.soldPhotos = soldPhotos.reverse();
          }
          mapPhotos();
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

    function openSingle(photoData){
      $scope.singlePhotoData = photoData;
      $('.repeatContainer').css({
        marginRight: "100%"
      });
      $('.singleSubmissionModal').css({
        marginRight: "100%"
      });
      $('.singleImageModal').css({
        marginLeft: 0
      })
      $('window').scrollTop(0);
    }
    $scope.openSingle = openSingle;

    function openSubmission(subInfo){
      $scope.singleSubmission = subInfo;
      $('.repeatContainer').css({
        marginRight: "100%"
      });
      $('.singleSubmissionModal').css({
        marginLeft: 0
      })
      $('window').scrollTop(0);
    }
    $scope.openSubmission = openSubmission;

    function backToRepeat(){
      var x = document.getElementById("repeatContainer");
      x.style.marginRight = 0;
      $('.singleSubmissionModal').css({
        marginLeft: "100%"
      })
      $('.singleImageModal').css({
        marginLeft: "100%"
      })
    }
    $scope.backToRepeat = backToRepeat;

    //////////////////////////////////////////
    //////////logic for hamburger menu////////
    function openHamburger(){
      $scope.hamburgerOpen = true;
    }
    $scope.openHamburger = openHamburger;

    function closeHamburger(){
      $scope.hamburgerOpen = false;
    }
    $scope.closeHamburger = closeHamburger;

    function hamburgerSignout(){
      window.localStorage.webToken = '';
      $state.go('tab.upload')
    }
    $scope.hamburgerSignout = hamburgerSignout;

    //////////logic for hamburger menu////////
    //////////////////////////////////////////

  }
