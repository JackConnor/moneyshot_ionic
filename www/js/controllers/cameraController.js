var testCnt = 0
angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload', 'persistentPhotosFactory', 'userInfoFactory', 'cameraFactory'])

  .controller('cameraCtrl', cameraCtrl)

  .run(function($ionicPlatform, $state){
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
      console.log(userToken);
      // navigator.geolocation.getCurrentPosition(function(pos, err){
      //   // console.log(pos);
      // });
      var hasLaunched = window.location.hasLaunched;
      if(hasLaunched === false){
        var httpLoaded = false;
        if(userToken === null || userToken === "null" || userToken === 'undefined' || userToken === undefined){
          userToken = 'null'
        }
        setTimeout(function(){
          console.log(httpLoaded);
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
      $localStorage.webToken =  null;
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
      $state.go('signin');
    }
    $scope.tempSignout = tempSignout;

    function setLaunchCamera(){
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
    function launchPlatform(){
      var isReady = ionic.Platform.isReady;
      // alert(isReady);
      if(isReady){
        initCheckUser();
      }
      else {
        $timeout(function(){
          launchPlatform();
        }, 1000);
      }
    }
    // launchPlatform();
    ionic.Platform.ready(function(){      // alert('checking')
      var userLoaded = userInfo.cacheOnly();
      console.log(userLoaded);
      if(userLoaded !== undefined || userLoaded !== 'undefined'){
        $scope.cachedUser = userLoaded;
      }
      else {
        setTimeout(function(){
          var newUser = userInfo.userInfoFunc();
          console.log(newUser);
        }, 1000);
      }
      setTimeout(function(){
        initCheckUser();
      }, 100);
    })

    /////function to get cached videos and photos
    function initCache(){
      var userToken = $localStorage.webToken;
      //////need to toggle if info already loaded
      var cacheOnly = userInfo.cacheOnly();
      console.log(cacheOnly);
      if(cacheOnly === undefined || cacheOnly === 'undefined'){
        userInfo.promiseOnly(userToken)
        .then(function(data){
          $scope.cachedUser = data.data;
          var cachedUser = userInfo.userInfoFunc(userToken, false, data.data);
          $scope.zooming              = findZoomed()////this determines if the screen is on zoom mode or not
          if($scope.cachedUser.tempPhotoCache.length > 0){
            runPhotoSignoutCache();
          }
          else {
            setLocalForage();
          }
          runVideoCache($scope.cachedUser.tempPhotoCache);
          // initCamera();
        });
      }
      else {
        $scope.cachedUser = cacheOnly;
        console.log($scope.cachedUser);
        runVideoCache($scope.cachedUser.tempVideoCache);
        if($scope.cachedUser.tempVideoCache.length > 0){
          runPhotoSignoutCache();
        }
        else {
          setLocalForage();
        }
      }
    }

    ///does all the video stuff
    function runVideoCache(tempVideoArray){
      var vidLength = tempVideoArray.length;
      for (var i = 0; i < vidLength; i++) {
        var thumbnailArr = tempVideoArray[i].url.split('mov');
        var thumbnail = thumbnailArr[0]+"jpg";
        $scope.mediaCache.push({type: 'videoTemp', link: tempVideoArray[i].url, thumb: thumbnail, videoId: tempVideoArray[i]._id});
        console.log($scope.mediaCache);
      }
    }

    function runPhotoSignoutCache(){
      var cacheLength = $scope.cachedUser.tempPhotoCache.length;
      for (var i = 0; i < cacheLength; i++) {
        $scope.mediaCache.push($scope.cachedUser.tempPhotoCache[i]);
        console.log($scope.mediaCache);
        localforage.setItem('storedPhotos', $scope.mediaCache)
        .then(function(locPhot){
          console.log(locPhot);
        })
        if(i === cacheLength -1){
          $http({
            method: 'GET'
            ,url: 'http://192.168.0.7:5555/api/erase/temp/photos/'+$scope.cachedUser._id
          })
          .then(function(upUser){
            console.log(upUser);
          })
        }
      }
    }



    //////function to set up our tempprary photo storage between sessions
    function setLocalForage(){
      $timeout(function(){
        console.log($scope.mediaCache);
      }, 15000)
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
        console.log(value);
        $localStorage.webToken = $scope.newToken;//////taking care of this;
        if(value === null || value === [null]){
          localforage.setItem('storedPhotos', [])
          .then(function(dataVal){
            // setLaunchCamera();
          })
          .catch(function(err){
            console.log(err);
          })
        }
        else {
          var valLength = value.length;
          for (var i = 0; i < valLength; i++) {
            $scope.mediaCache.push(value[i]);
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
      $scope.mediaCache.push({type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date()});
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
        localforage.setItem('storedPhotos', $scope.mediaCache)
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
        localforage.setItem('storedPhotos', $scope.mediaCache)
        .then(function(newPhotoArr){

        })
        .catch(function(err){
          console.log(err);
        })
      }
    }

    $scope.takeCordovaPicture = function(){
      if($scope.mediaCache.length < 20 && $scope.activePhoto === false){
        $scope.activePhoto = true;
        cordova.plugins.camerapreview.takePicture();
        cordova.plugins.camerapreview.hide();
      }
      else if($scope.mediaCache.length >= 20 && ($scope.cameraMode === 'photo')){
        navigator.notification.alert('Sorry, you can only send up to 20 photos or video at a time. Please erase a few to free up room to take more MoPhos. Thank you!')
      }
    }
    console.log(10)

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
         $scope.activePhoto = true;
        //  $scope.burstCounter = 0;
         $interval.cancel(photoInterval);
        //  $timeout(function(){
          //  $scope.cameraHot = false;
           localforage.setItem('storedPhotos', $scope.mediaCache)
           .then(function(newPhotoArr){
             $scope.activePhoto = false;
             ///////////prevents from opening submit modal while the camera is still processing, to prevent crashes
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
            ,url: "http://45.55.24.234:5555/api/decodetoken/"+$localStorage.webToken
          })
          .then(function(decodedToken){
            console.log(decodedToken);
            $cordovaFileTransfer.upload('http://45.55.24.234:5555/api/temp/video', result[0].fullPath, {params: {userId: decodedToken.data.userId}}, true)
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
      var submissionData = {photos: [], videos: [], userId: '', metaData: {}};
      var webToken = $localStorage.webToken;
      //////first we need to find the users ID, so we can use it to make the post requests
      $http({
        method: "GET"
        ,url: "http://45.55.24.234:5555/api/decodetoken/"+ webToken
      })
      .then(function(decodedToken){
        var userFullId = decodedToken.data.userId;
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
          var hardI = 'hard'+i
          if(set[i].type === "video"){
            $cordovaFileTransfer.upload('http://45.55.24.234:5555/api/upload/video', set[i].link, {})
            .then(function(callbackImage){
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
                ,url: "http://45.55.24.234:5555/api/createphotos"
                ,data: {url: sliced, userId: userFullId, isVid: true}
              })
              .then(function(newVid){
                submissionData.videos.push(newVid.data._id);
                var vids = submissionData.videos.length;
                var phots = submissionData.photos.length;
                var amalgam = vids + phots;
                if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === true){
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
            var progressElement = $('.submitProgressBar');
            if(zeroProgress <= 100){
              zeroProgress += progressPercentage;
              progressElement.animate({
                width: zeroProgress+"%"
              }, 200);
            }
            $http({
              method: "POST"
              ,url: "http://45.55.24.234:5555/api/createphotos"
              ,data: {url: set[i].link, userId: userFullId, isVid: true}////////PROBLEM   Ned to get that userOd above, it's shooting nulls
            })
            .then(function(newVid){
              submissionData.videos.push(newVid.data._id);
              var vids = submissionData.videos.length;
              var phots = submissionData.photos.length;
              var amalgam = vids + phots;
              if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === true){
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
              else if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === false){
                $scope.isDisabled = false;
              }
            })
          }
          else if(set[i].type === "photo"){
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
              $cordovaFileTransfer.upload('http://45.55.24.234:5555/api/newimage', currentPhoto.link, photoOptions)
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
                  ,data: {url: parsedPhoto.secure_url, thumbnail: parsedPhoto.thumbnail, userId: userFullId, isVid: false}
                })
                .then(function(newPhoto){
                  submissionData.photos.push(newPhoto.data._id);
                  var vids = submissionData.videos.length;
                  var phots = submissionData.photos.length;
                  var amalgam = vids + phots;
                  if((parseInt(amalgam) == parseInt(set.length-1) || parseInt(set.length-1) === 0) && $scope.submitBar === true){
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

    function backToSubmit(){
      $ionicScrollDelegate.freezeScroll(false);
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
      var cacheLength = $scope.mediaCache.length;
      if(cacheLength <= 4){
        $timeout(function(){
          $('.submitCell').width('185px');
          $('.submitCell').height('185px');
        }, 750);
      }
      else if(cacheLength <= 9){
        $timeout(function(){
          $('.submitCell').width('123.33px');
          $('.submitCell').height('123.33px');
        }, 1500);
      }
      // else if(cacheLength <= 16){
      //   $timeout(function(){
      //     $('.submitCell').width('92.5px');
      //     $('.submitCell').height('92.5px');
      //   }, 3000);
      // }
    }

    function submitModalOpen(){
      if($scope.flashOnOff === 'on'){
        window.plugins.flashlight.switchOff();
        $('.cameraFlash').css({
          opacity: 1
        });
      }
      if($scope.activePhoto === false){
        cordova.plugins.camerapreview.hide();
        $scope.submitModalVar = true;
        setCellSize();
        /////////the following set teh submit page up to prevent app crashes
        var mediaCachePart = $scope.mediaCache.slice(0, 4);
        $scope.mediaCacheTemp = mediaCachePart;

        $timeout(function(){
          var mediaCachePart = $scope.mediaCache.slice(0, 8);
          $scope.mediaCacheTemp = mediaCachePart;
        }, 500);
        $timeout(function(){
          var mediaCachePart = $scope.mediaCache.slice(0, 12);
          $scope.mediaCacheTemp = mediaCachePart;
        }, 1000);
        $timeout(function(){
          var mediaCachePart = $scope.mediaCache.slice(0, 16);
          $scope.mediaCacheTemp = mediaCachePart;
        }, 1500);
        //////note: we're leaving this on ebelow in case we wan tto toggle back to 25 photos
        $timeout(function(){
          var mediaCachePart = $scope.mediaCache.slice(0, 20);
          $scope.mediaCacheTemp = mediaCachePart;
        }, 2000);
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
          console.log(posData);
          $scope.returnPlace = posData.data.results[0].vicinity;
        })

      });
    }
    $scope.findNewPlace = returnPlace;

    ///////begin photo carousel animation work
    function goToCarousel(mediaData, index, evt){
      $ionicScrollDelegate.freezeScroll(true);
      //////thsi is normal carousel functionality
      console.log('yoooooooo carrrrrr');
      if($scope.selectMode === false){
        $scope.photoCarouselObject = mediaData;////this is always the centerpiece photo
        $(evt.currentTarget).css({
          opacity: 0.1
        });
        $(evt.currentTarget).animate({
          opacity: 1
        }, 169);
        $timeout(function(){
          console.log('opening carousel');
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
      console.log(dist);
      $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(dist, 0, true);
    }
    $scope.openNewCarouselPhoto = openNewCarouselPhoto;

    function clickCarouselPhoto(mediaData, index){
      $scope.photoCarouselObject = mediaData;
      var mediaLength = $('.photoCarouselCell').length;
      if($scope.zooming  === 'zoomed'){
        var dist = (index*70);
      }
      else if($scope.zooming  === 'standard'){
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
      /////need to math this up tp dry it out
      var scrollPos = $ionicScrollDelegate.$getByHandle('carouselScroll').getScrollPosition().left;
      console.log(scrollPos)

      if(scrollPos >= 0 && scrollPos < 36){
        var newMedia = $scope.mediaCache[0];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 36 && scrollPos < 105){
        var newMedia = $scope.mediaCache[1];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 106 && scrollPos < 175){
        var newMedia = $scope.mediaCache[2];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 176 && scrollPos < 245){
        var newMedia = $scope.mediaCache[3];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 246 && scrollPos < 315){
        var newMedia = $scope.mediaCache[4];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 316 && scrollPos < 385){
        var newMedia = $scope.mediaCache[5];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 386 && scrollPos < 455){
        var newMedia = $scope.mediaCache[6];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 456 && scrollPos < 525){
        var newMedia = $scope.mediaCache[7];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 526 && scrollPos < 595){
        var newMedia = $scope.mediaCache[8];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 596 && scrollPos < 665){
        var newMedia = $scope.mediaCache[9];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 666 && scrollPos < 735){
        var newMedia = $scope.mediaCache[10];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 736 && scrollPos < 805){
        var newMedia = $scope.mediaCache[11];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 806 && scrollPos < 875){
        var newMedia = $scope.mediaCache[12];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 876 && scrollPos < 945){
        var newMedia = $scope.mediaCache[13];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 946 && scrollPos < 1015){
        var newMedia = $scope.mediaCache[14];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1016 && scrollPos < 1085){
        var newMedia = $scope.mediaCache[15];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1086 && scrollPos < 1155){
        var newMedia = $scope.mediaCache[16];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1156 && scrollPos < 1225){
        var newMedia = $scope.mediaCache[17];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1226 && scrollPos < 1295){
        var newMedia = $scope.mediaCache[18];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1296 && scrollPos < 1365){
        var newMedia = $scope.mediaCache[19];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1366 && scrollPos < 1435){
        var newMedia = $scope.mediaCache[20];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1436 && scrollPos < 1505){
        var newMedia = $scope.mediaCache[21];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1506 && scrollPos < 1575){
        var newMedia = $scope.mediaCache[22];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1576 && scrollPos < 1635){
        var newMedia = $scope.mediaCache[23];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
      else if(scrollPos >= 1636 && scrollPos < 1705){
        var newMedia = $scope.mediaCache[24];
        console.log(newMedia);
        changeCarouselPhoto(newMedia);
      }
    }
    $scope.carouselScroll = carouselScroll;

    //////carousel swipe functions
    function photoCarouselSwipeLeft(){
      console.log('swiping leftttttt');
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
          "<div class='photoCheckHolder'>"+
            "<p class='fa fa-check-circle photoCheck'></p>"+
          "</div>"
        );
      }
      else if($(evt.currentTarget).hasClass('selectedP')){
        $(evt.currentTarget).removeClass('selectedP');
        var parent = $(evt.currentTarget).parent();
        parent.find('.photoCheckHolder').remove();
        parent.find('.photoCheck').remove();
      }
    }

    function selectPhotos(){
      if($scope.selectMode === false){
        $('.submitCellImageHolder').css({
          border: '1px solid black'
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
        /////logic for it to all set back
        var allPhotos = $('.submitCellImageHolder');
        var allLength = allPhotos.length;
        for (var i = 0; i < allLength; i++) {
          var child = $(allPhotos[i]).find('img');
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
                $(allPhotos[i]).find('.photoCheckHolder').remove();

                $scope.mediaCache.splice((i-eraseCount), 1);
                $scope.mediaCacheTemp.splice((i-eraseCount), 1);
                child.removeClass('selectedP');
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
      if($scope.flashOnOff === 'off'){
        window.plugins.flashlight.switchOn();
        $scope.flashOnOff = 'on';
        $scope.flash = 'Flash off';
        $('.cameraFlash').css({
          opacity: 0.5
        });
      }
      else if($scope.flashOnOff === 'on') {
        window.plugins.flashlight.switchOff();
        $scope.flashOnOff = 'off';
        $scope.flash = 'Flash on';
        $('.cameraFlash').css({
          opacity: 1
        });
      }
    }
    $scope.toggleFlash = toggleFlash;

  }
