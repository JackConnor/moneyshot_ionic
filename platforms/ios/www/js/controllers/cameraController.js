var testCnt = 0
angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload', 'persistentPhotosFactory', 'userInfoFactory', 'cameraFactory'])

  .controller('cameraCtrl', cameraCtrl)

  .run(function($ionicPlatform, $state, $localStorage){
    window.location.hasLaunched = false;
    // navigator.geolocation.getCurrentPosition(function(pos, err){});
  })

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);

    };
  });

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', '$cordovaStatusbar', '$timeout', '$ionicGesture', '$ionicScrollDelegate', '$interval', 'persistentPhotos', '$cordovaKeyboard', 'userInfo', 'cameraFac', '$localStorage'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture, $cordovaStatusbar, $timeout, $ionicGesture, $ionicScrollDelegate, $interval, persistentPhotos, $cordovaKeyboard, userInfo, cameraFac, $localStorage){
    $('ion-tabs').addClass('tabs-item-hide');
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
    $scope.launchModal          = true;
    $scope.enterButton          = false;
    $scope.orientation          = 'portrait';
    $scope.orientationGamma     = 0;
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


    //////this catch is to prevent advice/button modal from persisting past initial load
    if(window.location.hasLaunched === true){
      $scope.launchModal = false;
    }

    //////function which will return the screenSize of the camera being used
    function findZoomed(){
      if(window.innerWidth === 320){
        return 'zoomed';
      }
      else if(window.innerWidth === 375){
        return 'standard';
      }
    }

    $scope.tipJar = [
      '"always turn your video camera sideways, to capture tv-friendly videos"'
      ,'"take multiple photos rapidly, to increase the chances of getting the perfect shot"'
      ,'"interview snippets make great news content"'
      ,'"take pictures of things that you would like to see on the news"'
      ,'"be careful with the flash; the best photos often use environmental lighting"'
    ]

    $scope.tip = $scope.tipJar[Math.floor(Math.random()*5)];
    function initCheckUser(){
      var userToken = $localStorage.webToken;
      var hasLaunched = window.location.hasLaunched;
      if(hasLaunched === false){
        var httpLoaded = false;
        if(userToken === null || userToken === "null" || userToken === 'undefined' || userToken === undefined){
          userToken = 'null'
        }
        setTimeout(function(){
          if(httpLoaded === false && window.location.hash === "#/tab/camera"){
            initCheckUser();
          }
        }, 3000);
        $http({
          method: "POST"
          ,url: "http://45.55.24.234:5555/api/checktokensignin"
          ,data: {token: userToken}
        })
        .then(function(data){
          var newToken = data.data;
          $scope.newToken = newToken;
          if(data.data === "no token"){
            $state.go( 'signin' )
          }
          else {
            $scope.enterButton = true;
            httpLoaded = true;
          }
        })
      }
      else {
        goLaunch();
      }
    }
    // $scope.initCheckUser = initCheckUser;

    function goLaunch(){
      ionic.Platform.fullScreen(true, false);
      $scope.launchModal = false;
      window.location.hasLaunched = true;
      setLaunchCamera();
    }
    $scope.goLaunch = goLaunch;

    function tempSignout(){
      if($scope.flashOnOff === 'on'){
        window.plugins.flashlight.switchOff();
        $('.cameraFlash').css({
          opacity: 1
        });
      }
      var confirmErase = navigator.notification.confirm('Sign Out of this app?', function(index){
        if(index === 1){
          //callback
        }
        else if(index === 2){
          signoutCallback();
        }
      }, 'Sign Out?', ['No', 'Yes'])

      /////need to fix nexr
      function signoutCallback(){
        var webToken = $localStorage.webToken;
        var userId = $scope.cachedUser._id;
        localforage.getItem('storedPhotos')
        .then(function(storedArr){
          var storedLength = storedArr.length;
          if(storedLength === 0){
            $localStorage.webToken = null;
            userInfo.clearUserInfo();
            gangloadTurnoff();
            window.location.hasLaunched = false;
            $state.go('signin');
          }
          else {
            var counter = 0;
            for (var i = 0; i < storedLength; i++) {
              var beginning = storedArr[i].link.slice(0, 4);
              if(beginning === 'http'){
                $http({
                  method: "POST"
                  ,url: 'http://45.55.24.234:5555/api/temp/photo/http'
                  ,data: {userId: userId, photo: storedArr[i].link, thumb: storedArr[i].thumb}
                })
                .then(function(data){
                  counter++
                  if(counter === storedLength - 1){
                    localforage.setItem('storedPhotos', []);
                    $localStorage.webToken = null;
                    userInfo.clearUserInfo();
                    gangloadTurnoff();
                    window.location.hasLaunched = false;
                    $state.go('signin');
                  }
                })
                .catch(function(err){
                  console.log(err);
                })
              }
              else {
                $cordovaFileTransfer.upload('http://45.55.24.234:5555/api/temp/photo', storedArr[i].link, {params: {userId: userId}})
                .then(function(callbackData){
                  localforage.setItem('storedPhotos', [])
                  .then(function(photos){
                    counter++
                    if(counter === storedLength - 1){
                      userInfo.clearUserInfo();
                      localforage.setItem('storedPhotos', []);
                      $localStorage.webToken = null;
                      gangloadTurnoff();
                      window.location.hasLaunched = false;
                      $state.go('signin');
                    }
                  })
                })
                .catch(function(err){
                  console.log(err);
                })
              }
            }
          }
        })
      }
      ////////end area to fix next

      function gangloadTurnoff(){
        cordova.plugins.camerapreview.hide();
        $timeout(function(){
          cordova.plugins.camerapreview.hide();
        }, 500);
        $timeout(function(){
          cordova.plugins.camerapreview.hide();
        }, 1000);
        $timeout(function(){
          cordova.plugins.camerapreview.hide();
        }, 1500);
        $timeout(function(){
          cordova.plugins.camerapreview.hide();
        }, 2500);
      }
      // $localStorage.webToken = null;
      // $state.go('signin');
    }
    $scope.tempSignout = tempSignout;

    function setLaunchCamera(){
      $timeout(function(){
        console.log($scope.mediaCache);
      }, 6000);
        $ionicScrollDelegate.freezeScroll(true);
        $ionicScrollDelegate.scrollTop();
      // var isReady = ionic.Platform.isReady;
      // // alert(isReady);
      // if(isReady === true){
        // navigator.splashscreen.hide();
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
        cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
          handlePhotoCallback(result)
        });
        $timeout(function(){
          cordova.plugins.camerapreview.startCamera(rect, 'back', tapEnabled, dragEnabled);
          cordova.plugins.camerapreview.show();
          $scope.activePhoto = false;

        }, 500);
        $timeout(function(){
          initCache();
        },1000);
        $timeout(function(){
          $scope.cameraLaunched = true;
        },2000);
      // }
      // else {
      //   $timeout(function(){
      //     setLaunchCamera();
      //   }, 1000);
      // }
    }
    // function launchPlatform(){
    //   var isReady = ionic.Platform.isReady;
    //   // alert(isReady);
    //   if(isReady){
    //     initCheckUser();
    //   }
    //   else {
    //     $timeout(function(){
    //       launchPlatform();
    //     }, 1000);
    //   }
    // }
    // launchPlatform();
    ionic.Platform.ready(function(){      // alert('checking')
      var userLoaded = userInfo.cacheOnly();
      if(userLoaded !== undefined || userLoaded !== 'undefined'){
        $scope.cachedUser = userLoaded;
      }
      else {
        setTimeout(function(){
          var newUser = userInfo.userInfoFunc();
        }, 1000);
      }
      setTimeout(function(){
        initCheckUser();
      }, 1000);
    })

    /////function to get cached videos and photos
    function initCache(){
      var userToken = $localStorage.webToken;
      //////need to toggle if info already loaded
      var cacheOnly = userInfo.cacheOnly();
      if(cacheOnly === undefined || cacheOnly === 'undefined'){
        userInfo.promiseOnly(userToken)
        .then(function(data){
          $scope.cachedUser = data.data;
          var cachedUser = userInfo.userInfoFunc(userToken, false, data.data);
          $scope.zooming = findZoomed()////this determines if the screen is on zoom mode or not
          if($scope.cachedUser.tempPhotoCache.length > 0){
            runPhotoSignoutCache();
          }
          else {
            setLocalForage();
          }
          runVideoCache($scope.cachedUser.tempVideoCache);
          // initCamera();
        });
      }
      else {
        $scope.cachedUser = cacheOnly;
        runVideoCache($scope.cachedUser.tempVideoCache);
        var tempLength = $scope.cachedUser.tempPhotoCache.length;
        if(tempLength > 0){
          runPhotoSignoutCache();
        }
        else {
          setLocalForage();
        }
      }
    }

    ///does all the video stuff
    function runVideoCache(tempVideoArray){
      console.log(tempVideoArray);
      var vidLength = tempVideoArray.length;
      for (var i = 0; i < vidLength; i++) {
        var orientation = tempVideoArray[i].orientation;
        console.log(orientation);
        var thumbnailArr = tempVideoArray[i].videoId.url.split('mov');
        var thumbnail = thumbnailArr[0]+"jpg";
        $scope.mediaCache.push({
          type: 'videoTemp'
          ,link: tempVideoArray[i].videoId.url
          ,thumb: thumbnail
          ,videoId: tempVideoArray[i].videoId._id
          ,orientation: orientation
        });
        console.log($scope.mediaCache);
      }
    }

    function runPhotoSignoutCache(){
      var cacheLength = $scope.cachedUser.tempPhotoCache.length;
      for (var i = 0; i < cacheLength; i++) {
        $scope.mediaCache.push($scope.cachedUser.tempPhotoCache[i]);
        var allPhotos = [];
        for (var k = 0; k < $scope.mediaCache.length; k++) {
          if($scope.mediaCache[k].type === 'photo'){
            allPhotos.push($scope.mediaCache[k])
          }
        }
        localforage.setItem('storedPhotos', allPhotos)
        .then(function(newPhotoArr){
          console.log(newPhotoArr);
        })
        .catch(function(err){
          console.log(err);
        })
        if(i === cacheLength - 1){
          $http({
            method: 'GET'
            ,url: 'http://45.55.24.234:5555/api/erase/temp/photos/'+$scope.cachedUser._id
          })
          .then(function(upUser){
            /////callback
          })
        }
      }
    }



    //////function to set up our tempprary photo storage between sessions
    function setLocalForage(){
      // reset local forage cache, uncomment and comment active code to fix issues
      // localforage.setItem('storedPhotos', [])
      // .then(function(dataVal){
      //   console.log('creating array');
      //   console.log(dataVal);
      // })
      // .catch(function(err){
      //   console.log(err);
      // })
      window.addEventListener("deviceorientation", function(event){
        var gamma = event.gamma;
        if(gamma < 110 && 70 < gamma){
          $scope.orientation = 'right';
          $scope.orientationGamma = event.gamma;
          $scope.$apply();
        }
        else if(gamma < -70 && -110 < gamma){
          $scope.orientation = 'left';
          $scope.orientationGamma = event.gamma;
          $scope.$apply();
        }
        else {
          $scope.orientation = 'portrait';
          $scope.orientationGamma = event.gamma;
          $scope.$apply();
        }
        // console.log($scope.orientation);
      });
      localforage.getItem('storedPhotos')
      .then(function(value){
        console.log(value);
        if(value === null || value === [null]){
          localforage.setItem('storedPhotos', [])
          .then(function(dataVal){
            // callback
          })
          .catch(function(err){
            console.log(err);
          })
        }
        else {
          var valLength = value.length;
          for (var i = 0; i < valLength; i++) {
            $scope.mediaCache.push(value[i]);
            console.log($scope.mediaCache);
            $scope.$apply();
          }
        }
      })
      .catch(function(err){
        console.log(err);
      });
    }

    function showCamera(callback){
      cordova.plugins.camerapreview.show();
      callback();
    }


    function handlePhotoCallback(result){
      cordova.plugins.camerapreview.show();
      $scope.mediaCache.push({type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date(), orientation: $scope.orientation});
      // console.log($scope.mediaCache);
      // $('.outlineFlash').css({
      //   borderWidth: '0px'
      // });
      // $scope.$apply();
      if($scope.flashOnOff === 'on'){
        window.plugins.flashlight.switchOn();
      }
      if($scope.cameraMode === "photo"){
        $timeout(function(){
          $scope.activePhoto = false;
        }, 200);
        var allPhotos = [];
        for (var i = 0; i < $scope.mediaCache.length; i++) {
          if($scope.mediaCache[i].type === 'photo'){
            allPhotos.push($scope.mediaCache[i])
          }
        }
        localforage.setItem('storedPhotos', allPhotos)
        .then(function(newPhotoArr){
          console.log(newPhotoArr);
        })
        .catch(function(err){
          console.log(err);
        })
      }
      else {
        $scope.activePhoto = false;
      }

      if($scope.intCounter%4 === 0){
        var allPhotos = [];
        for (var i = 0; i < $scope.mediaCache.length; i++) {
          if($scope.mediaCache[i].type === 'photo'){
            allPhotos.push($scope.mediaCache[i])
          }
        }
        localforage.setItem('storedPhotos', allPhotos)
        .then(function(newPhotoArr){

        })
        .catch(function(err){
          console.log(err);
        })
      }
    }

    $scope.takeCordovaPicture = function(){
      console.log($scope.orientation);
      console.log($scope.orientationGamma);
      console.log(typeof $scope.orientationGamma);
      if($scope.mediaCache.length < 20 && $scope.activePhoto === false){
        $scope.activePhoto = true;
        cordova.plugins.camerapreview.takePicture();
        cordova.plugins.camerapreview.hide();
      }
      else if($scope.mediaCache.length >= 20 && ($scope.cameraMode === 'photo')){
        navigator.notification.alert('Sorry, you can only send up to 20 photos or video at a time. Please erase a few to free up room to take more MoPhos. Thank you!')
      }
    }

    var photoInt = function(){
      $scope.intCounter = 0;
      // $scope.cameraHot = true;
      window.plugins.flashlight.switchOff();
      $('.cameraFlash').css({
        opacity: 1
      });
      var photoInterval = $interval(function(){
        if($scope.activePhoto === false){
          $scope.intCounter++
          //  if($scope.burstCounter > 0){
          $scope.takeCordovaPicture();
        }
      }, 300);

       function clearPhotoInt(){
         $scope.activePhoto = false;
        //  $scope.burstCounter = 0;
         $interval.cancel(photoInterval);
        //  $timeout(function(){
          //  $scope.cameraHot = false;
          var allPhotos = [];
          for (var i = 0; i < $scope.mediaCache.length; i++) {
            if($scope.mediaCache[i].type === 'photo'){
              allPhotos.push($scope.mediaCache[i])
            }
          }
          localforage.setItem('storedPhotos', allPhotos)
          .then(function(newPhotoArr){
            console.log(newPhotoArr);
          })
          .catch(function(err){
            console.log(err);
          })
        //  }, 1000);
       }
       $scope.clearPhotoInt = clearPhotoInt;
      }

    $scope.photoInt = photoInt;

    // function to flip the camera
    function flipCamera(){
      if($scope.cameraToggle){
        window.plugins.flashlight.switchOff();
        // CanvasCamera.setCameraPosition(2);
        cordova.plugins.camerapreview.switchCamera();
        $scope.cameraToggle = false;
      }
      else if(!$scope.cameraToggle) {
        cordova.plugins.camerapreview.switchCamera();
        $timeout(function(){
          if($scope.flashOnOff === 'on'){
            window.plugins.flashlight.switchOn();
          }
        }, 750);
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
          ////////////////
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

            var i = new Image();

            i.onload = function(){
            //  alert( i.width+", "+i.height );
              if(i.width > i.height){
                var vidOrientation = 'right'
              }
              else if(i.width < i.height){
                var vidOrientation = 'portrait'
              }
              $scope.mediaCache.push({
                type: "video"
                ,link: pathFull
                ,thumb: thumbnail
                ,date: new Date()
                ,orientation: vidOrientation
              });
              console.log($scope.mediaCache);
              $cordovaFileTransfer.upload('http://45.55.24.234:5555/api/temp/video', result[0].fullPath, {params: {userId: $scope.cachedUser._id, orientation: vidOrientation}}, true)
              .then(function(updatedUser){
                //callback
                console.log(updatedUser);
              })
            }
            i.src = thumbnail;

           })
           .catch( function(err){
             console.log('Thumbnail Error======================', err)
           })
          });
          var thisEl = $('.outCameraModal')[0];
          animateClick(thisEl, 'white', 'transparent');
      }
      else if($scope.mediaCache.length > 20){
        if(!$scope.alerted){
          $scope.alerted = true;
          $timeout(function(){
            $scope.alerted = false
          }, 1500);
          navigator.notification.alert('Sorry, you can only send up to 20 photos or video at a time. Please erase a few to free up room to take more MoPhos. Thank you!')
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
        navigator.notification.alert('You seem to have missed a field')
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
      // $ionicScrollDelegate.freezeScroll(true);
      $timeout(function(){
        $scope.submitPhotoModal = false;
        $scope.submitBar        = true;
      }, 251);
    }
    $scope.closeLoadingModal = closeLoadingModal;

    ////function to alert he user that they need to dd a photo to preocede
    function alertNeedPhoto(){
      alert("Please take a photo before sending us anything, thank you.");
    }
    $scope.alertNeedPhoto = alertNeedPhoto;

    function submitNameAndPhotos(){
      var submissionData;
      var set = $scope.mediaCache;
      console.log(set);
      var setLength = set.length;
      var zeroProgress = 0;
      var progressPercentage = 100/setLength;
      var submissionData = {photos: [], videos: [], userId: '', metaData: {}};
      var webToken = $localStorage.webToken;
      //////first we need to find the users ID, so we can use it to make the post requests
      var userFullId = $scope.cachedUser._id;
      navigator.geolocation.getCurrentPosition(function(position){
        submissionData.metaData.latitude = position.coords.latitude;
        submissionData.metaData.longitude = position.coords.longitude;
        submissionData.metaData.address = $scope.returnPlace;
      });
      submissionData.userId = userFullId;
      submissionData.metaData.date = $scope.returnDate();
      submissionData.metaData.who = $('.photoNameInput').val();
      submissionData.metaData.what = $('.photoNameDesc').val();
      ////now iterate through to submit to backend
      for (var i = 0; i < set.length; i++) {
        console.log('beginning');
        console.log(set[i]);
        if(set[i].type === "video"){
          $cordovaFileTransfer.upload('http://45.55.24.234:5555/api/upload/video', set[i].link, {})
          .then(function(callbackImage){
            console.log(callbackImage);
            var progressElement = $('.submitProgressBar');
            if(zeroProgress <= 100){
              zeroProgress += progressPercentage;
              progressElement.animate({
                width: zeroProgress+"%"
              }, 200);
            }
            var splitUrl = callbackImage.response.split('');
            var sliced = splitUrl.slice(1, callbackImage.response.split('').length - 1).join('');
            var thumbUrl = sliced.split('').slice(0, sliced.length-4).join('')+".jpg";
            console.log(thumbUrl);

            var i = new Image();
            i.onload = function(){
              if(i.width > i.height){
                console.log('landscape');
                var elOrient = 'right';
              }
              else if((i.width < i.height)){
                console.log('portrait');
                var elOrient = 'portrait';
              }
              $http({
                method: "POST"
                ,url: "http://45.55.24.234:5555/api/createphotos"
                ,data: {url: sliced, userId: userFullId, isVid: true, orientation: elOrient}
              })
              .then(function(newVid){
                submissionData.videos.push(newVid.data._id);
                var vids = submissionData.videos.length;
                var phots = submissionData.photos.length;
                var amalgam = vids + phots;
                if((parseInt(amalgam) == parseInt(set.length) || parseInt(set.length) === 0) && $scope.submitBar === true){
                  $http({
                    method: "POST"
                    ,url: "http://45.55.24.234:5555/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                    $timeout(function(){
                      localforage.setItem('storedPhotos', [])
                      .then(function(success){
                        $scope.cachedUser.tempVideoCache = [];
                        userInfo.userInfoFunc('blah', false, $scope.cachedUser);
                        userInfo.userInfoFunc($localStorage.webToken, true);
                        // $state.reload(true);
                        $scope.postSubmit = true;
                        $timeout(function(){
                          $(".cameraPostBlack").animate({
                            opacity: 1
                          }, 400);
                        }, 250);
                        $timeout(function(){
                          $scope.submitModalVar = false;
                          $scope.cameraModal = false;
                        }, 650);
                      })
                      .catch(function(err){
                        console.log(err);
                      })
                      $scope.cnt = 0;
                    }, 100);
                  })
                }
                else if((parseInt(amalgam) == parseInt(set.length) || parseInt(set.length) === 0) && $scope.submitBar === false){
                  $scope.isDisabled = false;
                }
              })
            }
            i.src = thumbUrl
          })
        }
        else if(set[i].type === "videoTemp"){
          var progressElement = $('.submitProgressBar');
          if(zeroProgress <= 100){
            zeroProgress += progressPercentage;
            progressElement.animate({
              width: zeroProgress+"%"
            }, 200);
          }
          console.log(set[i]);
          $http({
            method: "POST"
            ,url: "http://45.55.24.234:5555/api/createphotos"
            ,data: {url: set[i].link, userId: userFullId, isVid: true, orientation: elOrientation}////////PROBLEM   Ned to get that userOd above, it's shooting nulls
          })
          .then(function(newVid){
            submissionData.videos.push(newVid.data._id);
            var vids = submissionData.videos.length;
            var phots = submissionData.photos.length;
            var amalgam = vids + phots;
            if((parseInt(amalgam) == parseInt(set.length) || parseInt(set.length) === 0) && $scope.submitBar === true){
              $http({
                method: "POST"
                ,url: "http://45.55.24.234:5555/api/new/submission"
                ,data: submissionData
              })
              .then(function(newSubmission){
                setTimeout(function(){
                  localforage.setItem('storedPhotos', [])
                  .then(function(success){
                    $scope.cachedUser.tempVideoCache = [];
                    userInfo.userInfoFunc('blah', false, $scope.cachedUser);
                    userInfo.userInfoFunc($localStorage.webToken, true);
                    // $state.reload(true);
                    $scope.postSubmit = true;
                    $timeout(function(){
                      $(".cameraPostBlack").animate({
                        opacity: 1
                      }, 400);
                    }, 250);
                    $timeout(function(){
                      $scope.submitModalVar = false;
                      $scope.cameraModal = false;
                    }, 650);
                  })
                  .catch(function(err){
                    console.log(err);
                  })
                  $scope.cnt = 0;
                }, 100);
              })
            }
            else if((parseInt(amalgam) == parseInt(set.length) || parseInt(set.length) === 0) && $scope.submitBar === false){
              $scope.isDisabled = false;
            }
          })
        }
        else if(set[i].type === "photo"){
          function photoIife(currentP){
            var currentPhoto = currentP;
            // var photoOptions = {
            //     quality : 95,
            //     destinationType : Camera.DestinationType.FILE_URI,
            //     sourceType : Camera.PictureSourceType.Camera ,
            //     allowEdit : true,
            //     encodingType: Camera.EncodingType.JPEG,
            //     popoverOptions: CameraPopoverOptions,
            //     saveToPhotoAlbum: false
            // };
            $cordovaFileTransfer.upload('http://45.55.24.234:5555/api/newimage', currentPhoto.link, {params: {orientation: currentPhoto.orientation}})
            .then(function(callbackImage){
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
                ,url: "http://45.55.24.234:5555/api/createphotos"
                ,data: {url: parsedPhoto.secure_url, thumbnail: parsedPhoto.thumbnail, userId: userFullId, isVid: false, orientation: currentPhoto.orientation}
              })
              .then(function(newPhoto){
                submissionData.photos.push(newPhoto.data._id);
                var vids = submissionData.videos.length;
                var phots = submissionData.photos.length;
                var amalgam = vids + phots;
                if((parseInt(amalgam) == parseInt(set.length) || parseInt(set.length) === 0) && $scope.submitBar === true){
                  $http({
                    method: "POST"
                    ,url: "http://45.55.24.234:5555/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                    setTimeout(function(){
                      localforage.setItem('storedPhotos', [])
                      .then(function(success){
                        $scope.cachedUser.tempVideoCache = [];
                        userInfo.userInfoFunc('blah', false, $scope.cachedUser);
                        userInfo.userInfoFunc($localStorage.webToken, true);
                        // $state.reload(true);
                        $scope.postSubmit = true;
                        $timeout(function(){
                          $(".cameraPostBlack").animate({
                            opacity: 1
                          }, 400);
                        }, 250);
                        $timeout(function(){
                          $scope.submitModalVar = false;
                          $scope.cameraModal = false;
                        }, 650);
                      })
                      .catch(function(err){
                        console.log(err);
                      })
                      $scope.cnt = 0;

                    }, 100);
                  })
                }
                else if((parseInt(amalgam) == parseInt(set.length) || parseInt(set.length) === 0) && $scope.submitBar === false){
                  $scope.isDisabled = false;
                }
              })
            })
          }
          photoIife(set[i]);
        }
      }
    }

    function emergencyCancelSubmit(){
      $scope.submitBar = false;
      $scope.isDisabled = true;
    }
    $scope.emergencyCancelSubmit = emergencyCancelSubmit;

    function leavePostSubmit(){
      $scope.submitModalVar = false;
      $scope.submitBar = false;
      $scope.postSubmit = false;
      $scope.cameraModal = true;
      localforage.setItem('storedPhotos', []);
      userInfo.clearCache();
      $scope.mediaCache = [];
      goLaunch();
    }
    $scope.leavePostSubmit = leavePostSubmit;

    function leavePostAccount(){
      localforage.setItem('storedPhotos', []);
      userInfo.clearCache();
      $state.go('tab.account');
    }
    $scope.leavePostAccount = leavePostAccount;

    ////old related to crop funciotn
    // function backToSubmit(){
    //   $ionicScrollDelegate.freezeScroll(false);
    //   $('.submitCropContainer').animate({
    //     marginLeft: 100+"%"
    //   }, 700);
    //   setTimeout(function(){
    //     $('#image').remove();
    //     $('.cropper-container').remove();
    //   });
    // }
    // $scope.backToSubmit = backToSubmit;

    function setCellSize(){
      var cacheLength = $scope.mediaCache.length;
      $scope.zooming = findZoomed();
      if($scope.zooming === 'zoomed'){
        if(cacheLength <= 4){
          $timeout(function(){
            $('.submitCell').width('157.5px');
            $('.submitCell').height('157.5px');
            $('.submitCell').animate({
              opacity: 1
            }, 200);
          }, 125);
        }
        else if(cacheLength < 9){
          $timeout(function(){
            $('.submitCell').width('105px');
            $('.submitCell').height('105px');
            $('.submitCell').animate({
              opacity: 1
            }, 200);
          }, 1100);
        }
      }
      else if ($scope.zooming === 'standard'){
        if(cacheLength <= 4){
          $timeout(function(){
            $('.submitCell').width('185px');
            $('.submitCell').height('185px');
            $('.submitCell').animate({
              opacity: 1
            }, 200);
          }, 125);
        }
        else if(cacheLength < 9){
          $timeout(function(){
            $('.submitCell').width('123.33px');
            $('.submitCell').height('123.33px');
            $('.submitCell').animate({
              opacity: 1
            }, 200);
          }, 1100);
        }
      }
    }

    function submitModalOpen(){
      // $ionicScrollDelegate.$getByHandle('carouselScroll').freezeScroll(false);
      if($scope.flashOnOff === 'on'){
        window.plugins.flashlight.switchOff();
        $('.cameraFlash').css({
          opacity: 1
        });
      }
      console.log($scope.mediaCache);
      if($scope.activePhoto === false){
        cordova.plugins.camerapreview.hide();
        $scope.submitModalVar = true;
        /////////the following set teh submit page up to prevent app crashes
        var mediaCachePart = $scope.mediaCache.slice(0, 4);
        $scope.mediaCacheTemp = mediaCachePart;
        if($scope.mediaCache.length <= 8){
          setCellSize();
        }
        else {
          $timeout(function(){
            $('.submitCell').css({
              opacity: 1
            });
          }, 250);
        }

        $timeout(function(){
          var mediaCachePart = $scope.mediaCache.slice(0, 8);
          $scope.mediaCacheTemp = mediaCachePart;
          if($scope.mediaCache.length <= 8){
            setCellSize();
          }
          else {
            $timeout(function(){
              $('.submitCell').css({
                opacity: 1
              });
            }, 250);
          }
        }, 500);
        $timeout(function(){
          var mediaCachePart = $scope.mediaCache.slice(0, 12);
          $scope.mediaCacheTemp = mediaCachePart;
          $timeout(function(){
            $('.submitCell').css({
              opacity: 1
            });
          }, 250);
        }, 1000);
        $timeout(function(){
          var mediaCachePart = $scope.mediaCache.slice(0, 16);
          $scope.mediaCacheTemp = mediaCachePart;
          $timeout(function(){
            $('.submitCell').css({
              opacity: 1
            });
          }, 250);
        }, 1500);
        //////note: we're leaving this on ebelow in case we wan tto toggle back to 25 photos
        $timeout(function(){
          var mediaCachePart = $scope.mediaCache.slice(0, 20);
          $scope.mediaCacheTemp = mediaCachePart;
          $timeout(function(){
            $('.submitCell').css({
              opacity: 1
            });
          }, 250);
        }, 2000);
      }
    }

    $scope.submitModalOpen = submitModalOpen;

    function backToPhotos(){
      // $ionicScrollDelegate.freezeScroll(true);
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
      if($scope.flashOnOff === 'on'){
        window.plugins.flashlight.switchOff();
        $('.cameraFlash').css({
          opacity: 1
        });
      }
      $('.cameraToAccount').css({
        opacity: 0.3
      });
      setTimeout(function(){
        cordova.plugins.camerapreview.hide();
        $state.go('tab.account');
      }, 50);
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
      return moment().format('MMMM Do YYYY, h:mm a');
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
        var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius=100&rankBy=distance&key=AIzaSyDspcymxHqhUaiLh2YcwV67ZNhlGd4FyxQ'
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
      //////thsi is normal carousel functionality
      if($scope.selectMode === false){
        // $ionicScrollDelegate.freezeScroll(true);
        $scope.photoCarouselObject = mediaData;////this is always the centerpiece photo
        $scope.$apply();
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
          if($scope.zooming   === 'zoomed'){
            var sLeft = (index*70);
          }
          else if($scope.zooming   === 'standard'){
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
      // $ionicScrollDelegate.freezeScroll(false);
      $scope.submitModaVar = true;
      setCellSize();
      $timeout(function(){
        $scope.photoCarouselBool = false;
      }, 200);
    }
    $scope.photoCarouselBack = photoCarouselBack;

    function openNewCarouselPhoto(mediaData, index, direction){
      $scope.photoCarouselObject = mediaData;
      var mediaLength = $('.photoCarouselCell').length;
      if($scope.zooming   === 'zoomed'){
        var dist = (index*70);
      }
      else if($scope.zooming   === 'standard'){
        var dist = (index*70);
      }
      $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(dist, 0, true);
    }
    $scope.openNewCarouselPhoto = openNewCarouselPhoto;

    function clickCarouselPhoto(mediaData, index){
      $scope.photoCarouselObject = mediaData;
      console.log(mediaData);
      var mediaLength = $('.photoCarouselCell').length;
      if($scope.zooming  === 'zoomed'){
        var dist = (index*70);
      }
      else if($scope.zooming  === 'standard'){
        var dist = (index*70);
      }
      $timeout(function(){
        $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(dist, 0, true);
      }, 150);
    }
    $scope.clickCarouselPhoto = clickCarouselPhoto;

    function changeCarouselPhoto(newMedia){
      $scope.photoCarouselObject = newMedia;
      $scope.$apply();
    }
    $scope.changeCarouselPhoto = changeCarouselPhoto;

    function carouselScroll(){
      console.log('scrolling');
      /////need to math this up tp dry it out
      var scrollPos = $ionicScrollDelegate.$getByHandle('carouselScroll').getScrollPosition().left;
      console.log(scrollPos);
      var multiple = 70;//note this will change on zoom mode
      var newMediaIndex = Math.floor((scrollPos+35)/70);
      console.log(newMediaIndex);
      changeCarouselPhoto($scope.mediaCache[newMediaIndex]);
    }
    $scope.carouselScroll = carouselScroll;

    //////carousel swipe functions
    function photoCarouselSwipeLeft(){
      var currentScrollLeft = $ionicScrollDelegate.$getByHandle('carouselScroll').getScrollPosition().left;
      var normalizedLeftIndex = Math.floor((currentScrollLeft+35)/70);
      ////now we scroll
      $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo((normalizedLeftIndex+1)*70, 0, true);
    }
    $scope.photoCarouselSwipeLeft = photoCarouselSwipeLeft;

    function photoCarouselSwipeRight(){
      var currentScrollLeft = $ionicScrollDelegate.$getByHandle('carouselScroll').getScrollPosition().left;
      var normalizedLeftIndex = Math.floor((currentScrollLeft+35)/70);
      ////now we scroll
      $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo((normalizedLeftIndex-1)*70, 0, true);
    }
    $scope.photoCarouselSwipeRight = photoCarouselSwipeRight;

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
          "<div class='photoCheckHolder'>"+
            "<p class='fa fa-check-circle photoCheck'></p>"+
          "</div>"
        );
        $(evt.currentTarget).css({
          opacity: 0.6
        });
      }
      else if($(evt.currentTarget).hasClass('selectedP')){
        $(evt.currentTarget).removeClass('selectedP');
        $(evt.currentTarget).css({
          opacity: 1
        });
        var parent = $(evt.currentTarget).parent();
        parent.find('.photoCheckHolder').remove();
        parent.find('.photoCheck').remove();
      }
    }

    function selectPhotos(){
      if($scope.selectMode === false){
        $('.submitCellImageHolder').css({
          border: '1px solid white'
        });
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
        $('.submitCellImageHolder').css({
          border: '0px solid black'
        });
        $(".submitAddInfoContainer").animate({
          marginTop: '10px'
          ,opacity: 1
        });
        $('.finalizeMophos').text('Finalize Mophos');
        $('.selectPhotos').text('Select');
        $scope.selectMode = false;
        /////logic for it to all set back
        var allPhotos = $('.submitCellImageHolder');
        var allLength = allPhotos.length;
        for (var i = 0; i < allLength; i++) {
          var child = $(allPhotos[i]).find('img');
          if(child.hasClass('selectedP')){
            child.removeClass('selectedP');
            $(allPhotos[i]).find('.photoCheck').remove();
            $(child).css({
              opacity: 1
            })
          }
        }
      }
    }
    $scope.selectPhotos = selectPhotos;

    function batchErase(){
      var selectedLength = $(".selectedP").length;
      if(selectedLength > 0){
        var confirmErase = navigator.notification.confirm('Erase all selected photos?', function(index){
          if(index === 1){
            //callback
          }
          else if(index === 2){
            performErase();
          }
        }, 'Erase All?', ['Cancel', 'Yes'])
        function performErase(){
          localforage.getItem('storedPhotos')
          .then(function(storedArr){
            var stored = storedArr;
            var arrObj =  $.makeArray(document.getElementsByClassName('submitCellImageHolder'));
            var eraseCount = 0;
            $timeout(function(){
              var allPhotos = $('.submitCellImageHolder');
              var allLength = allPhotos.length;
              for (var i = 0; i < allLength; i++) {
                console.log("i: " + i);
                console.log($scope.mediaCache[i]);
                var child = $(allPhotos[i]).find('img');
                $(child).css({
                  opacity: 1
                });
                if(child.hasClass('selectedP')){
                  $(allPhotos[i]).find('.photoCheckHolder').remove();
                  ////////////need to check vor tempVideo, so we can send an http call to remove this from the uses temp storage
                  var currentMedia = $scope.mediaCache[i-eraseCount];
                  console.log('current Media');
                  console.log(currentMedia);
                  if(currentMedia.type === 'videoTemp'){
                    $http({
                      method: "POST"
                      ,url: 'http://45.55.24.234:5555/api/delete/temp/video'
                      ,data: {userId: $scope.cachedUser._id, videoId: currentMedia.videoId}
                    })
                    .then(function(results){

                    })
                  }


                  $scope.mediaCache.splice((i-eraseCount), 1);
                  $scope.mediaCacheTemp.splice((i-eraseCount), 1);
                  child.removeClass('selectedP');
                  $scope.$apply();
                  eraseCount++;
                }
                if(i === allLength-1){
                  selectPhotos();
                  var allPhotos = [];
                  for (var k = 0; k < $scope.mediaCache.length; k++) {
                    if($scope.mediaCache[i].type === 'photo'){
                      allPhotos.push($scope.mediaCache[k])
                    }
                  }
                  localforage.setItem('storedPhotos', allPhotos)
                  .then(function(newPhotoArr){
                    if($scope.mediaCache.length === 0){
                      $timeout(function(){
                        backToPhotos();
                      })
                    }
                  })
                  .catch(function(err){
                    console.log(err);
                  })
                }
              }
            }, 50);
          });
        }
      }
      else {
        navigator.notification.alert('Please select some photos to erase, thank you.')
      }
    }
    $scope.batchErase = batchErase;

    function eraseSinglePhoto(){
      var confirmErase = navigator.notification.confirm('Erase this photo?', function(index){
        if(index === 1){
          //callback
        }
        else if(index === 2){
          eraseSingleCallback();
        }
      }, 'Erase?', ['Cancel', 'Yes'])
      function eraseSingleCallback(){
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
            var allPhotos = [];
            for (var k = 0; k < $scope.mediaCache.length; k++) {
              if($scope.mediaCache[k].type === 'photo'){
                allPhotos.push($scope.mediaCache[k])
              }
            }
            localforage.setItem('storedPhotos', allPhotos)
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
      if($scope.selectMode === true){
        selectPhotos();
      }
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

    ////plays a video on the carousel counter
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

    /////function to switch flash on and off
    function toggleFlash(){
      if($scope.flashOnOff === 'off' && $scope.cameraToggle === true){
        window.plugins.flashlight.switchOn();
        $scope.flashOnOff = 'on';
        $scope.flash = 'Flash off';
        $('.cameraFlash').css({
          opacity: 0.3
          ,color: 'black'
          ,backgroundColor: 'white'
        });
      }
      else if($scope.flashOnOff === 'on') {
        window.plugins.flashlight.switchOff();
        $scope.flashOnOff = 'off';
        $scope.flash = 'Flash on';
        $('.cameraFlash').css({
          opacity: 1
          ,color: 'white'
          ,backgroundColor: 'black'
        });
      }
    }
    $scope.toggleFlash = toggleFlash;

  }
