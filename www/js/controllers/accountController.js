angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  })

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken', '$cordovaStatusbar', '$ionicScrollDelegate'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken, $cordovaStatusbar, $ionicScrollDelegate){
    // setTimeout(function(){
    //   history.forward()
    // }, 3000);
    console.log($cordovaStatusbar.isVisible);
    // ionic.Platform.fullScreen();/////removes the status bar from the app
    /////global variables
    $scope.showSold       = true;
    $scope.showSubmitted  = false;
    $scope.showFinance    = false;
    $scope.hamburgerOpen  = false;
    $scope.introModal     = false;
    $scope.sellModal     = false;
    $scope.introCounter   = 0;
    $scope.scrollPosition = 0;

    // function to add tabs back if coming from camera (where tabs are removed)
    function addTabs(){
      $('ion-tabs').removeClass('tabs-item-hide');
    }
    addTabs();

    $(window).scroll(function(){
      console.log('yoooo');
    })

    /////////background image position fix
    setInterval(function(){
      $('.backgroundImage').css('top', '0px')
    }, 10)
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
          console.log(userPhotos);
          $scope.userPhotos = userPhotos.reverse();
          $scope.userSubmissions = userInfo.data.submissions.reverse();
          $scope.totalEarned = 0;
          function mapPhotos(){
            var soldPhotos = [];
            for (var i = 0; i < userPhotos.length; i++) {
              console.log(userPhotos[i].status);
              if(userPhotos[i].status == 'offered for sale' || userPhotos[i].status == 'sold'){
                console.log('sold one');
                console.log(userPhotos[i]);
                soldPhotos.push(userPhotos[i]);
                $scope.totalEarned += userPhotos[i].price;
              }
            }
            $scope.soldPhotos = soldPhotos;
            console.log($scope.soldPhotos);
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

    function openSingle(photoData, status){
      console.log(status);
      $scope.singlePhotoData = photoData;
      if(status == "sold"){
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
      else if(status == 'offered for sale'){
        $scope.sellModal = true;
        $ionicScrollDelegate.scrollTop(false);
      }
    }
    $scope.openSingle = openSingle;

    $scope.closeSellModal = function(){
      $scope.sellModal = false;
    }

    function openSubmission(subInfo, evt){
      console.log($ionicScrollDelegate.getScrollPosition().top);
      $scope.scrollPosition = $ionicScrollDelegate.getScrollPosition().top;
      $scope.singleSubmission = subInfo;
      $('.repeatContainer').css({
        marginRight: "100%"
      });
      $('.submissionInfo').css({
        opacity: 0
      })
      $('.singleSubmissionModal').css({
        marginLeft: 0
      })
      $ionicScrollDelegate.scrollTop(false);
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
        $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
      }
      else {
        $ionicScrollDelegate.scrollTop(false);
      }
      $('.singleImageModal').css({
        marginLeft: "100%"
      });
      $('.submissionInfo').css({
        opacity: 1
      })
      $('.repeatContainer').css({
        marginRight: "0%"
      });
    }
    $scope.backToRepeat = backToRepeat;

    //////////////////////////////////////////
    //////////logic for hamburger menu////////
    function openHamburger(){
      $scope.hamburgerOpen = true;
      $ionicScrollDelegate.freezeAllScrolls(true);
    }
    $scope.openHamburger = openHamburger;

    function closeHamburger(){
      $scope.hamburgerOpen = false;
      $ionicScrollDelegate.freezeAllScrolls(false);
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
      $ionicScrollDelegate.freezeAllScrolls(false);
    }
    $scope.closeHamburgerBody = closeHamburgerBody;


    console.log($ionicScrollDelegate);
    //////////logic for hamburger menu////////
    //////////////////////////////////////////

    ///////function to accept or reject price
    function buyRejectPhoto(status, photo){
      $http({
        method: "POST"
        ,url: 'https://moneyshotapi.herokuapp.com/api/photopurchase'
        ,data: {status: status, photoId: photo._id, refresh_token: $scope.userInfo.refresh_token, price: photo.price}
      })
      .then(function(updatedPhoto){
        console.log(updatedPhoto);
        $scope.sellModal = false;
        // window.location.reload();
        if(updatedPhoto.data.status == 'sold'){
          /////////bank stuff goes here

          for (var i = 0; i < $scope.soldPhotos.length; i++) {
            if($scope.soldPhotos[i]._id == updatedPhoto.data._id){
              $scope.soldPhotos[i].status = 'sold';
            }
          }
        }
        else if(updatedPhoto.data.status == 'rejected'){
          for (var i = 0; i < $scope.soldPhotos.length; i++) {
            if($scope.soldPhotos[i]._id == updatedPhoto.data._id){
              $scope.soldPhotos.splice(i, 1);
            }
          }
        }
      })
    }
    $scope.buyRejectPhoto = buyRejectPhoto;

  }
