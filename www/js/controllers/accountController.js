angular.module('accountController', ['persistentPhotosFactory', 'userInfoFactory', 'emailVideoFactory'])

  .controller('accountCtrl', acctCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  })

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken', '$cordovaStatusbar', '$ionicScrollDelegate', 'persistentPhotos', '$timeout', '$cordovaFileTransfer', 'userInfo', 'emailThisVideo', '$localStorage', '$cordovaFileTransfer'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken, $cordovaStatusbar, $ionicScrollDelegate, persistentPhotos, $timeout, $cordovaFileTransfer, userInfo, emailThisVideo, $localStorage, $cordovaFileTransfer){
    $scope.photoCarouselBool    = false;
    $scope.carouselMain       = [];
    $scope.showSold              = false;
    $scope.showSubmitted         = true;
    $scope.showFinance           = false;
    $scope.hamburgerOpen         = false;
    $scope.introModal            = false;
    $scope.sellModal             = false;
    $scope.singleSubmissionModal = false;
    $scope.loadingModal          = false;
    $scope.introCounter          = 0;
    $scope.scrollPosition        = 0;
    $scope.backgroundMultiple    = [];

    function findZoomed(){
      if(window.innerWidth === 320){
        return 'zoomed';
      }
      else if(window.innerWidth === 375){
        return 'standard';
      }
    }
    var zooming = findZoomed();

    // function to add tabs back if coming from camera (where tabs are removed)
    function addTabs(){
      $('ion-tabs').removeClass('tabs-item-hide');
    }
    addTabs();

    function addTopBar(){
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        ionic.Platform.ready(function(){
          $cordovaStatusbar.show();
          $cordovaStatusbar.style(1);
        })
      }
      else {

      }
    }
    addTopBar();

    $(window).unload(function(){
      // cordova.plugins.camerapreview.stopCamera();
      $ionic.Platform.exitApp();
    });



    function setCss(){
      if($scope.showSold){
        $('.soldTab').addClass('account-tab-active');
      }
      else if($scope.showSubmitted){
        $('.submittedTab').addClass('account-tab-active');
      }
      else if($scope.showFinance){
        $('.moneyTab').addClass('account-tab-active');
      }
    }
    setCss();

    // Hide loader after delay //
    function hideLoader(){
      $scope.loadingModal = false;
    }
    setTimeout(hideLoader, 500);

    /////begin intro modal stuff////
    ////////////////////////////////

    ////////end intro swipe modal stuff
    ///////////////////////////////////

    function getUserPhotos(token){
      var userInfoData = userInfo.cacheOnly();
      console.log(userInfoData);
      // alert(userInfoData)
      console.log(userInfo);
      if(userInfoData === null || userInfoData == undefined){
        var userPhotos = [];
        $scope.userInfo = [];
        $scope.userSubmissions = [];
        $scope.totalEarned = 0;
        userInfo.userInfoFunc(token, true);
        $timeout(function(){
          getUserPhotos(token);
        }, 1000);
      }
      // else if($scope.userInfo === undefined){
      //   var userInfoData = userInfo.userInfoFunc(token, true);
      //   getUserPhotos(token);
      // }
      else {
        $scope.userInfo = userInfoData;
        var userPhotos = userInfoData.photos;////this is all of a signed-in user's
        var photoLength = userInfoData.photos.length;
        $scope.userPhotos = userPhotos;
        $scope.userSubmissions = userInfoData.submissions  //.slice(0, 20);
        $scope.totalEarned = 0;
        $timeout(function(){
          $('.showSubmittedHolder').css({
            height: 'auto'
          });
        }, 1000);
      }
    }

    var userToken = $localStorage.webToken;
    getUserPhotos(userToken);

    // function checkToken(){
    //   var maybeToken = window.localStorage.webToken;
    //   if(maybeToken.length > 4){
    //     return;
    //   }
    //   else {
    //     window.location.hash = "#/";
    //   }
    // }

    function showSoldFunc(){
      $scope.loadingModal = false;
      $('.loadSpinner').remove();
      $('.loadSpinnerBlack').remove();
      //clearInterval(spinnerInterval);

      $scope.singleSubmissionModal = false;
      $scope.sellModal             = false;
      $scope.showSold              = true;
      $scope.showSubmitted         = false;
      $scope.showFinance           = false;
      $scope.hamburgerOpen         = false;
      $('.singleImageModal').css({
        marginLeft: '100%'
      });
      $('.repeatContainer').css({
        opacity: 1
      });
      $ionicScrollDelegate.scrollTop(true);
    }
    $scope.showSoldFunc = showSoldFunc;

    function showSubmittedFunc(){
      $scope.singleSubmissionModal = false;
      $scope.sellModal             = false;
      $scope.showSold              = false;
      $scope.showSubmitted         = true;
      $scope.showFinance           = false;
      $scope.hamburgerOpen         = false;
      $('.singleImageModal').css({
        marginLeft: '100%'
      });
      $('.repeatContainer').css({
        opacity: 1
      });
      $ionicScrollDelegate.scrollTop(true);
      setTimeout(function(){
        setPhotoUiSubs();
      }, 400)
    }
    $scope.showSubmittedFunc = showSubmittedFunc;

    function showFinanceFunc(){
        $scope.loadingModal = false;
        $('.loadSpinner').remove();
        $('.loadSpinnerBlack').remove();
        //clearInterval(spinnerInterval);
      getUserTransactions();
      $scope.singleSubmissionModal = false;
      $scope.sellModal             = false;
      $scope.showSold              = false;
      $scope.showSubmitted         = false;
      $scope.showFinance           = true;
      $scope.hamburgerOpen         = false;
      $('.singleImageModal').css({
        marginLeft: '100%'
      });
      $('.repeatContainer').css({
        opacity: 1
      });
      $ionicScrollDelegate.scrollTop(true);
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
      $('.soldTab').removeClass('account-tab-active');
      $('.submittedTab').removeClass('account-tab-active');
      $('.moneyTab').removeClass('account-tab-active');
      ///////now we select and add css to correct text
      if(sold()){
        $('.soldTab').addClass('account-tab-active');
      }
      else if(submission()){
        $('.submittedTab').addClass('account-tab-active');
      }
      else if(finance()){
        $('.moneyTab').addClass('account-tab-active');
      }
    }
    $scope.tabUi = tabUi;

    function openSingle(photoData, status){
      $scope.scrollPosition = $ionicScrollDelegate.getScrollPosition().top;
      $scope.singlePhotoData = photoData;
      if(status === "sold"){
        /////get proper margin-left
        $('.repeatContainer').css({
          marginRight: "100%"
        });
        $('.singleSubmissionModal').css({
          marginRight: "100%"
        });
        $('.singleImageModal').css({
          marginLeft: 0
        });
        setTimeout(function(){
          var elWidth = $('.singleImage').width();
          var contWidth = $('.singleImageHolder').width();
          var newMargLeft = (contWidth-elWidth)/2;
          $('.singleImage').css({
            marginLeft: newMargLeft
          });
        }, 05);
        $ionicScrollDelegate.scrollTop(true);
        $ionicScrollDelegate.freezeScroll(true);
      }
      else if(status == 'offered for sale'){
        $scope.scrollPosition = $ionicScrollDelegate.getScrollPosition().top;
        $scope.sellModal = true;
        $ionicScrollDelegate.scrollTop(true);
        $ionicScrollDelegate.freezeScroll(true);
      }
    }
    $scope.openSingle = openSingle;

    $scope.closeSellModal = function(){
      $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
      $ionicScrollDelegate.freezeScroll(false);
      $scope.sellModal = false;
    }


      function setCellSize(){
        var cacheLength = $scope.singleSubmission.photos.length;
        if(cacheLength <= 4){
          $timeout(function(){
            $('.submitCellAcct').width('185px');
            $('.submitCellAcct').height('185px');
          }, 750);
        }
        else if(cacheLength <= 9){
          $timeout(function(){
            $('.submitCellAcct').width('123.33px');
            $('.submitCellAcct').height('123.33px');
          }, 1500);
        }
        // else if(cacheLength <= 16){
        //   $timeout(function(){
        //     $('.submitCellAcct').width('92.5px');
        //     $('.submitCellAcct').height('92.5px');
        //   }, 3000);
        // }
      }

    function openSubmission(subInfo, evt){
      $('ion-tabs').addClass('tabs-item-hide');
      $('.accountBody').css({
        marginTop: '0px'
      });
      $scope.scrollPosition = $ionicScrollDelegate.getScrollPosition().top;
      $ionicScrollDelegate.freezeScroll(true);
      $scope.singleSubmission = subInfo;
      $scope.singleSubmissionModal = true;
      setTimeout(function(){
        setCellSize();
      }, 200);
      $('.repeatContainer').css({
        opacity: 0
      })
      $ionicScrollDelegate.scrollTop(false);
    }
    $scope.openSubmission = openSubmission;

    function backToRepeat(modalType){
      $('ion-tabs').removeClass('tabs-item-hide');
      $ionicScrollDelegate.freezeScroll(false);
      $('.accountBody').css({
        marginTop: '75px'
      });
      var x = document.getElementById("repeatContainer");
      x.style.marginRight = 0;
      if(modalType === 'submission'){
        $scope.singleSubmissionModal = false;
        $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
        $ionicScrollDelegate.freezeScroll(false);
        $('.repeatContainer').css({
          opacity: 1
        });
      }
      else if(($scope.showSubmitted === true || $scope.showFinance === true) && modalType === 'single'){
        $ionicScrollDelegate.freezeScroll(false);
        // $scope.singleSubmissionModal = false;
        $('.repeatContainer').css({
          marginRight: "0%"
        });
        $('.singleSubmissionModal').css({
          marginRight: "0%"
        });
        $('.singleImageModal').css({
          marginLeft: '100%'
        });
        $('.repeatContainer').css({
          opacity: 1
        });
      }
      else if(modalType === 'single' && $scope.showSold === true){
        $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
        $ionicScrollDelegate.freezeScroll(false);
        $scope.singleSubmissionModal = false;
        $('.repeatContainer').css({
          marginRight: "0%"
        });
        $('.singleSubmissionModal').css({
          marginRight: "0%"
        });
        $('.singleImageModal').css({
          marginLeft: '100%'
        });
        $('.repeatContainer').css({
          opacity: 1
        });
      }

    }
    $scope.backToRepeat = backToRepeat;

    //////////////////////////////////////////
    //////////logic for hamburger menu////////
    function openHamburger(){
      if($scope.hamburgerOpen === false){
        $scope.hamburgerOpen = true;
        $ionicScrollDelegate.freezeAllScrolls(true);
        $scope.scrollPosition = $ionicScrollDelegate.getScrollPosition().top;
        $ionicScrollDelegate.scrollTop(true);
      }
      else {
        $scope.hamburgerOpen = false;
        $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
        $ionicScrollDelegate.freezeAllScrolls(false);
      }
    }
    $scope.openHamburger = openHamburger;

    function closeHamburger(){
      $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
      $scope.hamburgerOpen = false;
      $ionicScrollDelegate.freezeAllScrolls(false);
    }
    $scope.closeHamburger = closeHamburger;

    /////signout option
    function hamburgerSignout(){

      var confirmSignout = confirm('Sign out?');
      if(confirmSignout){
        localforage.getItem('storedPhotos')
        .then(function(storedArr){
          console.log(storedArr);
          for (var i = 0; i < storedArr.length; i++) {
            $cordovaFileTransfer.upload('http://192.168.0.7:5555/api/temp/photo', storedArr[i].link, {params: {userId: $scope.userInfo._id}})
            .then(function(callbackData){
              console.log(callbackData);
            })
          }
          $timeout(function(){
            localforage.setItem('storedPhotos', [])
            .then(function(photos){
              console.log(photos);
              $localStorage.webToken = null;
              $state.go('signin');
            })
          }, 1000);
        })
      }
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
        $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
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
        ,url: 'http://45.55.24.234:5555/api/photopurchase'
        ,data: {status: status, photoId: photo._id, userId: $scope.userInfo._id, refresh_token: $scope.userInfo.refresh_token, price: photo.price}
      })
      .then(function(updatedPhoto){
        $scope.sellModal = false;
        $ionicScrollDelegate.freezeScroll(false);
        window.location.reload();
      })
    }
    $scope.buyRejectPhoto = buyRejectPhoto;

    /////////function to send fin data as a csv file
    function sendFinData(){
      $('.sendFinDataButton').css({
        backgroundColor: '#ccccff'
      });
      $('.sendFinDataButton').animate({
        backgroundColor: '#696969'
      }, 200);
      $http({
        method: "POST"
        ,url: 'http://45.55.24.234:5555/api/tocsv'
        ,data: {email: $scope.userInfo.email}
      })
      .then(function(data){
        navigator.notification.alert('Your Financial Data Has been Sent To Your Email');
      })
    }
    $scope.sendFinData = sendFinData;

    function getUserTransactions(){
      $http({
        url: 'http://45.55.24.234:5555/api/transactions/all'
        ,method: "POST"
        ,data: {userId: $scope.userInfo._id}
      })
      .then(function(allTrans){
        var length = allTrans.data.length;
        for (var i = 0; i < length; i++) {
          allTrans.data[i].date = moment(allTrans.data[i].date).format('MMM Do YYYY');
          allTrans.data[i].photos[0].date = moment(allTrans.data[i].photos[0].date).format('MMM Do YYYY');
          if(i === length-1){
            $scope.allTransactions = allTrans.data.reverse();
          }
        }
      })
    }

    ////////////////////////////////////////
    ////functions to open financial cells///
    function openFin(evt, transData){
      var isOpen = $(evt.currentTarget).hasClass('opened');
      var parentEl = $(evt.currentTarget).parent();
      if(!isOpen){
        parentEl.animate({
          height: "160px"
        }, 1000);
        // $(evt.currentTarget).animate({
        //   marginTop: "130px"
        // }, 1000);
        // parentEl.prepend(
        //   "<div class='finMoreDetails'>"+
        //     "<div class='tempFinInfo'>"+
        //       "Coming Soon"+
        //     "</div>"+
        //   "</div>"
        // );
        $(evt.currentTarget).addClass('opened');
        $(evt.currentTarget).text('Close Details');
        setTimeout(function(){
          $('.finMoreDetails').animate({
            opacity: 1
          }, 200);
        }, 900)
      }
      else if(isOpen) {
        parentEl.animate({
          height: "80px"
        }, 1000);
        // $(evt.currentTarget).animate({
        //   marginTop: "0px"
        // }, 1000);
        $(evt.currentTarget).removeClass('opened');
        $(evt.currentTarget).text('More Details');
        // $('.finMoreDetails').animate({
        //   opacity: 0
        // }, 100);
        // setTimeout(function(){
        //   var moreDetails = $(evt.currentTarget).siblings()[0];
        //   $(moreDetails).remove();
        // }, 1000);
      }
    }
    $scope.openFin = openFin;

    /////function to see if photos from a submission have any non-embargoed photos
    function checkPhotos(allPhotos){
      var length = 0;
      var allPhotos = allPhotos;
      for (var i = 0; i < allPhotos.length; i++) {
        if(allPhotos[i].status == 'sold'){
          length++;
        }
        else if(allPhotos[i].status == 'rejected'){
          length++
        }
        else if(allPhotos[i].status == 'offered for sale'){
          length++
        }
      }
      return length;
    }
    $scope.checkPhotos = checkPhotos;

    ////end functions to open financial cells///
    ////////////////////////////////////////////

    ///////begin photo carousel animation work
    function goToCarousel(mediaData, index, evt){
      $ionicScrollDelegate.freezeScroll(false);
      $scope.carouselMain = mediaData;////this is always the centerpiece photo
      $(evt.currentTarget).css({
        opacity: 0.1
      });
      $(evt.currentTarget).animate({
        opacity: 1
      }, 169);
      $timeout(function(){
        $scope.submitModaVar = false;
        $scope.showSubmitted = false;
        $scope.photoCarouselBool = true;
        $timeout(function(){
          var width = $($('.mainPhotoHolder').children()[0]).width();
          var outerWidth = $('.mainPhotoHolder').width();
          var marginL = (outerWidth - width)/2;
          $($('.mainPhotoHolder').children()[0]).css({
            width: width+"px"
          })
          $($('.mainPhotoHolder').children()[0]).css({
            marginLeft: marginL
          });
          $('.photoCarouselInner').css({
            width: ($('.photoCarouselCellAcct').length*70)+152.5+'px'
          });
          // $ionicScrollDelegate.$getByHandle('carouselScroll').resize();
        }, 50);
      }, 170);
      $timeout(function(){
        if(zooming === 'zoomed'){
          var sLeft = (index*70);
        }
        else if(zooming === 'standard'){
          var sLeft = (index*70);
        }
        $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(sLeft, 0, true);
      }, 300);
    }
    $scope.goToCarousel = goToCarousel;

    function changeCarouselPhoto(newMedia){
      $scope.carouselMain = newMedia;
      $scope.$apply();
      console.log($scope.carouselMain);
      // $('.mainPhotoCar').attr('src', newMedia.link);
    }
    $scope.changeCarouselPhoto = changeCarouselPhoto;

    function carouselScroll(){
      var scrollPos = $ionicScrollDelegate.$getByHandle('carouselScroll').getScrollPosition().left;

      if(scrollPos >= 0 && scrollPos < 36){
        var newMedia = $scope.singleSubmission.photos[0];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 36 && scrollPos < 105){
        var newMedia = $scope.singleSubmission.photos[1];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 106 && scrollPos < 175){
        var newMedia = $scope.singleSubmission.photos[2];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 176 && scrollPos < 245){
        var newMedia = $scope.singleSubmission.photos[3];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 246 && scrollPos < 315){
        var newMedia = $scope.singleSubmission.photos[4];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 316 && scrollPos < 385){
        var newMedia = $scope.singleSubmission.photos[5];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 386 && scrollPos < 455){
        var newMedia = $scope.singleSubmission.photos[6];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 456 && scrollPos < 525){
        var newMedia = $scope.singleSubmission.photos[7];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 526 && scrollPos < 595){
        var newMedia = $scope.singleSubmission.photos[8];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 596 && scrollPos < 665){
        var newMedia = $scope.singleSubmission.photos[9];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 666 && scrollPos < 735){
        var newMedia = $scope.singleSubmission.photos[10];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 736 && scrollPos < 805){
        var newMedia = $scope.singleSubmission.photos[11];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 806 && scrollPos < 875){
        var newMedia = $scope.singleSubmission.photos[12];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 876 && scrollPos < 945){
        var newMedia = $scope.singleSubmission.photos[13];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 946 && scrollPos < 1015){
        var newMedia = $scope.singleSubmission.photos[14];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1016 && scrollPos < 1085){
        var newMedia = $scope.singleSubmission.photos[15];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1086 && scrollPos < 1155){
        var newMedia = $scope.singleSubmission.photos[16];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1156 && scrollPos < 1225){
        var newMedia = $scope.singleSubmission.photos[17];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1226 && scrollPos < 1295){
        var newMedia = $scope.singleSubmission.photos[18];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1296 && scrollPos < 1365){
        var newMedia = $scope.singleSubmission.photos[19];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1366 && scrollPos < 1435){
        var newMedia = $scope.singleSubmission.photos[20];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1436 && scrollPos < 1505){
        var newMedia = $scope.singleSubmission.photos[21];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1506 && scrollPos < 1575){
        var newMedia = $scope.singleSubmission.photos[22];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1576 && scrollPos < 1635){
        var newMedia = $scope.singleSubmission.photos[23];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1636 && scrollPos < 1705){
        var newMedia = $scope.singleSubmission.photos[24];
        changeCarouselPhoto(newMedia);
      }
    }
    $scope.carouselScroll = carouselScroll;

    function playVid(){
      var vidDuration = function(){
        return $('#carouselVideo')[0].duration;
      }
      var vidCurrent = function(){
        return $('#carouselVideo')[0].currentTime;
      }
      if(vidCurrent() == 0 || vidDuration() - vidCurrent() == 0 || $('#carouselVideo')[0].paused){
        $('#carouselVideo')[0].play();
        $('.videoPlayerIcon').css({
          opacity: 0.1
        });
        $('#carouselVideo')[0].addEventListener('ended', function(){
          $('.videoPlayerIcon').css({
            opacity: 0.5
          });
        });
      }
      else {
        $('#carouselVideo')[0].pause();
        $('.videoPlayerIcon').css({
          opacity: 0.5
        });
      }
    }
    $scope.playVid = playVid;

    function photoCarouselBack(){
      $ionicScrollDelegate.scrollTop(true);
      $scope.showSubmitted = true;
      $ionicScrollDelegate.freezeScroll(true);
      $timeout(function(){
        $scope.photoCarouselBool = false;
        $scope.submitModaVar = true;
      }, 200);
    }
    $scope.photoCarouselBack = photoCarouselBack;

    //////controls all swipe functions
    function openNewCarouselPhoto(mediaData, index, direction){
      $scope.carouselMain = mediaData;
      var mediaLength = $('.photoCarouselCellAcct').length;
      if(zooming === 'zoomed'){
        var dist = (index*70);
      }
      else if(zooming === 'standard'){
        var dist = (index*70);
      }
      $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(dist, 0, true);
    }
    $scope.openNewCarouselPhoto = openNewCarouselPhoto;

    /////controls click-to-move functionality
    function clickCarouselPhoto(mediaData, index){
      $scope.carouselMain = mediaData;
      var mediaLength = $('.photoCarouselCellAcct').length;
      $(".photoCarouselInner").css({
        width: (mediaLength*70) + 152.5 + 'px'
      });
      if(zooming === 'zoomed'){
        var dist = (index*70);
      }
      else if(zooming === 'standard'){
        var dist = (index*70);
      }
      $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(dist, 0, true);
    }
    $scope.clickCarouselPhoto = clickCarouselPhoto;

    // function swipeLeftAnimation(centerP){
    //   var imgClone = $('.mainPhotoCar').clone();
    //   imgClone.removeClass("mainPhotoCar");
    //   imgClone.addClass("mainPhotoCarTwo");
    //   imgClone.attr('id', 'mainPhotoId');
    //   imgClone.attr('ng-src', '');
    //   imgClone.attr('src', $scope.singleSubmission.photos[centerP.index+1].link);
    //   var width = $('.mainPhotoCar').width();
    //   var height = $('.mainPhotoHolder').height()*0.98;
    //   var marginL = $('.mainPhotoCar').css("marginLeft");
    //   imgClone.css({
    //     position: 'absolute'
    //     ,width: width+"px"
    //     ,height: height+"px"
    //     ,marginLeft: '500px'
    //   });
    //   $('.mainPhotoHolder').prepend(
    //     imgClone
    //   );
    //   $('.mainPhotoCar').animate({
    //     marginLeft: '-500px'
    //   }, 400);
    //   imgClone.animate({
    //     marginLeft: marginL
    //   }, 400);
    //   $timeout(function(){
    //     $('.mainPhotoCar').attr('src', $scope.singleSubmission.photos[centerP.index+1].link);
    //     $('.mainPhotoCar').css({
    //       marginLeft: marginL
    //     });
    //     imgClone.remove();
    //     $scope.carouselSwipeActive = false;
    //   }, 401);
    // }

    //////carousel swipe functions
    function photoCarouselSwipeLeft(){
      $scope.carouselSwipeActive = true;
      var centerP = findCenterPhoto();
      if(centerP.index+1 < $scope.singleSubmission.photos.length){
        openNewCarouselPhoto($scope.singleSubmission.photos[centerP.index+1], centerP.index+1, 'left');
      }
    }
    $scope.photoCarouselSwipeLeft = photoCarouselSwipeLeft;

    function photoCarouselSwipeRight(){
      var centerP = findCenterPhoto();
      if(centerP.index > 0){
        openNewCarouselPhoto($scope.singleSubmission.photos[centerP.index-1], centerP.index-1, 'right')
      }
    }
    $scope.photoCarouselSwipeRight = photoCarouselSwipeRight;

    function centerPhoto(){
      var currP = findCenterPhoto();
    }
    $scope.centerPhoto = centerPhoto;

    function findCenterPhoto(){
      var carou = $('.photoCarouselCell')
      var photoCarouselLength = carou.length;
      var activeEl = $(".carouselSelected");
      var elIndex  = $('.carouselSelected')[0].id;
      return {activeEl: activeEl, index: elIndex}
    }

    function animateBackCarousel(){
      $('.photoCarouselBack').css({
        opacity: 0.25
      });
      $('.photoCarouselBack').animate({
        opacity: 1
      }, 200);
    }
    $scope.animateBackCarousel = animateBackCarousel;

    ///////function to download photos from a remote url to your camera roll
    function getBase64FromImageUrl(url) {
      var img = new Image();

      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0); //////important, THIS is the image
        var dataURL = canvas.toDataURL("image/png");
        dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        CameraRoll.saveToCameraRoll(dataURL, function(){
        }, function(err){
          console.log(err);
        });
      };
    img.src = url;
    }
    function downloadPhoto(link){
      console.log(link);
      var ending = link.url.charAt(link.url.length-1);
      console.log(ending);
      var date = new Date();
      var photoDate = moment(link.date).format('YYYY-MM-DD HH:mm');////date photo was taken
      var minusAWeek = moment(date).subtract(0, 'days');
      var minusConvert = moment(minusAWeek).format('YYYY-MM-DD HH:mm');
      var pastEmbargo = moment(minusConvert).isAfter(photoDate);
      if(!pastEmbargo){
        navigator.notification.alert('sorry, you need to wait until a week has passed befre you can download a photo. This is so we can sell it at the maximum price, for all of our benefit. Thank you for your patience!');
      }
      else{
        if(link.isVideo){
          var confirmed = confirm('want us to email you this video?')
        }
        else {
          var confirmed = confirm('download this photo?');
        }
        console.log(confirmed);
        if(confirmed && ending==='g'){
          getBase64FromImageUrl(link.url);
          navigator.notification.alert('photo saved!');
        }
        else if(confirmed && ending==='v'){
          navigator.notification.alert('This video has been emailed to your account. Enjoy!');
          emailThisVideo('jack.connor83@gmail.com', link.url)
          .then(function(data){
            console.log(data);
          })

        }
        else {
          console.log('changed my mind');
        }
      }
    }
    $scope.downloadPhoto = downloadPhoto;

    function downloadVideo(){

    }

    function downloadArrow(){
      $('.photoCarouselModal').prepend(
        '<i class="fa fa-arrow-down downloadArrow" aria-hidden="true"></i>'
      );
      $('.downloadArrow').animate({
        marginTop: "200px"
      }, 500);
      $timeout(function(){
        $('.downloadArrow').remove();
      }, 550);
    }

  ////////////////////////
  ////end controller//////
  ///////////////////////
  }
