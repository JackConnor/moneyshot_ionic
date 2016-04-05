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
    $scope.showSold              = false;
    $scope.showSubmitted         = true;
    $scope.showFinance           = false;
    $scope.hamburgerOpen         = false;
    $scope.introModal            = false;
    $scope.sellModal             = false;
    $scope.singleSubmissionModal = false;
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
      console.log(token);
      decodeToken(token)
      .then(function(decToken){
        console.log(decToken);
        userPhotos(decToken.data.userId)
        .then(function(userInfo){
          console.log(userInfo);
          if(userInfo.data === null){
            console.log('null');
            var userPhotos = [];
            $scope.userInfo = [];
            $scope.userSubmissions = [];
            $scope.totalEarned = 0;
            // $('.showSubmittedHolder').append(
            //   '<div class="submittedRow submittedRow{{$index}} col-xs-12" ng-repeat="submission in userSubmissions"></div>'
            // )
          }
          else {
            console.log(typeof userInfo.data.photos.length);
            $scope.userInfo = userInfo.data;
            var userPhotos = userInfo.data.photos;////this is all of a signed-in user's
            var photoLength = userInfo.data.photos.length;
            $scope.userPhotos = userPhotos.reverse();
            $scope.userSubmissions = userInfo.data.submissions.reverse();
            $scope.totalEarned = 0;
            function mapPhotos(){
              var soldPhotos = [];
              var offeredPhotos = [];
              for (var i = 0; i < photoLength; i++) {
                if(userPhotos[i].status == 'sold'){
                  soldPhotos.push(userPhotos[i]);
                  $scope.totalEarned += userPhotos[i].price;
                  if(i == userPhotos.length-1){
                    $scope.allSoldPhotos = offeredPhotos.concat(soldPhotos);
                  }
                }
                else if(userPhotos[i].status == 'offered for sale'){
                  offeredPhotos.push(userPhotos[i]);
                  $scope.totalEarned += userPhotos[i].price;
                  if(i == userPhotos.length-1){
                    $scope.allSoldPhotos = offeredPhotos.concat(soldPhotos);
                  }
                }
              }
              // $scope.soldPhotos = soldPhotos;
              console.log($scope.allSoldPhotos);
              if($scope.allSoldPhotos){
                console.log(true);
              }
              else{
                console.log(false);
              }
              if($scope.allSoldPhotos){
                var backLength =  $scope.allSoldPhotos.length;
              }
              else {
                var backLength = 1;
              }
              console.log(backLength);
              for (var i = 0; i <backLength; i++) {
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

    function setPhotoUiSubs(){
      var arr = $scope.userSubmissions;
      for (var i = 0; i < arr.length; i++) {
        if(arr[i].photos.length == 1){
          var el = $('.submittedRow'+i).find('.subPhoto0');
          el.animate({
            marginLeft: '27.5px'
          }, 300);
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
      console.log('yo');
      console.log(evt.currentTarget);
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
        console.log('sold');
        $('.soldTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
      else if(submission()){
        console.log('submitted');
        $('.submittedTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
      else if(finance()){
        console.log('money');
        $('.moneyTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid green"
        })
      }
    }
    $scope.tabUi = tabUi;

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
      console.log(modalType);
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


  ////////////////////////
  ////end controller//////
  ///////////////////////
  }
