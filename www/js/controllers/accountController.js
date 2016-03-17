angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  })

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken', '$cordovaStatusbar', '$ionicScrollDelegate'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken, $cordovaStatusbar, $ionicScrollDelegate){
    console.log($cordovaStatusbar.isVisible);
    ionic.Platform.fullScreen();/////removes the status bar from the app
    /////global variables
    $scope.showSold      = false;
    $scope.showSubmitted = true;
    $scope.showFinance   = false;
    $scope.hamburgerOpen = false;
    $scope.introModal    = false;
    $scope.introCounter  = 0;

    // function to add tabs back if coming from camera (where tabs are removed)
    function addTabs(){
      $('ion-tabs').removeClass('tabs-item-hide');
    }
    addTabs();

    /////begin intro modal stuff////
    ////////////////////////////////
    console.log($(window).height());
    setInterval(function(){
      var heightVar = $(window).height();
      $('.swipeIntro').height(heightVar);
    }, 10);
    function introSwipeLeft(){
      console.log('swiping');
      if($scope.introCounter < 3 && $scope.introCounter >=0){
        $scope.introCounter++;
        console.log($scope.introCounter);
        $('.swipeIntroRow').animate({
          marginLeft: -($scope.introCounter*100)+"%"
        }, 200);
      }
      else if($scope.introCounter >= 3){
        exitIntro();
        $scope.introCounter = 0;
      }
    }
    $scope.introSwipeLeft = introSwipeLeft;

    function introSwipeRight(){
      if($scope.introCounter > 0){
        $scope.introCounter--;
        console.log($scope.introCounter);
        $('.swipeIntroRow').animate({
          marginLeft: -($scope.introCounter*100)+"%"
        }, 200);
      }
    }
    $scope.introSwipeRight = introSwipeRight;

    /////function to exit the intro modal
    function exitIntro(){
      $('.tab-nav').css({
        height: 49+"px"
      })
      $scope.introModal = false;
      $scope.hamburgerOpen = false;
      $('.submittedRow').height('130px');
      $('.singleSubmissionModal').height('667px');
    }
    $scope.exitIntro = exitIntro;

    function openIntro(){
      $scope.introModal = true;
      $scope.hamburgerOpen = false;
      $('.submittedRow').height("0px");
      $('.singleSubmissionModal').height('0px');
    }
    $scope.openIntro = openIntro;
    ////////end intro swipe modal stuff
    ///////////////////////////////////

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
      $ionicScrollDelegate.scrollTop(true);
    }
    $scope.openSubmission = openSubmission;

    function backToRepeat(modalType){
      var x = document.getElementById("repeatContainer");
      x.style.marginRight = 0;
      console.log(modalType);
      if(modalType == 'submission'){
        $('.singleSubmissionModal').css({
          marginLeft: "100%"
        });
      }
      $('.singleImageModal').css({
        marginLeft: "100%"
      });
      $('.repeatContainer').css({
        marginRight: "0%"
      });
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

    /////signout option
    function hamburgerSignout(){
      window.localStorage.webToken = '';
      window.location.hash = "/signin"
    }
    $scope.hamburgerSignout = hamburgerSignout;

    /////banks hamburger button
    function goToBanking(){
      window.location.hash = "/bankinfo";
    }
    $scope.goToBanking = goToBanking;

    function closeHamburgerBody(evt){
      console.log(evt.currentTarget);
      if($(evt.currentTarget).hasClass("hamburgerSignout") == false){
        $scope.hamburgerOpen = false;
      }
    }
    $scope.closeHamburgerBody = closeHamburgerBody;


    console.log($ionicScrollDelegate);
    //////////logic for hamburger menu////////
    //////////////////////////////////////////


  }
