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
    console.log(returnDate());
    var googId = 'AIzaSyDspcymxHqhUaiLh2YcwV67ZNhlGd4FyxQ';
    // alert(window.plugin.CanvasCamera);
    // $('html').css({
    //   opacity: 0
    // });
    // console.log($cordovaInAppBrowser);
    ////////////////////////////
    /////////global variables///
    // $scope.mediaCache = [{type: 'photo', link: 'http://www.kaplaninternational.com/blog/wp-content/uploads/2011/08/blah-290x300.jpg'}, {type:'photo', link: '/img/adam.jpg'}, {type:'photo', link: '/img/ben.png'}];
    $scope.mediaCache = [];
    $scope.photoListLength      = 0;
    $scope.croppedPhoto         = '';
    $scope.submitModalVar       = false;
    $scope.photoCarouselBool    = false;
    $scope.cameraModal          = true;
    $scope.cameraLaunched       = false;
    $scope.cameraToggle         = true;
    $scope.submitPhotoModal     = false;
    $scope.activePhoto          = true;
    $scope.carouselSwipeActive  = false;
    $scope.cameraMode           = 'photo';
    var count = 0;
    $scope.cropper              = {};
    $scope.cropper.croppedImage = '';
    var eraseSubmitArr          = [];

    /////end global variables///
    ////////////////////////////

    console.log('Camera Loaded');
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

    /////////////////////////////
    /////functions to upload photos////
    //function to launch camera and take photos
    // if(window.plugin.cameraplus){
    //   console.log(window.plugin.cameraplus);
    // }
    function uploadPhotos(){
      console.log(persistentPhotos());
      $scope.mediaCache = persistentPhotos();
      console.log($scope.mediaCache);
      $scope.photoListLength = $scope.mediaCache.length;
      $timeout(function(){
        $scope.activePhoto = false;
      }, 1000);
      $scope.cameraLaunched = true;
      var tapEnabled = false; //enable tap take picture
      var dragEnabled = false; //enable preview box drag across the screen
      var toBack = false; //send preview box to the back of the webview
      // console.log(cordova.plugins.camerapreview);
      var rect = {x: 0, y: 45, width: 320, height: 400};
      // var cameraPrev = cordova.plugins.camerapreview.startCamera(rect, 'back', tapEnabled, dragEnabled, toBack);
      // console.dir(cordova.plugins.camerapreview);

      // var objCanvas = document.getElementById("camera");
      // window.plugin.CanvasCamera.initialize(objCanvas);
      cordova.plugins.camerapreview.startCamera(rect, 'back', tapEnabled, dragEnabled, toBack);
      cordova.plugins.camerapreview.show();
      $('html').animate({
        opacity: 1
      }, 200);

      cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
        // var file = new File(['data:image/png;base64,'+result[0]], './img/assets/blob/imageFileName.png');
        // console.log(file);
        // console.log(result[0]);
        // var atobber = window.atob(result[0]);
        // // console.log(atobber);
        // // console.log('yo');
        // var byteNumbers = [];
        // var atobLength = atobber.length;
        // for (var i = 0; i < atobLength; i++) {
        //     byteNumbers[i] = atobber.charCodeAt(i);
        // }
        // console.log(byteNumbers);
        // var byteArray = new Uint8Array(byteNumbers);
        // console.log(byteArray);
        // var blob = new Blob([byteArray], {type: 'image/png'});
        // console.log(blob);
        // var imgUrl = URL.createObjectURL(blob);
        // console.log(imgU);

        $scope.mediaCache.push({type: 'photo', link: 'data:image/png;base64,'+result[0], date: new Date()});
        var testIm = new Image();
        testIm.src = 'data:image/png;base64,'+result[0];
        $(testIm).css({
          height: 'auto'
          ,width: 'auto'
        });
        console.log(testIm);
        console.log($(testIm));
        console.log($(testIm).height());
        console.log($(testIm).width());
        // $scope.submitModalVar = true;
        // $timeout(function(){
        //   $scope.submitModalVar = false;
        // }, 10);

        cordova.plugins.camerapreview.show();
        $scope.activePhoto = false;
        count++
        testCnt--
        $('.takePhotoButtonInner').animate({
          backgroundColor: "white"
        }, 100);
      });
    }

    //////function to do status bar stuff
    // $timeout(function(){
    //   uploadPhotos();
    //   ionic.Platform.showStatusBar(false);
    // }, 250);
    // $timeout(function(){
    //   if(!$scope.cameraLaunched){
    //     uploadPhotos();
    //     ionic.Platform.showStatusBar(false);
    //   }
    // }, 2000);

    $(window).unload(function(){
      cordova.plugins.camerapreview.stopCamera();
    })


    $scope.takeCordovaPicture = function(){
      console.log('yyyy');
      if($scope.activePhoto === false && $scope.mediaCache.length < 25){
        $scope.activePhoto = true;
        // console.log(testCnt);
        $scope.photoListLength++;
        testCnt++;

        cordova.plugins.camerapreview.takePicture({maxWidth: 2000, maxHeight: 2000});
        $('.takePhotoButtonInner').css({
          backgroundColor: "red"
        });
        cordova.plugins.camerapreview.hide();
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

    // $('.takeBurstButton').mousedown(function(){
    //   photoInt();
    // });
    //
    // $('.takeBurstButton').mouseup(function(){
    //   clearPhotoInt();
    // });
    // document.addEventListener("deviceready", uploadPhotos);
    // $timeout(function(){
    //   if(!$scope.cameraLaunched){
    //     uploadPhotos();
    //   }
    // }, 500);
    // $timeout(function(){
    //   if(!$scope.cameraLaunched){
    //     uploadPhotos();
    //   }
    // }, 1500);
    // $timeout(function(){
    //   if(!$scope.cameraLaunched){
    //     uploadPhotos();
    //   }
    // }, 2500);
    // $timeout(function(){
    //   if(!$scope.cameraLaunched){
    //     uploadPhotos();
    //   }
    // }, 3500);
    // $timeout(function(){
    //   if(!$scope.cameraLaunched){
    //     uploadPhotos();
    //   }
    // }, 5000);

    // function outPhotoModal(){
    //   $scope.cameraModal = false;
    // }
    // $scope.outPhotoModal = outPhotoModal;
    //
    // function openPhotoModal(){
    //   $scope.cameraModal = true;
    // }
    // $scope.openPhotoModal = openPhotoModal;
    // openPhotoModal();/////calling this function to open the modal right away

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

    // function takePicture(){
    //   var options = {
    //       quality : 95,
    //       destinationType : Camera.DestinationType.FILE_URI,
    //       sourceType : Camera.PictureSourceType.Camera ,
    //       allowEdit : true,
    //       encodingType: Camera.EncodingType.PNG,
    //       correctOrientation: true,
    //       popoverOptions: CameraPopoverOptions,
    //       saveToPhotoAlbum: false,
    //   };
    //   $cordovaCamera.getPicture(options)
    //   .then(function(result){
    //     console.log(result);
    //     $scope.mediaCache.push({
    //       type: "photo"
    //       ,link: result
    //       ,date: new Date()
    //     })
    //   })
    // }
    // $scope.takePicture = takePicture;
    // takePicture();
    $scope.cntPhoto = 0;
    function getPic(){
      console.log($cordovaCapture);
      $cordovaCapture.captureVideo({})
      .then(function(result){
        console.log(result);
        var pathFull = result[0].fullPath;///////this is what we need to add to our cache

        var thumbOpts = {
          mode: 'file'
          ,quality: 1
        }

        console.log(window.PKVideoThumbnail);
        console.log('PATH:', result[0].localURL);
        var source = result[0].localURL
        var fPath = source.split(result[0].name)[0] + $scope.cntPhoto++ + 'test.jpg'
        console.log( 'PATHS: ', source, fPath)
        window.PKVideoThumbnail.createThumbnail ( source, fPath, thumbOpts )
          .then( function( thumbnail ){
            console.log('THUMBNAIL', thumbnail);
            $scope.photoListLength++;
            /////next, we push the video plus some extra data to the media cache, where it waits to be submitted
            console.log($scope.mediaCache);
            $scope.mediaCache.push({
              type: "video"
              ,link: pathFull
              ,thumb: thumbnail
              ,date: new Date()
            });
            console.log($scope.mediaCache);
           })//Didnt' formant still testing
           .catch( function(err){
             console.log('Thumbnail Error======================', err)
           })
          });
          var thisEl = $('.outCameraModal')[0];
          animateClick(thisEl, 'white', 'transparent');
          // $timeout(function(){
          //   navigator.camera.getvideo();
          //   $cordovaCapture.captureVideo({})
          //   .then(function(result){
          //     console.log(result);
          //     var pathFull = result[0].fullPath;///////this is what we need to add to our cache
          //     /////next, we push the video plus some extra data to the media cache, where it waits to be submitted
          //     $scope.mediaCache.push({
          //       type: "video"
          //       ,link: pathFull
          //       ,date: new Date()
          //     })
          //   });
          // }, 300);
    }
    $scope.getPic = getPic;

    //////function to open the submit modal
    function openSubmitModal(){
      console.log('opening baby');
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
        console.log($(evt.currentTarget)[0].nextElementSibling.nextElementSibling);
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


    function deletePhotos(){
      var thisEl = $(".submitDelete")[0];
      animateClick(thisEl, "#6d8383", '#013220');
      for (var i = 0; i < eraseSubmitArr.length; i++) {
        $scope.mediaCache.splice(eraseSubmitArr[i], 1);
      }
      eraseSubmitArr = [];
    }
    $scope.deletePhotos = deletePhotos;


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
      console.log($('.dateInput').val());
      var submissionData;
      var set = $scope.mediaCache;
      console.log(set[0]);
      console.log(set[0].info);
      console.log(set);
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
          console.log(submissionData);
        });
        submissionData.userId = userFullId;

        ////now iterate through to submit to backend
        //////set === mediacache
        console.log(set);
        for (var i = 0; i < set.length; i++) {
          console.log(set[i]);
          if(set[i].type === "video"){
            console.log(set[i]);
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/upload/video', set[i].link, {})
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
              // console.log(set[i].info);
              console.log(sliced);
              // var thumb = sliced.split('').splice(0, sliced.length-4+'.jpg');
              // console.log(thumb);
              // set[i].info.remove(function(sucessInfo){
              //   //////if successful, we just removed this file
              //   console.log("success marker", successInfo);
              // }, function(err){
              //   console.log('ERR is', err);
              // })
              ////////this is where we're having data problems, you need to figure out why our string result doesnt work to call the video
              $http({
                method: "POST"
                ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                ,data: {url: sliced, userId: userFullId, isVid: true}
              })
              .then(function(newVid){
                console.log(newVid);
                submissionData.videos.push(newVid.data._id);
                var vids = submissionData.videos.length;
                var phots = submissionData.photos.length;
                var amalgam = vids + phots;
                if(amalgam == setLength){
                  console.log(submissionData);
                  $http({
                    method: "POST"
                    ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                    console.log(newSubmission);
                    $timeout(function(){
                      $scope.submitModalVar = false;
                      $scope.cameraModal = false;
                      persistentPhotos('empty');
                      $scope.cnt = 0;
                      $state.go('tab.account');
                    }, 1000);
                  })
                }
              })
            })
          }
          else if(set[i].type === "photo"){
            console.log(set[i]);
            console.log(submissionData);


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
              console.log('about to send to backend');
              $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', currentPhoto.link, photoOptions)
              .then(function(callbackImage){
                console.log('sent to backend');
                console.log(callbackImage.response);
                console.log(callbackImage.response.secureUrl);
                // console.log('THIS IS IN THE CALLBACK', currentPhoto);
                var progressElement = $('.submitProgressBar');
                if(zeroProgress <= 100){
                  zeroProgress += progressPercentage;
                  progressElement.animate({
                    width: zeroProgress+"%"
                  }, 200);
                }
                console.log(currentPhoto.info);
                // currentPhoto.info.remove(function(sucessInfo){
                //   //////if successful, we just removed this file
                //   console.log("success marker", successInfo);
                // }, function(err){
                //   console.log('ERR is', err);
                // })
                // var onSuccess = function(entry){
                //   console.log(entry);
                //   entry.remove( function(sucessInfo){
                //   //   //////if successful, we just removed this file
                //     console.log("success marker", successInfo);
                //   }, function(err){
                //     console.log('ERR is', err);
                //   })
                // }
                // var onError = function(error){
                //   console.log(error);
                // }
                // console.log("fullpath", currentPhoto.info.fullPath);
                // window.resolveLocalFileSystemURL("cdvfile://localhost/assets-library://"+currentPhoto.info.fullPath, onSuccess, onError);
                var parsedPhoto = JSON.parse(callbackImage.response);
                console.log(submissionData);
                $http({
                  method: "POST"
                  ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                  ,data: {url: parsedPhoto.secure_url, thumbnail: parsedPhoto.thumbnail, userId: userFullId, isVid: false}
                })
                .then(function(newPhoto){
                  console.log(submissionData);
                  submissionData.photos.push(newPhoto.data._id);
                  var vids = submissionData.videos.length;
                  var phots = submissionData.photos.length;
                  var amalgam = vids + phots;
                  if(amalgam == parseInt(set.length)){
                    console.log(submissionData);
                    $http({
                      method: "POST"
                      ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                      ,data: submissionData
                    })
                    .then(function(newSubmission){
                      // console.log(newSubmission);
                      console.log(submissionData);
                      setTimeout(function(){
                        $scope.submitModalVar = false;
                        $scope.cameraModal = false;
                        persistentPhotos("empty");
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

    function submitModalOpen(set){
      if($scope.activePhoto === false){
        cordova.plugins.camerapreview.hide();
        $timeout(function(){
          var set = $scope.mediaCache;
          $scope.submitModalVar = true;
          var mediaLength = set.length;
          returnPlace();
        }, 20);
      }
    }

    $scope.submitModalOpen = submitModalOpen;

    function backToPhotos(){
      $timeout(function(){
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
        persistentPhotos($scope.mediaCache);
        cordova.plugins.camerapreview.hide();
        $state.go('tab.account');
      }, 150);
    }
    $scope.leaveCamera = leaveCamera;

    ///////function to animate button presses for any inserted element
    function animateClick(jsEl, color1, color2){
      var jqEl = $(jsEl);
      console.log(jqEl);
      jqEl.css({
        backgroundColor: color1
      })
      jqEl.animate({
        backgroundColor: color2
      }, 350);
    }

    function switchCamera(mode){
      console.log('yooooo');
      console.log(mode);
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
      console.log(curr);
    }
    $scope.findNewPlace = returnPlace;

    ///////begin photo carousel animation work
    function goToCarousel(mediaData, index, evt){
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
          console.log($('.mainPhotoHolder').width());
          $($('.photoCarouselCell')[index]).css({
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
      $('.photoCarouselInner').animate({
        marginLeft: index*-70+125+"px"
      }, 300);
      if(direction === 'right'){
        $($('.photoCarouselCell')[index+1]).animate({
          borderWidth: '0px'
          ,marginLeft: '0px'
          ,marginRight: '0px'
        }, 300);
      }
      else if(direction === 'left'){
        $($('.photoCarouselCell')[index-1]).animate({
          borderWidth: '0px'
          ,marginLeft: '0px'
          ,marginRight: '0px'
        }, 300);
      }
      // $timeout(function(){
      $($('.photoCarouselCell')[index]).animate({
        borderWidth: '2px'
        ,marginRight: '10px'
        ,marginLeft: '10px'
      }, 300);
      // }, 100);
    }
    $scope.openNewCarouselPhoto = openNewCarouselPhoto;

    function swipeLeftAnimation(centerP){
      console.log('swiped');
      console.log($scope.mediaCache[centerP.index+1]);
      var imgClone = $('.mainPhotoCar').clone();
      imgClone.removeClass("mainPhotoCar");
      imgClone.addClass("mainPhotoCarTwo");
      imgClone.attr('id', 'mainPhotoId');
      imgClone.attr('ng-src', '');
      imgClone.attr('src', $scope.mediaCache[centerP.index+1].link);
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
        $('.mainPhotoCar').attr('src', $scope.mediaCache[centerP.index+1].link);
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
        if(centerP.index+1 < $scope.mediaCache.length){
          openNewCarouselPhoto($scope.mediaCache[centerP.index+1], centerP.index+1, 'left');
        }
      // }
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
      console.log('centering');
      var currP = findCenterPhoto();
      console.log(currP);
    }
    $scope.centerPhoto = centerPhoto;

    function findCenterPhoto(){
      var carou = $('.photoCarouselCell')
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

    function erasePhoto(){
      console.log($scope.photoCarouselObject);
      console.log($scope.mediaCache);
      var mediaLength = $scope.mediaCache.length;
      var testLink1 = $scope.photoCarouselObject.link;
      for (var i = 0; i < mediaLength; i++) {
        var testLink2 = $scope.mediaCache[i].link;
        if(testLink1 === testLink2){
          if(i > 0){
            $scope.photoCarouselObject = $scope.mediaCache[i-1];
            $scope.mediaCache.splice(i, 1);
            $scope.photoListLength--;
            if($scope.mediaCache[0]){
              photoCarouselSwipeRight();
            }
          }
          else if(i === 0){
            photoCarouselSwipeLeft();
            $scope.mediaCache.splice(i, 1);
            // $scope.photoCarouselObject = $scope.mediaCache[i];
            $scope.photoListLength--;

            // if($scope.mediaCache[0]){
            //   photoCarouselSwipeLeft();
            // }
          }
          else {
            $scope.photoCarouselObject = '';
            $timeout(function(){
              $scope.photoCarouselBool = false;
            }, 100);
          }
        }
      }
      console.log($scope.mediaCache);
    }
    $scope.erasePhoto = erasePhoto;

    //////x button animation
    function animateX(){
      $('.cameraBack').css({
        opacity: 0.25
      });
      $('.cameraBack').animate({
        opacity: 1
      }, 200);
    }
    $scope.animateX = animateX;

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

  }
