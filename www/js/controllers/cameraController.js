var testCnt = 0
angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload', 'persistentPhotosFactory', 'userInfoFactory'])

  .controller('cameraCtrl', cameraCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  });

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', '$cordovaStatusbar', '$timeout', '$ionicGesture', '$ionicScrollDelegate', '$interval', 'persistentPhotos', '$cordovaKeyboard', 'userInfo'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture, $cordovaStatusbar, $timeout, $ionicGesture, $ionicScrollDelegate, $interval, persistentPhotos, $cordovaKeyboard, userInfo){
    alert('in camera');
    $scope.mediaCache = [];
    // $scope.photoListLength      = 0;
    $scope.croppedPhoto         = '';
    $scope.submitModalVar       = false;
    $scope.photoCarouselBool    = false;
    $scope.cameraModal          = true;
    $scope.cameraLaunched       = false;
    $scope.cameraToggle         = true;
    $scope.submitPhotoModal     = false;
    $scope.activePhoto          = true;
    $scope.carouselSwipeActive  = false;
    $scope.eraseStopper         = false;
    $scope.selectMode           = false;
    $scope.cameraHot            = false;
    $scope.submitBar            = false;
    $scope.isDisabled           = false;
    $scope.inputsFocused        = false;
    $scope.burstCounter         = 0;
    $scope.cameraMode           = 'photo';
    $scope.flashOnOff           = 'off'
    $scope.flash                = "Flash on";
    $scope.mediaCacheTemp       = [];
    $scope.cropper              = {};
    $scope.cropper.croppedImage = '';
    var googId = 'AIzaSyDspcymxHqhUaiLh2YcwV67ZNhlGd4FyxQ';
    var count = 0;
    var eraseSubmitArr          = [];

    function findZoomed(){
      if(window.innerWidth === 320){
        return 'zoomed';
      }
      else if(window.innerWidth === 375){
        return 'standard';
      }
    }
    var zooming = findZoomed();////this determines if the screen is on zoom mode or not
    // runVideoCache();/////primes the video cache

    /////end global variables///
    ////////////////////////////
    // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    // ionic.Platform.ready(function(){
    //   // $timeout(function(){
    //     navigator.splashscreen.hide()
    //     initPage();
    //     $ionicScrollDelegate.freezeScroll(true);
    //   // }, 1000);
    // })
    // }

    /////function that fires on page init
    function initPage(){
      // console.log('yo');
      // // initCamera();
      // navigator.splashscreen.hide()
      // // initPage();
      // $ionicScrollDelegate.freezeScroll(true);
      removeTabsAndBar(initCache);
    }
    $timeout(function(){
      navigator.splashscreen.hide()
      initPage();
      $ionicScrollDelegate.freezeScroll(true);
    }, 2000);

    /////funciotn to get cached videos and photos
    function initCache(){
      var userToken = window.localStorage.webToken;
      setLocalForage();
      initCamera();
      userInfo.promiseOnly(userToken)
      .then(function(data){
        $scope.cachedUser = data.data;
        console.log(data);
        userInfo.userInfoFunc(userToken, false, data.data);
        runVideoCache($scope.cachedUser.tempVideoCache);
        // initCamera();
      });
    }

    ///does all the video stuff
    function runVideoCache(tempVideoArray){
      var vidLength = tempVideoArray.length;
      for (var i = 0; i < vidLength; i++) {
        var thumbnailArr = tempVideoArray[i].url.split('mov');
        var thumbnail = thumbnailArr[0]+"jpg";

        $scope.mediaCache.push({type: 'videoTemp', link: tempVideoArray[i].url, thumb: thumbnail, videoId: tempVideoArray[i]._id});
      }
    }

    //////functino to load camera and set up screen
    function removeTabsAndBar(callback){
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        $('ion-tabs').addClass('tabs-item-hide');
        ionic.Platform.showStatusBar(false);
        // $ionicScrollDelegate.freezeScroll(true);
        callback();
      }
      else {
        $ionicScrollDelegate.scrollTop(true);
        $ionicScrollDelegate.freezeScroll(true);
        $('ion-tabs').addClass('tabs-item-hide');
        $timeout(function(){
          // $ionicScrollDelegate.scrollTop(true);
          $ionicScrollDelegate.freezeScroll(true);
        }, 500);
        callback();
      }
    }
    // removeTabsAndBar();

    //////function to set up our tempprary photo storage between sessions
    function setLocalForage(){
      ////reset local forage cache, uncomment and comment active code to fix issues
      // localforage.setItem('storedPhotos', [])
      // .then(function(dataVal){
      //   console.log('creating array');
      //   console.log(dataVal);
      // })
      // .catch(function(err){
      //   console.log(err);
      // })
      localforage.getItem('storedPhotos')
      .then(function(value){
        if(value === null || value === [null]){
          localforage.setItem('storedPhotos', [])
          .then(function(dataVal){

          })
          .catch(function(err){
            console.log(err);
          })
        }
        else {
          var valLength = value.length;
          for (var i = 0; i < valLength; i++) {
            $scope.mediaCache.push(value[i]);
          }
          // initCamera();
        }
      })
      .catch(function(err){
        console.log(err);
      });
    }

    /////////////////////////////
    //function to launch camera and take photos
    function initCamera(){
      // setLocalForage();
      // var screenWidth = window.innerWidth;
      // var persistentLength = persistentPhotos().length;
      // if(persistentLength === 0){
      // localforage.getItem('storedPhotos')
      // .then(function(photoArr){
      //   $scope.mediaCache = photoArr;
      //   // $scope.photoListLength = photoArr.length;
      // })
      $timeout(function(){
        $scope.activePhoto = false;
        $scope.cameraLaunched = true;
      }, 750);
      // var tapEnabled = false; //enable tap take picture
      // var dragEnabled = false; //enable preview box drag across the screen
      // var toBack = false; //send preview box to the back of the webview
      // console.log(cordova.plugins.camerapreview);
      // if(screenWidth === 320){
      //   var rect = {x: 0, y: 45, width: 320, height: 400};
      // }
      // else if(screenWidth === 375){
      //   var rect = {x: 0, y: 45, width: 375, height: 468.75};
      // }
      // $timeout(function(){
      //   // cordova.plugins.camerapreview.show();
      //   // var showCallback = function(){
      //   //   console.log('yoo camera show');
      //   // }
      //   // showCamera(showCallback);
      //   // $(window).unload(function(){
      //   //   cordova.plugins.camerapreview.hide();
      //   //   cordova.plugins.camerapreview.stopCamera();
      //   //   $ionic.Platform.exitApp();
      //   // });
      // }, 300);
      $timeout(function(){
        // cordova.plugins.camerapreview.startCamera(rect, 'back', tapEnabled, dragEnabled, toBack);
        var showCallback = function(){
          setPictureCallback();
          $(window).unload(function(){
            cordova.plugins.camerapreview.hide();
            cordova.plugins.camerapreview.stopCamera();
            $ionic.Platform.exitApp();
          });
        }
        var startCallback = showCamera;
        startCamera(startCallback, showCallback);////startCallback now firing?
        // setPictureCallback();
      }, 500);


      // cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
      //   if($scope.cameraMode === "burst"){
      //     $scope.burstCounter--;
      //   }
      //   else if($scope.burstCounter > 0){
      //     $scope.burstCounter = 0;
      //   }
      //   $scope.mediaCache.push({type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date()});
      //   $scope.$apply();
      //   cordova.plugins.camerapreview.show();
      //   var windowPic = {type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date()};
      //   localforage.setItem('storedPhotos', $scope.mediaCache)
      //   .then(function(newPhotoArr){
      //     ///////////prevents from opening submit modal while the camera is still processing, to prevent crashes
      //     $scope.cameraHot = false;
      //     // console.log('false');
      //   })
      //   .catch(function(err){
      //     console.log(err);
      //   })
      //   count++
      //   $('.takePhotoButtonInner').animate({
      //     backgroundColor: "white"
      //   }, 100);
      //   $scope.activePhoto = false;
      // });
    }

    function startCamera(callback, CBparam){
      var screenWidth = window.innerWidth;

      var tapEnabled = false; //enable tap take picture
      var dragEnabled = false; //enable preview box drag across the screen
      var toBack = false; //send preview box to the back of the webview
      if(screenWidth === 320){
        var rect = {x: 0, y: 45, width: 320, height: 400};
      }
      else if(screenWidth === 375){
        var rect = {x: 0, y: 45, width: 375, height: 468.75};
      }
      cordova.plugins.camerapreview.startCamera(rect, 'back', tapEnabled, dragEnabled, toBack);
      callback(CBparam);
    }

    function showCamera(callback){
      cordova.plugins.camerapreview.show();
      callback();
    }

    function setPictureCallback(){
      cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
        if($scope.cameraMode === "burst"){
          $scope.burstCounter--;
        }
        else if($scope.burstCounter > 0){
          $scope.burstCounter = 0;
        }
        $scope.mediaCache.push({type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date()});
        $scope.$apply();
        cordova.plugins.camerapreview.show();
        var windowPic = {type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date()};
        localforage.setItem('storedPhotos', $scope.mediaCache)
        .then(function(newPhotoArr){
          ///////////prevents from opening submit modal while the camera is still processing, to prevent crashes
          $scope.cameraHot = false;
          // console.log('false');
        })
        .catch(function(err){
          console.log(err);
        })
        count++
        $('.takePhotoButtonInner').animate({
          backgroundColor: "white"
        }, 100);
        $scope.activePhoto = false;
      });
      // callback();
    }

    $scope.takeCordovaPicture = function(){
      if($scope.activePhoto === false && $scope.mediaCache.length < 20){
        $scope.activePhoto = true;
        $scope.cameraHot = true;
        window.plugins.flashlight.switchOff();
        cordova.plugins.camerapreview.takePicture({maxWidth: 2000, maxHeight: 2000});
        // window.plugins.flashlight.switchOff();
        $('.takePhotoButtonInner').css({
          backgroundColor: "red"
        });
        cordova.plugins.camerapreview.hide();
        // $scope.photoListLength++;
      }
      else if($scope.mediaCache.length >= 20 && $scope.cameraMode === 'photo'){
        alert('Sorry, you can only send up to 25 pictures or photos at a time. Please erase a few to free up room to take more MoPhos. Thank you!')
      }
    }

    var photoInt = function(){
      $scope.burstCounter = 7;
       var photoInterval = $interval(function(){
         if($scope.burstCounter > 0){
           $scope.takeCordovaPicture();
         }
         else {
           clearPhotoInt();
           console.log('chamber empty');
         }
       }, 200);

       function clearPhotoInt(){
         $scope.burstCounter = 0;
         $interval.cancel(photoInterval);
       }
       $scope.clearPhotoInt = clearPhotoInt;
      }

    $scope.photoInt = photoInt;

    // function to flip the camera
    function flipCamera(){
      if($scope.cameraToggle){
        CanvasCamera.setCameraPosition(2);
        $scope.cameraToggle = false;
      }
      else if(!$scope.cameraToggle) {
        CanvasCamera.setCameraPosition(1);
        $scope.cameraToggle = true;
      }
    }
    $scope.flipCamera = flipCamera;

    $scope.cntPhoto = 0;
    function getPic(){
      if($scope.activePhoto === false && $scope.mediaCache.length < 20){
        $cordovaCapture.captureVideo({quality : 100})
        .then(function(result){
          console.log(result);

          ///////here we fire off video to temp storage on our server to save video in case of app closure
          $http({
            method: "GET"
            ,url: "https://moneyshotapi.herokuapp.com/api/decodetoken/"+window.localStorage.webToken
          })
          .then(function(decodedToken){
            console.log(decodedToken);
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/temp/video', result[0].fullPath, {params: {userId: decodedToken.data.userId}}, true)
            .then(function(updatedUser){
              console.log(updatedUser);
              console.log(updatedUser.response);
              console.log(updatedUser.response);
              console.log(JSON.parse(updatedUser.response));
            })
          });

          ////////////////
          // $scope.photoListLength++;
          var pathFull = result[0].fullPath;///////this is what we need to add to our cache
          var thumbOpts = {
            mode: 'file'
            ,quality: 1
            ,mode: 'base64'
            ,resize: {
              width: '350px'
              ,height: '350px'
            }
          }
          var source = result[0].localURL
          var fPath = source.split(result[0].name)[0] + $scope.cntPhoto++ + 'test.jpg'
          window.PKVideoThumbnail.createThumbnail ( source, fPath, thumbOpts )
          .then( function( thumbnail ){
            $scope.mediaCache.push({
              type: "video"
              ,link: pathFull
              ,thumb: thumbnail
              ,date: new Date()
            });
           })
           .catch( function(err){
             console.log('Thumbnail Error======================', err)
           })
          });
          var thisEl = $('.outCameraModal')[0];
          animateClick(thisEl, 'white', 'transparent');
      }
      else if($scope.mediaCache.length >= 20){
        if(!$scope.alerted){
          $scope.alerted = true;
          $timeout(function(){
            $scope.alerted = false
          }, 1500);
          alert('Sorry, you can only send up to 25 pictures or photos at a time. Please erase a few to free up room to take more MoPhos. Thank you!')
        }
      }
    }
    $scope.getPic = getPic;

    function selectSubmitted(evt, index){
      var circleEl = $(evt.currentTarget).children()[1];
      var targetEl = $($(evt.currentTarget)[0].nextElementSibling.nextElementSibling);
      if(!$(circleEl).hasClass('selected')){
        $(circleEl).addClass('selected');
        $(circleEl).removeClass('fa-circle-thin');
        $(circleEl).addClass('fa-circle');
        targetEl.css({
          outline: "5px solid white"
        })
        eraseSubmitArr.push(index);
        // $scope.mediaCache.splice(index, 1);
      }
      else {
        targetEl.css({
          outline: ""
        })
        $(circleEl).removeClass('selected');
        $(circleEl).removeClass('fa-circle');
        $(circleEl).addClass('fa-circle-thin');
        eraseSubmitArr = eraseSubmitArr.sort();
        for (var i = 0; i < eraseSubmitArr.length; i++) {
          if(eraseSubmitArr[i] == index){
            eraseSubmitArr[i] = null;
          }
        };
        for (var i = 0; i < eraseSubmitArr.length; i++) {
          if(eraseSubmitArr[i] == null){
            eraseSubmitArr.splice(i, 1)
          }
        }
      }

    }
    $scope.selectSubmitted = selectSubmitted;

    function submitPhotoName(){
      var nameInfo = $(".photoNameInput").val();
      var personInfo = $('.photoNameDesc').val();
      $ionicScrollDelegate.scrollTo(0, 0, true);
      if(nameInfo.length > 1 && personInfo.length > 1){
        $scope.submitBar = true;
        submitNameAndPhotos();
      }
      else {
        alert('You seem to have missed a field')
      }
    }
    $scope.submitPhotoName = submitPhotoName;

    //////function to submit all cached photos from your session to the db
    function submitAllPhotos(set){
      cordova.plugins.camerapreview.hide();
      $scope.set = set;
      $timeout(function(){
        $scope.submitPhotoModal = true;
        $scope.submitBar        = false;
      }, 15);
    }
    $scope.submitAllPhotos = submitAllPhotos;

    /////function to close the loading modal
    function closeLoadingModal(){
      $(".submitPhotoBacking").animate({
        opacity: 0
      }, 250);
      $ionicScrollDelegate.freezeScroll(true);
      $timeout(function(){
        $scope.submitPhotoModal = false;
        $scope.submitBar        = true;
      }, 251);
    }
    $scope.closeLoadingModal = closeLoadingModal;

    function submitNameAndPhotos(){
      var submissionData;
      var set = $scope.mediaCache;
      var setLength = set.length;
      var zeroProgress = 0;
      var progressPercentage = 100/setLength;
      //////through our if-statement below, we'll need to add different options so that photos and videos get processed correctly
      // var photoOptions = {
      //     quality : 95,
      //     destinationType : Camera.DestinationType.FILE_URI,
      //     sourceType : Camera.PictureSourceType.Camera ,
      //     allowEdit : true,
      //     encodingType: Camera.EncodingType.JPEG,
      //     popoverOptions: CameraPopoverOptions,
      //     saveToPhotoAlbum: false,
      //     params: {naturalWidth: 0, naturalHeight: 0}
      // };
      // var videoOptions = {
      //
      // }
      var submissionData = {photos: [], videos: [], userId: '', metaData: {}};
      //////first we need to find the users ID, so we can use it to make the post requests
      $http({
        method: "GET"
        ,url: "https://moneyshotapi.herokuapp.com/api/decodetoken/"+window.localStorage.webToken
      })
      .then(function(decodedToken){
        var userFullId = decodedToken.data.userId;
        navigator.geolocation.getCurrentPosition(function(position){
          submissionData.metaData.latitude = position.coords.latitude;
          submissionData.metaData.longitude = position.coords.longitude;
          submissionData.metaData.address = $scope.returnPlace;
          submissionData.metaData.date = $scope.returnDate();
          submissionData.metaData.who = $('.photoNameInput').val();
          submissionData.metaData.what = $('.photoNameDesc').val();
        });
        submissionData.userId = userFullId;

        ////now iterate through to submit to backend
        //////set === mediacache
        console.log(set);
        console.log(set.length);
        for (var i = 0; i < set.length; i++) {
          var hardI = 'hard'+i
          console.log(hardI);
          console.log(set[i]);
          if(set[i].type === "video"){
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/upload/video', set[i].link, {})
            .then(function(callbackImage){
              console.log('video made '+hardI);
              var progressElement = $('.submitProgressBar');
              if(zeroProgress <= 100){
                zeroProgress += progressPercentage;
                progressElement.animate({
                  width: zeroProgress+"%"
                }, 200);
              }
              var splitUrl = callbackImage.response.split('');
              var sliced = splitUrl.slice(1, callbackImage.response.split('').length - 1).join('');

              $http({
                method: "POST"
                ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                ,data: {url: sliced, userId: userFullId, isVid: true}
              })
              .then(function(newVid){
                console.log('video model made '+hardI);
                console.log('Boom!');

                submissionData.videos.push(newVid.data._id);
                var vids = submissionData.videos.length;
                var phots = submissionData.photos.length;
                var amalgam = vids + phots;
                console.log(vids);
                console.log(phots);
                if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === true){
                  console.log('at the end');
                  $http({
                    method: "POST"
                    ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                    console.log('submission made '+hardI);
                    // userInfo.userInfoFunc(window.localStorage.webToken, true);
                    $timeout(function(){
                      $scope.submitModalVar = false;
                      $scope.cameraModal = false;
                      localforage.setItem('storedPhotos', [])
                      .then(function(success){
                        console.log('submitted');
                        $scope.cachedUser.tempVideoCache = [];
                        userInfo.userInfoFunc('blah', false, $scope.cachedUser);
                        userInfo.userInfoFunc(window.localStorage.webToken, true);
                        $state.reload(true);
                      })
                      .catch(function(err){
                        console.log(err);
                      })
                      $scope.cnt = 0;
                      // $state.reload(true);
                    }, 1000);
                  })
                }
                else if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === false){
                  $scope.isDisabled = false;
                }
              })
            })
          }
          else if(set[i].type === "videoTemp"){
            console.log('temp vid starts '+hardI);
            console.log(set[i]);

            var progressElement = $('.submitProgressBar');
            if(zeroProgress <= 100){
              zeroProgress += progressPercentage;
              progressElement.animate({
                width: zeroProgress+"%"
              }, 200);
            }
            console.log('progress bar done '+hardI);

            $http({
              method: "POST"
              ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
              ,data: {url: set[i].link, userId: userFullId, isVid: true}////////PROBLEM   Ned to get that userOd above, it's shooting nulls
            })
            .then(function(newVid){
              console.log('new video made '+hardI);

              submissionData.videos.push(newVid.data._id);
              var vids = submissionData.videos.length;
              var phots = submissionData.photos.length;
              var amalgam = vids + phots;
              console.log(vids);
              console.log(phots);
              if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === true){
                console.log('at the end');
                $http({
                  method: "POST"
                  ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                  ,data: submissionData
                })
                .then(function(newSubmission){
                  console.log('new submission made '+hardI);
                  // userInfo.userInfoFunc(window.localStorage.webToken, true);
                  setTimeout(function(){
                    $scope.submitModalVar = false;
                    $scope.cameraModal = false;
                    localforage.setItem('storedPhotos', [])
                    .then(function(success){
                      console.log('submitted');
                      $scope.cachedUser.tempVideoCache = [];
                      userInfo.userInfoFunc('blah', false, $scope.cachedUser);
                      userInfo.userInfoFunc(window.localStorage.webToken, true);
                      $state.reload(true);
                    })
                    .catch(function(err){
                      console.log(err);
                    })
                    $scope.cnt = 0;
                    // $state.reload(true);
                  }, 100);
                })
              }
              else if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === false){
                $scope.isDisabled = false;
              }
            })
          }
          else if(set[i].type === "photo"){
            console.log('start photo '+hardI);
            console.log(set[i]);

            function photoIife(currentP){
              var currentPhoto = currentP;
              var photoOptions = {
                  quality : 95,
                  destinationType : Camera.DestinationType.FILE_URI,
                  sourceType : Camera.PictureSourceType.Camera ,
                  allowEdit : true,
                  encodingType: Camera.EncodingType.JPEG,
                  popoverOptions: CameraPopoverOptions,
                  saveToPhotoAlbum: false
              };
              $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', currentPhoto.link, photoOptions)
              .then(function(callbackImage){
                console.log('photo made '+hardI);

                var progressElement = $('.submitProgressBar');
                if(zeroProgress <= 100){
                  zeroProgress += progressPercentage;
                  progressElement.animate({
                    width: zeroProgress+"%"
                  }, 200);
                }
                var parsedPhoto = JSON.parse(callbackImage.response);
                $http({
                  method: "POST"
                  ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                  ,data: {url: parsedPhoto.secure_url, thumbnail: parsedPhoto.thumbnail, userId: userFullId, isVid: false}
                })
                .then(function(newPhoto){
                  console.log('photo model made '+hardI);

                  submissionData.photos.push(newPhoto.data._id);
                  var vids = submissionData.videos.length;
                  var phots = submissionData.photos.length;
                  console.log(vids);
                  console.log(phots);
                  var amalgam = vids + phots;
                  console.log(amalgam);
                  if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === true){
                    console.log('at the end');
                    $http({
                      method: "POST"
                      ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                      ,data: submissionData
                    })
                    .then(function(newSubmission){
                      console.log('photo submission made '+hardI);
                      // userInfo.userInfoFunc(window.localStorage.webToken, true);

                      setTimeout(function(){
                        $scope.submitModalVar = false;
                        $scope.cameraModal = false;
                        localforage.setItem('storedPhotos', [])
                        .then(function(success){
                          console.log('submitted');
                          $scope.cachedUser.tempVideoCache = [];
                          userInfo.userInfoFunc('blah', false, $scope.cachedUser);
                          userInfo.userInfoFunc(window.localStorage.webToken, true);
                          $state.reload(true);
                        })
                        .catch(function(err){
                          console.log(err);
                        })
                        $scope.cnt = 0;

                      }, 100);
                    })
                  }
                  else if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === false){
                    $scope.isDisabled = false;
                  }
                })
              })
            }
            photoIife(set[i]);
          }
        }
      });
    }

    function emergencyCancelSubmit(){
      console.log('cancelling');
      $scope.submitBar = false;
      $scope.isDisabled = true;
      // $timeout(function(){
      //   $scope.isDisabled = false;
      // }, 5000);
    }
    $scope.emergencyCancelSubmit = emergencyCancelSubmit;

    function backToSubmit(){
      $('.submitCropContainer').animate({
        marginLeft: 100+"%"
      }, 700);
      setTimeout(function(){
        $('#image').remove();
        $('.cropper-container').remove();
      });
    }
    $scope.backToSubmit = backToSubmit;

    function setCellSize(){
      console.log('resizing');
      var cacheLength = $scope.mediaCache.length;
      console.log(cacheLength);
      if(cacheLength <= 4){
        $timeout(function(){
          $('.submitCell').width('185px');
          $('.submitCell').height('185px');
        }, 1000);
      }
      else if(cacheLength <= 9){
        $timeout(function(){
          $('.submitCell').width('123.33px');
          $('.submitCell').height('123.33px');
        }, 2300);
      }
      else if(cacheLength <= 16){
        $timeout(function(){
          $('.submitCell').width('92.5px');
          $('.submitCell').height('92.5px');
        }, 3100);
      }
    }

    function submitModalOpen(){
      console.log('opening');
      if($scope.cameraHot === false){
        cordova.plugins.camerapreview.hide();
        $scope.submitModalVar = true;
        // setCellSize();

        ////////logic to adjust size of cells
        setCellSize();
        // $timeout(function(){
        //   returnPlace();
        // }, 1500);


        $timeout(function(){
          returnPlace();
          for (var i = 0; i < 5; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i]);
            }
          }
        }, 750);
        $timeout(function(){
          for (var i = 5; i < 10; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i]);
            }
          }
        }, 1500);
        $timeout(function(){
          for (var i = 10; i < 15; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i]);
            }
          }
        }, 2250);
        $timeout(function(){
          for (var i = 15; i < 20; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i]);
            }
          }
        }, 3000);
        $timeout(function(){
          for (var i = 20; i < 25; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i]);
            }
          }
        }, 3750);
      }
    }

    $scope.submitModalOpen = submitModalOpen;

    function backToPhotos(){
      $timeout(function(){
        $scope.mediaCacheTemp = [];
        $scope.submitModalVar = false;
        cordova.plugins.camerapreview.show();
      }, 200);
    }
    $scope.backToPhotos = backToPhotos;

    function toggleView(evt){
      cordova.plugins.camerapreview.switchCamera();
    }
    $scope.toggleView = toggleView;

    function leaveCamera(){
      setTimeout(function(){
        // persistentPhotos($scope.mediaCache);
        cordova.plugins.camerapreview.hide();
        $state.go('tab.account');
      }, 150);
    }
    $scope.leaveCamera = leaveCamera;

    ///////function to animate button presses for any inserted element
    function animateClick(jsEl, color1, color2){
      var jqEl = $(jsEl);
      jqEl.css({
        backgroundColor: color1
      })
      jqEl.animate({
        backgroundColor: color2
      }, 350);
    }

    function switchCamera(mode){
      $scope.cameraMode = mode;
      $('.opPhoto, .opVideo, .opBurst').css({
        fontSize: '16px'
        ,fontWeight: '700'
      });
      if(mode === 'photo'){
        $(".opPhoto").css({
          fontSize: '19px'
          ,fontWeight: '900'
        });
      }
      if(mode === 'video'){
        $(".opVideo").css({
          fontSize: '19px'
          ,fontWeight: '900'
        });
      }
      if(mode === 'burst'){
        $(".opBurst").css({
          fontSize: '19px'
          ,fontWeight: '900'
        });
      }
    }
    $scope.switchCamera = switchCamera;

    function returnDate(){
      return moment().format('MMMM Do YYYY, h:mm:ss a');
    }
    $scope.returnDate = returnDate;

    function returnPlace(){
      $('.fa-refresh').addClass("fa-spin");
      $scope.returnPlace = '- - - - - - - - - - - - - - - - - - - - '
      $timeout(function(){
        $('.fa-refresh').removeClass("fa-spin");
      }, 1000);
      $('.locationHolder').children('i');
      $($('.locationHolder').children('i')[0]).css({
        color: 'red'
      })
      $('.locationHolder').children('i').animate({
        color: 'white'
      }, 500);
      var curr = navigator.geolocation.getCurrentPosition(function(pos){
        var longitude = pos.coords.longitude;
        var latitude = pos.coords.latitude;
        var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius=100&rankBy=distance&types=establishment&key=AIzaSyDspcymxHqhUaiLh2YcwV67ZNhlGd4FyxQ'
        $http({
          method: "GET"
          ,url: url
          ,dataType: 'jsonp',
        })
        .then(function(posData){
          $scope.returnPlace = posData.data.results[0].vicinity;
        })

      });
    }
    $scope.findNewPlace = returnPlace;

    ///////begin photo carousel animation work
    function goToCarousel(mediaData, index, evt){
      console.log($scope.mediaCache);
      //////thsi is normal carousel functionality
      if($scope.selectMode === false){
        $scope.photoCarouselObject = mediaData;////this is always the centerpiece photo
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
            $($('.photoCarouselCell')[index]).addClass('carouselSelected');
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
              width: ($('.photoCarouselCell').length*70)+152.5+'px'
            });
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
      else {
        selectHighlightPhotos(mediaData, index, evt);
      }
    }
    $scope.goToCarousel = goToCarousel;


    function photoCarouselBack(){
      $scope.submitModaVar = true;
      console.log('yoooooooooooooooo');
      setCellSize();
      $timeout(function(){
        $scope.photoCarouselBool = false;
      }, 200);
    }
    $scope.photoCarouselBack = photoCarouselBack;

    function openNewCarouselPhoto(mediaData, index, direction){
      $scope.photoCarouselObject = mediaData;
      var mediaLength = $('.photoCarouselCell').length;
      console.log(index);
      if(zooming === 'zoomed'){
        var dist = (index*70);
      }
      else if(zooming === 'standard'){
        var dist = (index*70);
      }
      $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(dist, 0, true);
    }
    $scope.openNewCarouselPhoto = openNewCarouselPhoto;

    function clickCarouselPhoto(mediaData, index){
      $scope.photoCarouselObject = mediaData;
      var mediaLength = $('.photoCarouselCell').length;
      console.log(index);
      if(zooming === 'zoomed'){
        var dist = (index*70);
      }
      else if(zooming === 'standard'){
        var dist = (index*70);
      }
      $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(dist, 0, true);
    }
    $scope.clickCarouselPhoto = clickCarouselPhoto;

    function changeCarouselPhoto(newMedia){
      $scope.photoCarouselObject = newMedia;
      $scope.$apply();
    }
    $scope.changeCarouselPhoto = changeCarouselPhoto;

    function carouselScroll(){
      console.log($scope.mediaCache);
      var scrollPos = $ionicScrollDelegate.$getByHandle('carouselScroll').getScrollPosition().left;

      if(scrollPos >= 0 && scrollPos < 36){
        var newMedia = $scope.mediaCache[0];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 36 && scrollPos < 105){
        var newMedia = $scope.mediaCache[1];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 106 && scrollPos < 175){
        var newMedia = $scope.mediaCache[2];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 176 && scrollPos < 245){
        var newMedia = $scope.mediaCache[3];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 246 && scrollPos < 315){
        var newMedia = $scope.mediaCache[4];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 316 && scrollPos < 385){
        var newMedia = $scope.mediaCache[5];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 386 && scrollPos < 455){
        var newMedia = $scope.mediaCache[6];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 456 && scrollPos < 525){
        var newMedia = $scope.mediaCache[7];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 526 && scrollPos < 595){
        var newMedia = $scope.mediaCache[8];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 596 && scrollPos < 665){
        var newMedia = $scope.mediaCache[9];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 666 && scrollPos < 735){
        var newMedia = $scope.mediaCache[10];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 736 && scrollPos < 805){
        var newMedia = $scope.mediaCache[11];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 806 && scrollPos < 875){
        var newMedia = $scope.mediaCache[12];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 876 && scrollPos < 945){
        var newMedia = $scope.mediaCache[13];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 946 && scrollPos < 1015){
        var newMedia = $scope.mediaCache[14];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1016 && scrollPos < 1085){
        var newMedia = $scope.mediaCache[15];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1086 && scrollPos < 1155){
        var newMedia = $scope.mediaCache[16];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1156 && scrollPos < 1225){
        var newMedia = $scope.mediaCache[17];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1226 && scrollPos < 1295){
        var newMedia = $scope.mediaCache[18];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1296 && scrollPos < 1365){
        var newMedia = $scope.mediaCache[19];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1366 && scrollPos < 1435){
        var newMedia = $scope.mediaCache[20];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1436 && scrollPos < 1505){
        var newMedia = $scope.mediaCache[21];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1506 && scrollPos < 1575){
        var newMedia = $scope.mediaCache[22];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1576 && scrollPos < 1635){
        var newMedia = $scope.mediaCache[23];
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1636 && scrollPos < 1705){
        var newMedia = $scope.mediaCache[24];
        changeCarouselPhoto(newMedia);
      }
    }
    $scope.carouselScroll = carouselScroll;

    //////carousel swipe functions
    function photoCarouselSwipeLeft(){
        $scope.carouselSwipeActive = true;
        var centerP = findCenterPhoto();
        if(centerP.index+1 < $scope.mediaCache.length){
          openNewCarouselPhoto($scope.mediaCache[centerP.index+1], centerP.index+1, 'left');
        }
    }
    $scope.photoCarouselSwipeLeft = photoCarouselSwipeLeft;

    function photoCarouselSwipeRight(){
      var centerP = findCenterPhoto();
      if(centerP.index > 0){
        openNewCarouselPhoto($scope.mediaCache[centerP.index-1], centerP.index-1, 'right')
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

    function selectHighlightPhotos(media, index, evt){
      if(!$(evt.currentTarget).hasClass('selectedP')){
        $(evt.currentTarget).addClass('selectedP');
        var parent = $(evt.currentTarget).parent();
        parent.prepend(
          "<p class='fa fa-check-circle photoCheck'></p>"
        );
      }
      else if($(evt.currentTarget).hasClass('selectedP')){
        $(evt.currentTarget).removeClass('selectedP');
        var parent = $(evt.currentTarget).parent();
        parent.find('.photoCheck').remove();
      }
    }

    function selectPhotos(){
      if($scope.selectMode === false){
        $(".submitAddInfoContainer").animate({
          marginTop: '40px'
          ,opacity: 0.6
        }, 200);
        $('.finalizeMophos').text('Select Mophos');
        $('.selectPhotos').text('Close');
        $timeout(function(){
          $scope.selectMode = true;
        }, 100)
      }
      else if($scope.selectMode === true){
        $(".submitAddInfoContainer").animate({
          marginTop: '10px'
          ,opacity: 1
        });
        $('.finalizeMophos').text('Finalize Mophos');
        $('.selectPhotos').text('Select');
        /////logic for it to all set back
        var allPhotos = $('.submitCellImageHolder');
        console.log(allPhotos);
        var allLength = allPhotos.length;
        for (var i = 0; i < allLength; i++) {
          console.log(allPhotos[i]);
          var child = $(allPhotos[i]).find('img');
          console.log(child);
          if(child.hasClass('selectedP')){
            child.removeClass('selectedP');
            $(allPhotos[i]).find('.photoCheck').remove();
          }
        }
        $scope.selectMode = false;
      }
    }
    $scope.selectPhotos = selectPhotos;

    function batchErase(){
      var confirmErase = confirm('Erase all selected photos?');
      if(confirm){
        localforage.getItem('storedPhotos')
        .then(function(storedArr){
          var stored = storedArr;
          var arrObj =  $.makeArray(document.getElementsByClassName('submitCellImageHolder'));
          var eraseCount = 0;
          $timeout(function(){
            var allPhotos = $('.submitCellImageHolder');
            var allLength = allPhotos.length;
            for (var i = 0; i < allLength; i++) {
              var child = $(allPhotos[i]).find('img');
              if(child.hasClass('selectedP')){

                $scope.mediaCache.splice((i-eraseCount), 1);
                $scope.mediaCacheTemp.splice((i-eraseCount), 1);
                $scope.$apply();
                eraseCount++;
              }
              if(i === allLength-1){
                localforage.setItem('storedPhotos', $scope.mediaCache)
                .then(function(newArray){
                  setCellSize();
                })
                .catch(function(err){
                  console.log(err);
                });
              }
            }
          }, 50);
        })
      }
    }
    $scope.batchErase = batchErase;

    function eraseSinglePhoto(){
      var confirming = confirm('Erase this photo?');
      if(confirming){
        var mediaLength = $scope.mediaCache.length;
        var testLink1 = $scope.photoCarouselObject.link;
        for (var i = 0; i < mediaLength; i++) {
          if($scope.mediaCache[i]){
            var testLink2 = $scope.mediaCache[i].link;
          }
          else {
            var testLink2 = "blah blah blah";
          }
          if(testLink1 === testLink2 && $scope.eraseStopper === false){
            $scope.mediaCache.splice(i, 1);
            $scope.mediaCacheTemp.splice(i, 1);
            var caughtIt = parseInt(String(i));
            $scope.eraseStopper = true;
            localforage.setItem('storedPhotos', $scope.mediaCache)
            .then(function(success){
              $scope.eraseStopper = false;
              if(mediaLength === 1){
                $scope.photoCarouselBool = false;
                $scope.$apply();
              }
              else if(caughtIt === mediaLength-1){
                $($('.photoCarouselCell')[caughtIt-1]).addClass('carouselSelected');
                $scope.photoCarouselObject = $('.photoCarouselCell')[caughtIt-1];
                $scope.$apply();
                var carWidth = $('.photoCarouselInner').width();
                $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(carWidth-140, 0, true);
                $('.photoCarouselInner').width(carWidth-70);
              }
              else {
                $($('.photoCarouselCell')[caughtIt]).addClass('carouselSelected');
                $scope.photoCarouselObject = $scope.mediaCache[caughtIt];
                var carWidth = $('.photoCarouselInner').width();
                $('.photoCarouselInner').width(carWidth-70);
                $scope.$apply();
              }
            })
            .catch(function(err){
              console.log(err);
            })
          }
        }
      }
      console.log($scope.mediaCache);
    }
    $scope.eraseSinglePhoto = eraseSinglePhoto;

    //////flash button animation
    function animateFlash(){
      $('.cameraFlash').css({
        opacity: 0.25
      });
      $timeout(function(){
        $('.cameraFlash').css({
          opacity: 1
        });
      }, 200);
    }
    $scope.animateFlash = animateFlash;

    //////x button animation
    function animateSubmit(){
      $('.cameraButtonCell').css({
        opacity: 0.25
      });
      $('.cameraButtonCell').animate({
        opacity: 1
      }, 200);
    }
    $scope.animateSubmit = animateSubmit;

    //////back button animation
    function animateBack(){
      $('.backToPhotos').css({
        opacity: 0.25
      });
      $('.backToPhotos').animate({
        opacity: 1
      }, 200);
    }
    $scope.animateBack = animateBack;

    //////back button animation
    function animateBackCarousel(){
      $('.photoCarouselBack').css({
        opacity: 0.25
      });
      $('.photoCarouselBack').animate({
        opacity: 1
      }, 200);
    }
    $scope.animateBackCarousel = animateBackCarousel;

    //////toggle animation
    function animateToggle(){
      $('.toggleCameraIcon').css({
        opacity: 0.25
      });
      $('.toggleCameraIcon').animate({
        opacity: 1
      }, 200);
    }
    $scope.animateToggle = animateToggle;

    /////submit field blur/focus functions
    function focusName(){
      $('.submitRepeat').animate({
        height: '0px'
      }, 250);
      $timeout(function(){
        $scope.inputsFocused = true;
        $scope.isDisabled = true;
      }, 250);
      $timeout(function(){
        $('.photoNameInput').focus();
      }, 500);
    };
    $scope.focusName = focusName;

    function focusText(){
      $('.submitRepeat').animate({
        height: '0px'
      }, 250);
      $timeout(function(){
        $scope.inputsFocused = true;
        $scope.isDisabled = true;
      }, 250);
      $timeout(function(){
        $('.photoNameDesc').focus();
      }, 500);
    }
    $scope.focusText = focusText;

    function blurringText(){
      $scope.inputsFocused = false;
      $timeout(function(){
        if(!$scope.inputsFocused){
          $('.submitRepeat').animate({
            height: '340px'
          }, 250);
          $scope.isDisabled = false;
        }
      }, 1000);
    }
    $scope.blurringText = blurringText;

    function blurringName(){
      $scope.inputsFocused = false;
      $timeout(function(){
        if(!$scope.inputsFocused){
          $('.submitRepeat').animate({
            height: '340px'
          }, 250);
          $scope.isDisabled = false;
        }
      }, 1000);
    };
    $scope.blurringName = blurringName;

    function playVid(){
      var player = $('#carouselVideoCamera')[0];
      var vidDuration = function(){
        return player.duration;
      }
      var vidCurrent = function(){
        return player.currentTime;
      }
      if(vidCurrent() == 0 || vidDuration() - vidCurrent() == 0 || player.paused){
        player.play();
        $('.videoPlayerIcon').css({
          opacity: 0.1
        });
        player.addEventListener('ended', function(){
          $('.videoPlayerIcon').css({
            opacity: 0.5
          });
        });
      }
      else {
        player.pause();
        $('.videoPlayerIcon').css({
          opacity: 0.5
        });
      }
    }
    $scope.playVid = playVid;

    function toggleFlash(){
      if($scope.flashOnOff === 'off'){
        window.plugins.flashlight.switchOn();
        $scope.flashOnOff = 'on';
        $scope.flash = 'Flash off';
        $('.cameraFlashButt').css({
          opacity: 0.5
        });
      }
      else if($scope.flashOnOff === 'on') {
        window.plugins.flashlight.switchOff();
        $scope.flashOnOff = 'off';
        $scope.flash = 'Flash on';
        $('.cameraFlashButt').css({
          opacity: 1
        });
      }
    }
    $scope.toggleFlash = toggleFlash;

  }
