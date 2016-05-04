angular.module('accountController', [])

  .controller('accountCtrl', acctCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  })

  acctCtrl.$inject = ['$http', '$state', '$scope', 'navbar', 'userPhotos', 'decodeToken', '$cordovaStatusbar', '$ionicScrollDelegate'];

  function acctCtrl($http, $state, $scope, navbar, userPhotos, decodeToken, $cordovaStatusbar, $ionicScrollDelegate){
    ionic.Platform.showStatusBar(true);/////removes the status bar from the app
    document.addEventListener("deviceready", function(){
      onDeviceReady();
      setTimeout(function(){
        onDeviceReady();
      }, 500);
      setTimeout(function(){
        onDeviceReady();
      }, 1000);
      setTimeout(function(){
        onDeviceReady();
      }, 3000);
    }, false);
    function onDeviceReady() {
      StatusBar.styleLightContent();
    }


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
          ,borderBottom: "5px solid white"
        })
      }
      else if($scope.showSubmitted){
        $('.submittedTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid white"
        })
      }
      else if($scope.showFinance){
        $('.moneyTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid white"
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
      $('ion-tabs').removeClass('tabs-item-hide');
      $scope.introModal = false;
      $scope.hamburgerOpen = false;
    }
    $scope.exitIntro = exitIntro;

    function openIntro(){
      function removeTabs(){
        $('ion-tabs').addClass('tabs-item-hide');
      }
      removeTabs();
      $scope.introModal = true;
      $scope.hamburgerOpen = false;
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
          }
          else {
            $scope.userInfo = userInfo.data;
            var userPhotos = userInfo.data.photos;////this is all of a signed-in user's
            var photoLength = userInfo.data.photos.length;
            $scope.userPhotos = userPhotos.reverse();
            $scope.userSubmissions = userInfo.data.submissions.reverse();
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
                if(userPhotos[i].status === 'sold'){
                  console.log('sold one');
                  soldPhotos.push(userPhotos[i]);
                  $scope.totalEarned += userPhotos[i].price;
                  if(i == userPhotos.length-1){
                    $scope.allSoldPhotos = offeredPhotos.concat(soldPhotos.reverse());
                    console.log($scope.allSoldPhotos);
                  }
                }
                else if(userPhotos[i].status === 'offered for sale'){
                  console.log('new p');
                  offeredPhotos.push(userPhotos[i]);
                  $scope.totalEarned += userPhotos[i].price;
                  if(i === userPhotos.length-1){
                    $scope.allSoldPhotos = offeredPhotos.concat(soldPhotos.reverse());
                    console.log($scope.allSoldPhotos);
                  }
                }
                else {
                  if(i === userPhotos.length-1){
                    $scope.allSoldPhotos = offeredPhotos.concat(soldPhotos.reverse());
                    console.log($scope.allSoldPhotos);
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
    $scope.opTog = true;
    var d = 45;
    function addSpinner(){
      if($scope.loadingModal){
        $('.loadSpinner').css({
          '-moz-transform':'rotate('+d+'deg)',
          '-webkit-transform':'rotate('+d+'deg)',
          '-o-transform':'rotate('+d+'deg)',
          '-ms-transform':'rotate('+d+'deg)',
          'transform': 'rotate('+d+'deg)'
        });

        if(d >= 360){
          d = 0;
        }
      d+=45;
      }
    }
    var spinnerInterval = setInterval(addSpinner, 500);
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
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 200);
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 500);
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 1000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 1500);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 2000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 3000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 4000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 5000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 7000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 8000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 10000);
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
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 200);
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 500);
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 1000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 1500);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 2000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 3000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 4000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 5000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 7000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 8000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 10000);
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
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 200);
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 500);
            // setTimeout(function(){
            //   $scope.loadingModal = false;
            //   $('.loadSpinner').remove();
            //   $('.loadSpinnerBlack').remove();
            //   clearInterval(spinnerInterval);
            // }, 1000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 1500);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 2000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 3000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 4000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 5000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 7000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 8000);
            setTimeout(function(){
              $scope.loadingModal = false;
              $('.loadSpinner').remove();
              $('.loadSpinnerBlack').remove();
              clearInterval(spinnerInterval);
            }, 10000);
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
      clearInterval(spinnerInterval);

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
        clearInterval(spinnerInterval);
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
          ,borderBottom: "5px solid white"
        })
      }
      else if(submission()){
        $('.submittedTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid white"
        })
      }
      else if(finance()){
        $('.moneyTabInner').css({
          fontStyle: 'bold'
          ,fontSize: "19px"
          ,borderBottom: "5px solid white"
        })
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
        $ionicScrollDelegate.scrollTo(0, $scope.scrollPosition, false);
      }
      $ionicScrollDelegate.freezeAllScrolls(false);
    }
    $scope.closeHamburgerBody = closeHamburgerBody;


    //////////logic for hamburger menu////////
    //////////////////////////////////////////

    ///////function to accept or reject price
    function buyRejectPhoto(status, photo){
      console.log(status);
      console.log(photo);
      $http({
        method: "POST"
        ,url: 'https://moneyshotapi.herokuapp.com/api/photopurchase'
        ,data: {status: status, photoId: photo._id, userId: $scope.userInfo._id, refresh_token: $scope.userInfo.refresh_token, price: photo.price}
      })
      .then(function(updatedPhoto){
        console.log('check status below');
        console.log(updatedPhoto);
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
        console.log(data);
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
        console.log(allTrans);
        var length = allTrans.data.length;
        for (var i = 0; i < length; i++) {
          console.log(allTrans.data[i].photos[0].thumbnail);
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
      console.log(transData);
      var isOpen = $(evt.currentTarget).hasClass('opened');
      var parentEl = $(evt.currentTarget).parent();
      if(!isOpen){
        parentEl.animate({
          height: "160px"
        }, 1000);
        $(evt.currentTarget).animate({
          marginTop: "130px"
        }, 1000);
        parentEl.prepend(
          "<div class='finMoreDetails'>"+
            "<div class='tempFinInfo'>"+
              "Coming Soon"+
            "</div>"+
          "</div>"
        );
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
          height: "30px"
        }, 1000);
        $(evt.currentTarget).animate({
          marginTop: "0px"
        }, 1000);
        $(evt.currentTarget).removeClass('opened');
        $(evt.currentTarget).text('More Details');
        $('.finMoreDetails').animate({
          opacity: 0
        }, 100);
        setTimeout(function(){
          var moreDetails = $(evt.currentTarget).siblings()[0];
          $(moreDetails).remove();
        }, 1000);
      }
    }
    $scope.openFin = openFin;

    ////end functions to open financial cells///
    ////////////////////////////////////////////



  ////////////////////////
  ////end controller//////
  ///////////////////////
  }
