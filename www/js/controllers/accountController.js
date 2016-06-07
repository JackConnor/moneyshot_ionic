angular.module('accountController', ['persistentPhotosFactory'])

  .controller('accountCtrl', acctCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  })

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken', '$cordovaStatusbar', '$ionicScrollDelegate', 'persistentPhotos', '$timeout', '$cordovaFileTransfer'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken, $cordovaStatusbar, $ionicScrollDelegate, persistentPhotos, $timeout, $cordovaFileTransfer){
    $scope.photoCarouselBool    = false;
    $scope.carouselMain       = [];
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

    var userToken = window.localStorage.webToken;
    function getUserPhotos(token){
      decodeToken(token)
      .then(function(decToken){
        userPhotos(decToken.data.userId)
        .then(function(userInfo){
          console.log(userInfo);
          if(userInfo.data === null){
            var userPhotos = [];
            $scope.userInfo = [];
            $scope.userSubmissions = [];
            $scope.totalEarned = 0;
          }
          else {
            $scope.userInfo = userInfo.data;
            var userPhotos = userInfo.data.photos;////this is all of a signed-in user's
            var photoLength = userInfo.data.photos.length;
            $scope.userPhotos = userPhotos.reverse();
            $scope.userSubmissions = userInfo.data.submissions.reverse().slice(0, 20);
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
            $timeout(function(){
              $('.showSubmittedHolder').css({
                height: 'auto'
              });
            }, 1000);
            function mapPhotos(){
              var soldPhotos = [];
              var offeredPhotos = [];
              for (var i = 0; i < photoLength; i++) {
                if(userPhotos[i].status === 'sold'){
                  soldPhotos.push(userPhotos[i]);
                  $scope.totalEarned += userPhotos[i].price;
                  if(i == userPhotos.length-1){
                    $scope.allSoldPhotos = soldPhotos.reverse();
                  }
                }
                else if(userPhotos[i].status === 'offered for sale'){
                  offeredPhotos.push(userPhotos[i]);
                  $scope.totalEarned += userPhotos[i].price;
                  if(i === userPhotos.length-1){
                    $scope.allSoldPhotos = soldPhotos.reverse();
                  }
                }
                else {
                  if(i === userPhotos.length-1){
                    $scope.allSoldPhotos = soldPhotos.reverse();
                  }
                }
              }
              for (var i = 0; i < 0; i++) {
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

    function checkToken(){
      var maybeToken = window.localStorage.webToken;
      if(maybeToken.length > 4){
        return;
      }
      else {
        window.location.hash = "#/";
      }
    }

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
        // limitSubmissionModalScroll();
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
      persistentPhotos('empty');
      window.localStorage.webToken = '';
      $state.go('signin');
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
        ,url: 'https://moneyshotapi.herokuapp.com/api/photopurchase'
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
        ,url: 'https://moneyshotapi.herokuapp.com/api/tocsv'
        ,data: {email: $scope.userInfo.email}
      })
      .then(function(data){
        alert('Your Financial Data Has been Sent To Your Email');
      })
    }
    $scope.sendFinData = sendFinData;

    function getUserTransactions(){
      $http({
        url: 'https://moneyshotapi.herokuapp.com/api/transactions/all'
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
      console.log(parentEl);
      if(!isOpen){
        console.log($(evt.currentTarget));
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
        console.log($(evt.currentTarget));
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
      console.log(mediaData);
      $scope.carouselMain = mediaData;////this is always the centerpiece photo
      $(evt.currentTarget).css({
        opacity: 0.1
      });
      $(evt.currentTarget).animate({
        opacity: 1
      }, 169);
      $timeout(function(){
        $scope.submitModaVar = false;
        $scope.photoCarouselBool = true;
        $timeout(function(){
          $($('.photoCarouselCellAcct')[index]).css({
            borderWidth: '2px'
            ,marginRight: '10px'
            ,marginLeft: '10px'
          });
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
            width: 'auto'
          });
        }, 50);
      }, 170);
      $timeout(function(){
        $('.photoCarouselInner').animate({
          marginLeft: index*-70+125+"px"
        }, 200);
      }, 300);
    }
    $scope.goToCarousel = goToCarousel;

    function playVid(){
      console.log($('#carouselVideo'));
      $('#carouselVideo')[0].play();
      $timeout(function(){
        console.log($('#carouselVideo')[0].duration);
        console.log($('#carouselVideo')[0].ended);
        console.log($('#carouselVideo')[0].currentTime);
      }, 1000);
    }
    $scope.playVid = playVid;

    function photoCarouselBack(){
      $timeout(function(){
        $scope.photoCarouselBool = false;
        $scope.submitModaVar = true;
      }, 200);
    }
    $scope.photoCarouselBack = photoCarouselBack;

    function openNewCarouselPhoto(mediaData, index, direction){
      $scope.carouselMain = mediaData;
      console.log(mediaData);
      var mediaLength = $('.photoCarouselCellAcct').length;
      $('.photoCarouselInner').animate({
        marginLeft: index*-70+125+"px"
      }, 300);
      if(direction === 'right'){
        $($('.photoCarouselCellAcct')[index+1]).animate({
          borderWidth: '0px'
          ,marginLeft: '0px'
          ,marginRight: '0px'
        }, 300);
      }
      else if(direction === 'left'){
        $($('.photoCarouselCellAcct')[index-1]).animate({
          borderWidth: '0px'
          ,marginLeft: '0px'
          ,marginRight: '0px'
        }, 300);
      }
      // $timeout(function(){
      $($('.photoCarouselCellAcct')[index]).animate({
        borderWidth: '2px'
        ,marginRight: '10px'
        ,marginLeft: '10px'
      }, 300);
      // }, 100);
    }
    $scope.openNewCarouselPhoto = openNewCarouselPhoto;

    function swipeLeftAnimation(centerP){
      console.log('swiped');
      console.log($scope.singleSubmission.photos[centerP.index+1]);
      var imgClone = $('.mainPhotoCar').clone();
      imgClone.removeClass("mainPhotoCar");
      imgClone.addClass("mainPhotoCarTwo");
      imgClone.attr('id', 'mainPhotoId');
      imgClone.attr('ng-src', '');
      imgClone.attr('src', $scope.singleSubmission.photos[centerP.index+1].link);
      var width = $('.mainPhotoCar').width();
      var height = $('.mainPhotoHolder').height()*0.98;
      var marginL = $('.mainPhotoCar').css("marginLeft");
      imgClone.css({
        position: 'absolute'
        ,width: width+"px"
        ,height: height+"px"
        ,marginLeft: '500px'
      });
      $('.mainPhotoHolder').prepend(
        imgClone
      );
      $('.mainPhotoCar').animate({
        marginLeft: '-500px'
      }, 400);
      imgClone.animate({
        marginLeft: marginL
      }, 400);
      $timeout(function(){
        $('.mainPhotoCar').attr('src', $scope.singleSubmission.photos[centerP.index+1].link);
        $('.mainPhotoCar').css({
          marginLeft: marginL
        });
        imgClone.remove();
        $scope.carouselSwipeActive = false;
      }, 401);
    }

    //////carousel swipe functions
    function photoCarouselSwipeLeft(){
      console.log('swipe attempt');
      // if(!$scope.carouselSwipeActive){
        console.log('successful swipe');
        $scope.carouselSwipeActive = true;
        // $timeout(function(){
        //   $scope.carouselSwipeActive = false;
        // }, 1500);
        var centerP = findCenterPhoto();
        // swipeLeftAnimation(centerP);
        if(centerP.index+1 < $scope.singleSubmission.photos.length){
          openNewCarouselPhoto($scope.singleSubmission.photos[centerP.index+1], centerP.index+1, 'left');
        }
      // }
    }
    $scope.photoCarouselSwipeLeft = photoCarouselSwipeLeft;

    function photoCarouselSwipeRight(){
      var centerP = findCenterPhoto();
      if(centerP.index > 0){
        console.log($scope.singleSubmission);
        openNewCarouselPhoto($scope.singleSubmission.photos[centerP.index-1], centerP.index-1, 'right')
      }
    }
    $scope.photoCarouselSwipeRight = photoCarouselSwipeRight;

    function centerPhoto(){
      console.log('centering');
      var currP = findCenterPhoto();
      console.log(currP);
    }
    $scope.centerPhoto = centerPhoto;

    function findCenterPhoto(){
      var carou = $('.photoCarouselCellAcct')
      console.log(carou);
      console.log($(carou).css('border'));
      var photoCarouselLength = carou.length;
      for (var i = 0; i < photoCarouselLength; i++) {
        var bStyle = $($(carou)[i]).css('border');
        if(bStyle === "2px solid rgb(255, 255, 255)"){
          console.log('this one');
          console.log(carou[i]);
          var activeEl = carou[i];
          return {activeEl: activeEl, index: i}
        }
      }
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
          console.log('saved?');
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
      var convertDate = moment.utc(date).format('YYYY-MM-DD HH:mm');
      console.log(convertDate);
      var convertSubtract = moment(convertDate).subtract(7, 'days');
      var photoDate = moment.utc(link.date).format('YYYY-MM-DD HH:mm');
      console.log(photoDate);
      console.log(moment(photoDate).isAfter(convertSubtract));///if this is true, it's been less than a week
      var confirmed = confirm('download this photo?');
      var pastEmbargo = moment(photoDate).isAfter(convertSubtract);
      if(!pastEmbargo){
        alert('sorry, you need to wait until a week has passed befre you can download a photo. This is so we can sell it at the maximum price, for all of our benefit. Thank you for your patience!');
      }
      else if(confirmed && pastEmbargo && ending==='g'){
        getBase64FromImageUrl(link.url);
        alert('photo saved!');
      }
      else if(confirmed && pastEmbargo && ending==='v'){
        alert('This video has been emailed to your account. Enjoy!');
      }
      else {
        console.log('changed my mind');
      }
    }
    $scope.downloadPhoto = downloadPhoto;

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
