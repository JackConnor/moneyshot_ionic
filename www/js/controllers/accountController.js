angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  })

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken', '$cordovaStatusbar', '$ionicScrollDelegate'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken, $cordovaStatusbar, $ionicScrollDelegate){
    ionic.Platform.fullScreen(false);/////removes the status bar from the app
    /////global variables
    // document.addEventListener('DOMContentLoaded', function() {
    //    // your code here
    //    console.log('loaded');
    // }, false);
    $scope.showSold              = false;
    $scope.showSubmitted         = true;
    $scope.showFinance           = false;
    $scope.hamburgerOpen         = false;
    $scope.introModal            = false;
    $scope.sellModal             = false;
    $scope.singleSubmissionModal = false;
    $scope.loadingModal          = true;
    $scope.introCounter          = 0;
    $scope.scrollPosition        = 0;
    $scope.backgroundMultiple    = [];

    // function to add tabs back if coming from camera (where tabs are removed)
    function addTabs(){
      $('ion-tabs').removeClass('tabs-item-hide');
    }
    addTabs();

    function setCss(){
      if($scope.showSold){
        $('.soldTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
      else if($scope.showSubmitted){
        $('.submittedTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
      else if($scope.showFinance){
        $('.moneyTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
    }
    setCss();

    /////begin intro modal stuff////
    ////////////////////////////////
    setInterval(function(){
      var heightVar = $(window).height();
      $('.swipeIntro').height(heightVar);
    }, 10);
    function introSwipeLeft(){
      if($scope.introCounter < 3 && $scope.introCounter >=0){
        $scope.introCounter++;
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
    function getUserPhotos(token){
      decodeToken(token)
      .then(function(decToken){
        userPhotos(decToken.data.userId)
        .then(function(userInfo){
          if(userInfo.data === null){
            var userPhotos = [];
            $scope.userInfo = [];
            $scope.userSubmissions = [];
            $scope.totalEarned = 0;
            // $('.showSubmittedHolder').append(
            //   '<div class="submittedRow submittedRow{{$index}} col-xs-12" ng-repeat="submission in userSubmissions"></div>'
            // )
          }
          else {
            $scope.userInfo = userInfo.data;
            var userPhotos = userInfo.data.photos;////this is all of a signed-in user's
            var photoLength = userInfo.data.photos.length;
            $scope.userPhotos = userPhotos.reverse();
            $scope.userSubmissions = userInfo.data.submissions.reverse();
            console.log($scope.userSubmissions);
            var backlengthFunc = function(){
              if($scope.userSubmissions){
                return $scope.userSubmissions.length*5;
              }
              else {
                return 1;
              }
            }
            var backLength = backlengthFunc();
            $scope.totalEarned = 0;
            function mapPhotos(){
              var soldPhotos = [];
              var offeredPhotos = [];
              for (var i = 0; i < photoLength; i++) {
                console.log(i);
                console.log(userPhotos.length-1);
                if(userPhotos[i].status === 'sold'){
                  soldPhotos.push(userPhotos[i]);
                  $scope.totalEarned += userPhotos[i].price;
                  if(i == userPhotos.length-1){
                    $scope.allSoldPhotos = offeredPhotos.concat(soldPhotos);
                  }
                }
                else if(userPhotos[i].status === 'offered for sale'){
                  console.log('photo for sale');
                  offeredPhotos.push(userPhotos[i]);
                  $scope.totalEarned += userPhotos[i].price;
                  if(i === userPhotos.length-1){
                    $scope.allSoldPhotos = offeredPhotos.concat(soldPhotos);
                    console.log('sold phhhooooootos');
                    console.log($scope.allSoldPhotos);
                  }
                }
                else {
                  if(i === userPhotos.length-1){
                    $scope.allSoldPhotos = offeredPhotos.concat(soldPhotos);
                    console.log('sold phhhooooootos');
                    console.log($scope.allSoldPhotos);
                  }
                }
              }
              for (var i = 0; i <= backLength; i++) {
                $scope.backgroundMultiple.push('filler'+i);
              }
              setCss();
            }
            mapPhotos();
          }
        })
      })
    }
    getUserPhotos(userToken);

    var d = 1;
    function addSpinner(){
      if($scope.loadingModal){
        $('.loadSpinner').css({
          '-moz-transform':'rotate('+d+'deg)',
          '-webkit-transform':'rotate('+d+'deg)',
          '-o-transform':'rotate('+d+'deg)',
          '-ms-transform':'rotate('+d+'deg)',
          'transform': 'rotate('+d+'deg)'
        })
        if(d >= 360){
          d = 0;
        }
      d++;
      }
    }
    var spinnerInterval = setInterval(addSpinner, 20);
    // addSpinner();

    function setPhotoUiSubs(){
      var arr = $scope.userSubmissions;
      var length = arr.length
      for (var i = 0; i < length; i++) {
        if(arr[i].photos.length == 1){
          var el = $('.submittedRow'+i).find('.subPhoto0');
          el.animate({
            marginLeft: '27.5px'
          }, 300);
          if(i === length-1){
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 200);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 1000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 2000);
          }
        }
        else if(arr[i].photos.length == 2){
          var el = $('.submittedRow'+i).find('.subPhoto0');
          var el1 = $('.submittedRow'+i).find('.subPhoto1');
          el.animate({
            marginLeft: '10px'
          }, 300);
          el1.animate({
            marginLeft: '45px'
          }, 300);
          if(i === length-1){
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 200);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 1000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 2000);
          }
        }
        else if(arr[i].photos.length == 3){
          var el = $('.submittedRow'+i).find('.subPhoto0');
          var el1 = $('.submittedRow'+i).find('.subPhoto1');
          var el2 = $('.submittedRow'+i).find('.subPhoto2');
          el.animate({
            marginLeft: '5px'
          }, 300);
          el1.animate({
            marginLeft: '27.5px'
          }, 300);
          el2.animate({
            marginLeft: '50px'
          }, 300);
          if(i === length-1){
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 200);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 1000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              clearInterval(spinnerInterval);
            }, 2000);
          }
        }
      }
    }

    setTimeout(setPhotoUiSubs, 500);
    setTimeout(setPhotoUiSubs, 1000);
    setTimeout(setPhotoUiSubs, 2000);
    setTimeout(setPhotoUiSubs, 3000);

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
      setTimeout(function(){
        setPhotoUiSubs();
      }, 400)
    }
    $scope.showSubmittedFunc = showSubmittedFunc;

    function showFinanceFunc(){
      $scope.showSold      = false;
      $scope.showSubmitted = false;
      $scope.showFinance   = true;
    }
    $scope.showFinanceFunc = showFinanceFunc;
    ////function to adjust the text ui when a tab is selected
    function tabUi(evt){
      var sold = function(){
        if($(evt.currentTarget).hasClass('soldTab')){
          return true;
        }
        else {
          return false;
        }
      }
      var submission = function(){
        if($(evt.currentTarget).hasClass('submittedTab')){
          return true;
        }
        else {
          return false;
        }
      }
      var finance = function(){
        if($(evt.currentTarget).hasClass('moneyTab')){
          return true;
        }
        else {
          return false;
        }
      }
      //////first we take out all current additional css
      $('.soldTabInner').css({
        fontStyle: 'regular'
        ,fontSize: "16px"
        ,borderBottom: ""
      })
      $('.submittedTabInner').css({
        fontStyle: 'regular'
        ,fontSize: "16px"
        ,borderBottom: ""
      })
      $('.moneyTabInner').css({
        fontStyle: 'regular'
        ,fontSize: "16px"
        ,borderBottom: ""
      })
      ///////now we select and add css to correct text
      if(sold()){
        $('.soldTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
      else if(submission()){
        $('.submittedTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
      else if(finance()){
        $('.moneyTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
    }
    $scope.tabUi = tabUi;

    function openSingle(photoData, status){
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
      $scope.scrollPosition = $ionicScrollDelegate.getScrollPosition().top;
      $scope.singleSubmission = subInfo;
      $scope.singleSubmissionModal = true;
      setTimeout(function(){
        limitSubmissionModalScroll();
      }, 200);
      $('.repeatContainer').css({
        opacity: 0
      })
      $ionicScrollDelegate.scrollTop(false);
    }
    $scope.openSubmission = openSubmission;

    function backToRepeat(modalType){
      var x = document.getElementById("repeatContainer");
      x.style.marginRight = 0;
      if(modalType == 'submission'){
        $scope.singleSubmissionModal = false;
        $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
      }
      else {
        $ionicScrollDelegate.scrollTop(false);
      }
      $scope.singleSubmissionModal = false;
      $('.repeatContainer').css({
        opacity: 1
      })
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
      if($(evt.currentTarget).hasClass("hamburgerSignout") == false){
        $scope.hamburgerOpen = false;
      }
      $ionicScrollDelegate.freezeAllScrolls(false);
    }
    $scope.closeHamburgerBody = closeHamburgerBody;


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


  ////////////////////////
  ////end controller//////
  ///////////////////////
  }
