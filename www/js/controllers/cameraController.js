var testCnt = 0
angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload', 'persistentPhotosFactory'])

  .controller('cameraCtrl', cameraCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  });

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', '$cordovaStatusbar', '$timeout', '$ionicGesture', '$ionicScrollDelegate', '$interval', 'persistentPhotos'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture, $cordovaStatusbar, $timeout, $ionicGesture, $ionicScrollDelegate, $interval, persistentPhotos){

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
    var zooming = findZoomed();



    /////end global variables///
    ////////////////////////////

    //////functino to load camera and set up screen
    function removeTabsAndBar(){
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        ionic.Platform.ready(function(){
          $('ion-tabs').addClass('tabs-item-hide');
          uploadPhotos();
          $timeout(function(){
            ionic.Platform.showStatusBar(false);
            // $ionicScrollDelegate.scrollTop(true);
            $ionicScrollDelegate.freezeScroll(true);
          }, 500);
        });
      }
      else {
        $ionicScrollDelegate.scrollTop(true);
        $ionicScrollDelegate.freezeScroll(true);
        $('ion-tabs').addClass('tabs-item-hide');
        $timeout(function(){
          // $ionicScrollDelegate.scrollTop(true);
          $ionicScrollDelegate.freezeScroll(true);
        }, 500);
      }
    }
    removeTabsAndBar();

    //////function to set up our tempprary photo storage between sessions
    function setLocalForage(){
      localforage.getItem('storedPhotos')
      .then(function(value){
        console.log(value);
        if(value === null || value === [null]){
          localforage.setItem('storedPhotos', [])
          .then(function(dataVal){
            console.log('creating array');
            console.log(dataVal);
          })
          .catch(function(err){
            console.log(err);
          })
        }
        else {
          console.log('value is: '+value);
        }
      })
      .catch(function(err){
        console.log(err);
      });
    }

    /////////////////////////////
    //function to launch camera and take photos
    function uploadPhotos(){
      var screenWidth = window.innerWidth;
      setLocalForage();
      // var persistentLength = persistentPhotos().length;
      // if(persistentLength === 0){
      localforage.getItem('storedPhotos')
      .then(function(photoArr){
        console.log(photoArr);
        $scope.mediaCache = photoArr;
        console.log($scope.mediaCache);
        // $scope.photoListLength = photoArr.length;
      })
      // for (var i = 0; i < 25; i++) {
      //   var name = 'mopho'+i;
      //   localforage.getItem(name, function (err, value) {
      //     if(err) console.log(err);
      //     // console.log(value);
      //     if(value && value !== null){
      //       $scope.mediaCache.push(value);
      //       persistentPhotos(value, false);
      //       $scope.photoListLength++;
      //     }
      //     // if err is non-null, we got an error. otherwise, value is the value
      //   });
      // }
      // }
      // else {
      //   console.log('hell yea the were some photos taken in this session');
      //   $scope.mediaCache = persistentPhotos();
      //   $scope.photoListLength = persistentLength;
      // }
      $timeout(function(){
        $scope.activePhoto = false;
        $scope.cameraLaunched = true;
      }, 750);
      var tapEnabled = false; //enable tap take picture
      var dragEnabled = false; //enable preview box drag across the screen
      var toBack = false; //send preview box to the back of the webview
      // console.log(cordova.plugins.camerapreview);
      if(screenWidth === 320){
        var rect = {x: 0, y: 45, width: 320, height: 400};
      }
      else if(screenWidth === 375){
        var rect = {x: 0, y: 45, width: 375, height: 468.75};
      }
      // var cameraPrev = cordova.plugins.camerapreview.startCamera(rect, 'back', tapEnabled, dragEnabled, toBack);
      // console.dir(cordova.plugins.camerapreview);

      // var objCanvas = document.getElementById("camera");
      // window.plugin.CanvasCamera.initialize(objCanvas);
      $timeout(function(){
        cordova.plugins.camerapreview.startCamera(rect, 'back', tapEnabled, dragEnabled, toBack);
      }, 2000);
      $timeout(function(){
        cordova.plugins.camerapreview.show();
        $(window).unload(function(){
          cordova.plugins.camerapreview.hide();
          cordova.plugins.camerapreview.stopCamera();
          $ionic.Platform.exitApp();
        });
      }, 300);


      cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
        $scope.mediaCache.push({type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date()});
        $scope.$apply();
        cordova.plugins.camerapreview.show();
        $scope.activePhoto = false;
        $('.takePhotoButtonInner').animate({
          backgroundColor: "white"
        }, 100);

        var windowPic = {type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date()};
        var name = "mopho"+($scope.mediaCache.length-1);
        // localforage.setItem(name, windowPic, function (err) {
        //   if(err) console.log(err);
        // });
        localforage.getItem('storedPhotos')
        .then(function(value){
          console.log(value);
          var photoArrayTemp = value;
          photoArrayTemp.push(windowPic);
          localforage.setItem('storedPhotos', photoArrayTemp)
          .then(function(newPhotoArr){
            console.log('photos stored');
            console.log(newPhotoArr);
          })
          .catch(function(err){
            console.log(err);
          })
        })
        .catch(function(err){
          console.log(err);
        })
        count++
        ////end uber temp storage
      });
    }

    $scope.takeCordovaPicture = function(){
      if($scope.activePhoto === false && $scope.mediaCache.length < 25){
        $scope.activePhoto = true;
        window.plugins.flashlight.switchOff();
        cordova.plugins.camerapreview.takePicture({maxWidth: 2000, maxHeight: 2000});
        // window.plugins.flashlight.switchOff();
        $('.takePhotoButtonInner').css({
          backgroundColor: "red"
        });
        cordova.plugins.camerapreview.hide();
        // $scope.photoListLength++;
      }
      else if($scope.mediaCache.length >= 25 && $scope.cameraMode === 'photo'){
        alert('Sorry, you can only send up to 25 pictures or photos at a time. Please erase a few to free up room to take more MoPhos. Thank you!')
      }
    }

    var photoInt = function(){
       var photoInterval = $interval(function(){
         $scope.takeCordovaPicture();
       }, 80);

       function clearPhotoInt(){
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
      if($scope.activePhoto === false && $scope.mediaCache.length < 25){
        $cordovaCapture.captureVideo({quality : 100})
        .then(function(result){
          console.log(result[0]);
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
      else if($scope.mediaCache.length >= 25){
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

    //////function to open the submit modal
    function openSubmitModal(){
      $ionicScrollDelegate.scrollTop(true);
      $ionicScrollDelegate.freezeScroll(false);
      $scope.submitModalVar = true;
    }
    $scope.openSubmitModal = openSubmitModal;

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
        for (var i = 0; i < set.length; i++) {
          if(set[i].type === "video"){
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/upload/video', set[i].link, {})
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
              ////////this is where we're having data problems, you need to figure out why our string result doesnt work to call the video
              $http({
                method: "POST"
                ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                ,data: {url: sliced, userId: userFullId, isVid: true}
              })
              .then(function(newVid){
                submissionData.videos.push(newVid.data._id);
                var vids = submissionData.videos.length;
                var phots = submissionData.photos.length;
                var amalgam = vids + phots;
                if(amalgam == setLength){
                  $http({
                    method: "POST"
                    ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                    $timeout(function(){
                      $scope.submitModalVar = false;
                      $scope.cameraModal = false;
                      localforage.setItem('storedPhotos', [])
                      .then(function(success){
                        console.log(success);
                      })
                      .catch(function(err){
                        console.log(err);
                      })
                      $scope.cnt = 0;
                      $state.go('tab.account');
                    }, 1000);
                  })
                }
              })
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
              // function addCrop(){
              //   if(set[i].cropData){
              //     photoOptions.params.cloudCropImageWidth = set[i].cropData.cloudCropImageWidth;
              //     photoOptions.params.cloudCropImageHeight = set[i].cropData.cloudCropImageHeight;
              //     photoOptions.params.cloudCropImageX = set[i].cropData.cloudCropImageX;
              //     photoOptions.params.cloudCropImageY = set[i].cropData.cloudCropImageY;
              //     photoOptions.params.naturalWidth = set[i].cropData.imageNaturalWidth;
              //     photoOptions.params.naturalHeight = set[i].cropData.imageNaturalHeight;
              //   }
              //   else {
              //     var el = $('body').append(
              //       "<img src='"+set[i].link+"' class='tempImage'></img>"
              //     )
              //     photoOptions.params.naturalWidth = $('.tempImage').naturalWidth;
              //     photoOptions.params.naturalHeight = $('.tempImage').naturalHeight;
              //   }
              // }
              // addCrop();
              console.log(currentPhoto);
              $cordovaFileTransfer.upload('http://moneyshotapi.herokuapp.com/api/newimage', currentPhoto.link, photoOptions)
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
                  ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                  ,data: {url: parsedPhoto.secure_url, thumbnail: parsedPhoto.thumbnail, userId: userFullId, isVid: false}
                })
                .then(function(newPhoto){
                  submissionData.photos.push(newPhoto.data._id);
                  var vids = submissionData.videos.length;
                  var phots = submissionData.photos.length;
                  var amalgam = vids + phots;
                  if(amalgam == parseInt(set.length)){
                    $http({
                      method: "POST"
                      ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                      ,data: submissionData
                    })
                    .then(function(newSubmission){
                      setTimeout(function(){
                        $scope.submitModalVar = false;
                        $scope.cameraModal = false;
                        localforage.setItem('storedPhotos', [])
                        .then(function(success){
                          console.log(success);
                        })
                        .catch(function(err){
                          console.log(err);
                        })
                        $scope.cnt = 0;
                        $state.go('tab.account');

                      }, 100);
                    })
                  }
                })
              })
            }
            photoIife(set[i]);
          }
        }
      });
    }

    // function cropPhoto(photoData, evt, index){
    //   // console.log(photoData);
    //   $('.submitCropContainer').animate({
    //     marginLeft: 0
    //   }, 400);
    //   // console.log($('.cropHolder'));
    //   // $scope.cropPhotoImage = photoData.link;
    //   var photoOptions = {
    //       quality : 95,
    //       destinationType : Camera.DestinationType.FILE_URI,
    //       sourceType : Camera.PictureSourceType.Camera ,
    //       allowEdit : true,
    //       encodingType: Camera.EncodingType.png,
    //       popoverOptions: CameraPopoverOptions,
    //       saveToPhotoAlbum: false,
    //       checkOrientation: true,
    //       params: {naturalWidth: 0, naturalHeight: 0}
    //   };
    //   $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/crop/photo', photoData.link, {}, true)
    //   .then(function(result){
    //     // console.log(result);
    //     var parsedPhoto = JSON.parse(result.response);
    //     $('.cropHolder').append(
    //       "<img id='image' src='"+parsedPhoto.secure_url+"'></img>"
    //     )
    //     $('#image').cropper({
    //         aspectRatio: 1 / 1,
    //         background: false,
    //         modal: true,
    //         autoCrop: true,
    //         checkOrientation: false,
    //         viewMode: 1,
    //         crop: function(e) {
    //           // Output the result data for cropping image.
    //         }
    //         ,cropmove: function(e){
    //           $scope.cropData = e;
    //           // console.log(e);
    //           // console.log(JSON.parse(e));
    //           console.log('cropData');
    //           var cropData = $("#image").cropper('getData');
    //           console.log(cropData);
    //           console.log('imge data');
    //           var imageData = $("#image").cropper('getImageData');
    //           console.log(imageData);
    //
    //           var imageNumbers = {
    //             cropWidth: cropData.width
    //             ,cropHeight: cropData.height
    //             ,cropOffsetX: cropData.x
    //             ,cropOffsetY: cropData.y
    //             ,imageWidth: imageData.width
    //             ,imageHeight: imageData.height
    //             ,imageNaturalWidth: imageData.naturalWidth
    //             ,imageNaturalHeight: imageData.naturalHeight
    //             ,naturalConversionMultiple: imageData.naturalWidth/imageData.width
    //             ,cloudCropImageWidth: cropData.width*(imageData.naturalWidth/imageData.width)
    //             ,cloudCropImageHeight:cropData.height*(imageData.naturalWidth/imageData.width)
    //             ,cloudCropImageX: cropData.x*(imageData.naturalWidth/imageData.width)
    //             ,cloudCropImageY:cropData.y*(imageData.naturalWidth/imageData.width)
    //             ,DOMImageWidth: $('.submitPhoto').width()
    //             ,conversionMultiple: $('.submitPhoto').width()/cropData.width
    //             ,newImageWidth: imageData.naturalWidth*$('.submitPhoto').width()/cropData.width
    //             ,newImageHeight: imageData.naturalHeight*$('.submitPhoto').width()/cropData.width
    //             ,newImageX: (cropData.x*$('.submitPhoto').width())/(cropData.width)
    //             ,newImageY:  (cropData.y*$('.submitPhoto').width())/(cropData.width)
    //             ,index: index
    //           }
    //           $scope.imageNumbers = imageNumbers;
    //           console.log(imageNumbers);
    //           console.log('element height');
    //           console.log($('.submitPhoto0').height());
    //         }
    //         ,built: function(){
    //
    //         }
    //       });
    //   });
    // }
    // $scope.cropPhoto = cropPhoto;

    // function cropAway(){
    //   $('.submitPhoto'+$scope.imageNumbers.index).css({
    //     width: $scope.imageNumbers.newImageWidth
    //     ,height: $scope.imageNumbers.newImageHeight
    //     ,marginLeft: -($scope.imageNumbers.newImageX)
    //     ,marginTop: -($scope.imageNumbers.newImageY)
    //   })
    //   $('.submitCropContainer').animate({
    //     marginLeft: 100+"%"
    //   }, 700);
    //   setTimeout(function(){
    //     $('#image').remove();
    //     $('.cropper-container').remove();
    //   }, 700);
    //   $scope.mediaCache[$scope.imageNumbers.index]["cropData"] = $scope.imageNumbers;
    //   console.log($scope.imageNumbers);
    // }
    // $scope.cropAway = cropAway;

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

    // setInterval(function(){
    //   var width = $('.submitCell').width();
    //   // console.log(width);
    //   $('.submitCell').css({
    //     height: width*(5/4)+"px"
    //   })
    // }, 500)

    function submitModalOpen(){
      if($scope.activePhoto === false){
        cordova.plugins.camerapreview.hide();
        $scope.submitModalVar = true;
        returnPlace();

        $timeout(function(){
          for (var i = 0; i < 5; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i])
            }
          }
        }, 750);
        $timeout(function(){
          for (var i = 5; i < 10; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i])
            }
          }
        }, 1500);
        $timeout(function(){
          for (var i = 10; i < 15; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i])
            }
          }
        }, 2250);
        $timeout(function(){
          for (var i = 15; i < 20; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i])
            }
          }
        }, 3000);
        $timeout(function(){
          for (var i = 20; i < 25; i++) {
            if($scope.mediaCache[i]){
              $scope.mediaCacheTemp.push($scope.mediaCache[i])
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
      $timeout(function(){
        $scope.photoCarouselBool = false;
        $scope.submitModaVar = true;
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

    // function processBatchErase(item, index, array){
    //   $scope.eraseCount = 0;
    //   console.log(eraseCount);
    //   var itemChild = $(item).find('img');
    //   if(itemChild.hasClass('selectedP')){
    //     eraseCount++;
    //     console.log('theres one: index: '+index+' and item '+item);
    //     $scope.mediaCache.splice(index, 1);
    //     $scope.mediaCacheTemp.splice(index, 1);
    //     $scope.$apply();
    //   }
    // }

    function batchErase(){
      var confirmErase = confirm('Erase all selected photos?');
      if(confirm){
        localforage.getItem('storedPhotos')
        .then(function(storedArr){
          var stored = storedArr;
          var arrObj =  $.makeArray(document.getElementsByClassName('submitCellImageHolder'));
          // console.log(arrObj);
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
                console.log('donezo');
                localforage.setItem('storedPhotos', $scope.mediaCache)
                .then(function(newArray){
                  console.log(newArray);
                })
                .catch(function(err){
                  console.log(err);
                });
              }
            }
          }, 500);
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
          console.log(i);
          if($scope.mediaCache[i]){
            var testLink2 = $scope.mediaCache[i].link;
          }
          else {
            var testLink2 = "blah blah blah";
          }
          if(testLink1 === testLink2 && $scope.eraseStopper === false){
            console.log('go tit');
            console.log($scope.mediaCacheTemp);
            $scope.mediaCache.splice(i, 1);
            $scope.mediaCacheTemp.splice(i, 1);
            console.log($scope.mediaCacheTemp);
            var caughtIt = parseInt(String(i));
            $scope.eraseStopper = true;
            localforage.setItem('storedPhotos', $scope.mediaCache)
            .then(function(success){
              console.log($scope.mediaCache.length);
              console.log(success);
              $scope.eraseStopper = false;
              if(caughtIt === mediaLength-1){
                $($('.photoCarouselCell')[caughtIt-1]).addClass('carouselSelected');
                $scope.photoCarouselObject = $('.photoCarouselCell')[caughtIt-1];
                $scope.$apply();
                var carWidth = $('.photoCarouselInner').width();
                $ionicScrollDelegate.$getByHandle('carouselScroll').scrollTo(carWidth-140, 0, true);
                $('.photoCarouselInner').width(carWidth-70);
              }
              else if($scope.mediaCache.length === 0){
                console.log('closing');
                $scope.photoCarouselBool = false;
                $scope.$apply();
              }
              else {
                console.log(caughtIt);
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

    /////function to scroll to the top
    function unblurring(){
      $ionicScrollDelegate.scrollTo(0, 0);
    };
    $scope.unblurring = unblurring;

    function blurring(){
      $ionicScrollDelegate.freezeScroll(false);
    };
    $scope.blurring = blurring;

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
