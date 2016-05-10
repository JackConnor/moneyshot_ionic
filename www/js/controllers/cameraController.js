angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl)

  .filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  });

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', 'Upload', '$cordovaStatusbar', '$timeout'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture, Upload, $cordovaStatusbar, $timeout){
    function removeTabs(){
      $('ion-tabs').addClass('tabs-item-hide');
    }
    removeTabs();
    ionic.Platform.showStatusBar(false);
    ////////////////////////////
    /////////global variables///
    // $scope.mediaCache = [{type: 'photo', link: 'http://www.kaplaninternational.com/blog/wp-content/uploads/2011/08/blah-290x300.jpg'}, {type:'photo', link: '/img/adam.jpg'}, {type:'photo', link: '/img/ben.png'}];
    $scope.mediaCache = [];
    $scope.croppedPhoto         = '';
    $scope.submitModalVar       = false;
    $scope.cameraModal          = true;
    $scope.cameraLaunched       = false;
    $scope.cameraToggle         = true;
    $scope.submitPhotoModal     = false;
    $scope.activePhoto          = true;
    $scope.cropper              = {};
    $scope.cropper.croppedImage = '';
    var eraseSubmitArr          = [];
    /////end global variables///
    ////////////////////////////

    /////////////////////////////
    /////functions to upload photos////
    //function to launch camera and take photos
    function uploadPhotos() {
        setTimeout(function(){
          $scope.activePhoto = false;
        }, 750);
        $scope.cameraLaunched = true;
        var tapEnabled = false; //enable tap take picture
        var dragEnabled = false; //enable preview box drag across the screen
        var toBack = false; //send preview box to the back of the webview
        // console.log(cordova.plugins.camerapreview);
        var rect = {x: 0, y: 40, width: 375, height: 420};
        cordova.plugins.camerapreview.startCamera(rect, 'back', tapEnabled, dragEnabled, toBack);
        cordova.plugins.camerapreview.show();
        cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
          var picResult = result[0]
          $scope.mediaCache.push({
            type: "photo"
            ,link: picResult
            ,date: new Date()
          });
        });

        function takeCordovaPicture(){
          if($scope.activePhoto === false){
            $scope.activePhoto = true;
            setTimeout(function(){
              $scope.activePhoto = false;
            }, 600);
            cordova.plugins.camerapreview.takePicture({maxWidth:2000, maxHeight:2000});
            $('.takePhotoButton').css({
              backgroundColor: "red"
            })
            setTimeout(function(){
              $('.takePhotoButton').css({
                backgroundColor: "blue"
              });
            }, 300)
            $('.cameraModal').css({
              backgroundColor: "#7f0000"
            })
            setTimeout(function(){
              $('.cameraModal').css({
                backgroundColor: ""
              })
            }, 200);
          }
        }
        $scope.takeCordovaPicture = takeCordovaPicture;
    }
    document.addEventListener("deviceready", uploadPhotos);
    $timeout(function(){
      if(!$scope.cameraLaunched){
        uploadPhotos();
      }
    }, 1500);

    function outPhotoModal(){
      $scope.cameraModal = false;
    }
    $scope.outPhotoModal = outPhotoModal;

    function openPhotoModal(){
      $scope.cameraModal = true;
    }
    $scope.openPhotoModal = openPhotoModal;
    openPhotoModal();/////calling this function to open the modal right away

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

    function takePicture(){
      var options = {
          quality : 95,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.PNG,
          correctOrientation: true,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
      };
      $cordovaCamera.getPicture({})
      .then(function(result){
        $scope.mediaCache.push({
          type: "photo"
          ,link: result
          ,date: new Date()
        })
      })
    }
    $scope.takePicture = takePicture;
    // takePicture();
    function getPic(){
      var thisEl = $('.outCameraModal')[0];
      animateClick(thisEl, 'white', 'transparent');
      setTimeout(function(){
        $cordovaCapture.captureVideo({})
        .then(function(result){
          var pathFull = result[0].fullPath;///////this is what we need to add to our cache
          /////next, we push the video plus some extra data to the media cache, where it waits to be submitted
          $scope.mediaCache.push({
            type: "video"
            ,link: pathFull
            ,date: new Date()
          })
        });
      }, 300);
    }
    $scope.getPic = getPic;

    //////function to open the submit modal
    function openSubmitModal(){
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
      console.log(nameInfo);
      if(nameInfo.length > 1){
        $scope.submitBar = true;
        submitNameAndPhotos();
      }
      else {
        alert('Please add a little more info about these photos before you submit, so we can help you earn more money')
      }
    }
    $scope.submitPhotoName = submitPhotoName;

    //////function to submit all cached photos from your session to the db
    function submitAllPhotos(set){
      $scope.set = set;
      var thisEl = document.getElementsByClassName('submitButton')[0];
      animateClick(thisEl, "#6d8383", '#013220');
      $scope.submitPhotoModal = true;
      $scope.submitBar        = false;
    }
    $scope.submitAllPhotos = submitAllPhotos;

    /////function to close the loading modal
    function closeLoadingModal(){
      $(".submitPhotoBacking").animate({
        opacity: 0
      }, 200);
      setTimeout(function(){
        $scope.submitPhotoModal = false;
        $scope.submitBar        = false;
      }, 200);
    }
    $scope.closeLoadingModal = closeLoadingModal;

    ////animations and actual submissionData
    function submitNameAndPhotos(){
      var submissionData;
      var set = $scope.set;
      var setLength = set.length;
      var zeroProgress = 0;
      var progressPercentage = 100/setLength;
      //////through our if-statement below, we'll need to add different options so that photos and videos get processed correctly
      var photoOptions = {
          quality : 95,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          params: {naturalWidth: 0, naturalHeight: 0}
      };
      var videoOptions = {

      }
      var submissionData = {photos: [], videos: [], userId: ''};
      //////first we need to find the users ID, so we can use it to make the post requests
      $http({
        method: "GET"
        ,url: "https://moneyshotapi.herokuapp.com/api/decodetoken/"+window.localStorage.webToken
      })
      .then(function(decodedToken){
        var userFullId = decodedToken.data.userId;
        submissionData.userId = userFullId;

        ////now iterate through to submit to backend
        for (var i = 0; i <= set.length; i++) {
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
              else {

              }
              var splitUrl = callbackImage.response.split('');
              var sliced = splitUrl.slice(1, callbackImage.response.split('').length - 1);
              ////////this is where we're having data problems, you need to figure out why our string result doesnt work to call the video
              $http({
                method: "POST"
                ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                ,data: {url: sliced.join(''), userId: userFullId, isVid: true}
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
                    setTimeout(function(){
                      $scope.submitModalVar = false;
                      $scope.cameraModal = false;
                      window.location.hash = "#/tab/account"
                    }, 1000);
                  })
                }
              })
            })
          }
          else if(set[i].type === "photo"){
            var photoOptions = {
                quality : 95,
                destinationType : Camera.DestinationType.FILE_URI,
                sourceType : Camera.PictureSourceType.Camera ,
                allowEdit : true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                params: {naturalWidth: 0, naturalHeight: 0}
            };
            function addCrop(){
              if(set[i].cropData){
                photoOptions.params.cloudCropImageWidth = set[i].cropData.cloudCropImageWidth;
                photoOptions.params.cloudCropImageHeight = set[i].cropData.cloudCropImageHeight;
                photoOptions.params.cloudCropImageX = set[i].cropData.cloudCropImageX;
                photoOptions.params.cloudCropImageY = set[i].cropData.cloudCropImageY;
                photoOptions.params.naturalWidth = set[i].cropData.imageNaturalWidth;
                photoOptions.params.naturalHeight = set[i].cropData.imageNaturalHeight;
              }
              else {
                var el = $('body').append(
                  "<img src='"+set[i].link+"' class='tempImage'></img>"
                )
                photoOptions.params.naturalWidth = $('.tempImage').naturalWidth;
                photoOptions.params.naturalHeight = $('.tempImage').naturalHeight;
              }
            }
            addCrop();
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', set[i].link, photoOptions)
            .then(function(callbackImage){
              var progressElement = $('.submitProgressBar');
              if(zeroProgress <= 100){
                zeroProgress += progressPercentage;
                progressElement.animate({
                  width: zeroProgress+"%"
                }, 200);
              }
              else {
                return;
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
                    // console.log(newSubmission);
                    setTimeout(function(){
                      $scope.submitModalVar = false;
                      $scope.cameraModal = false;
                      window.location.hash = "#/tab/account"
                    }, 100);
                  })
                }
              })
            })
          }
        }
      });
    }

    function cropPhoto(photoData, evt, index){
      // console.log(photoData);
      $('.submitCropContainer').animate({
        marginLeft: 0
      }, 400);
      // console.log($('.cropHolder'));
      // $scope.cropPhotoImage = photoData.link;
      var photoOptions = {
          quality : 95,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.png,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          checkOrientation: true,
          params: {naturalWidth: 0, naturalHeight: 0}
      };
      $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/crop/photo', photoData.link, {}, true)
      .then(function(result){
        // console.log(result);
        var parsedPhoto = JSON.parse(result.response);
        $('.cropHolder').append(
          "<img id='image' src='"+parsedPhoto.secure_url+"'></img>"
        )
        $('#image').cropper({
            aspectRatio: 1 / 1,
            background: false,
            modal: true,
            autoCrop: true,
            checkOrientation: false,
            viewMode: 1,
            crop: function(e) {
              // Output the result data for cropping image.
            }
            ,cropmove: function(e){
              $scope.cropData = e;
              // console.log(e);
              // console.log(JSON.parse(e));
              console.log('cropData');
              var cropData = $("#image").cropper('getData');
              console.log(cropData);
              console.log('imge data');
              var imageData = $("#image").cropper('getImageData');
              console.log(imageData);

              var imageNumbers = {
                cropWidth: cropData.width
                ,cropHeight: cropData.height
                ,cropOffsetX: cropData.x
                ,cropOffsetY: cropData.y
                ,imageWidth: imageData.width
                ,imageHeight: imageData.height
                ,imageNaturalWidth: imageData.naturalWidth
                ,imageNaturalHeight: imageData.naturalHeight
                ,naturalConversionMultiple: imageData.naturalWidth/imageData.width
                ,cloudCropImageWidth: cropData.width*(imageData.naturalWidth/imageData.width)
                ,cloudCropImageHeight:cropData.height*(imageData.naturalWidth/imageData.width)
                ,cloudCropImageX: cropData.x*(imageData.naturalWidth/imageData.width)
                ,cloudCropImageY:cropData.y*(imageData.naturalWidth/imageData.width)
                ,DOMImageWidth: $('.submitPhoto').width()
                ,conversionMultiple: $('.submitPhoto').width()/cropData.width
                ,newImageWidth: imageData.naturalWidth*$('.submitPhoto').width()/cropData.width
                ,newImageHeight: imageData.naturalHeight*$('.submitPhoto').width()/cropData.width
                ,newImageX: (cropData.x*$('.submitPhoto').width())/(cropData.width)
                ,newImageY:  (cropData.y*$('.submitPhoto').width())/(cropData.width)
                ,index: index
              }
              $scope.imageNumbers = imageNumbers;
              console.log(imageNumbers);
              console.log('element height');
              console.log($('.submitPhoto0').height());
            }
            ,built: function(){

            }
          });
      });
    }
    $scope.cropPhoto = cropPhoto;

    function cropAway(){
      $('.submitPhoto'+$scope.imageNumbers.index).css({
        width: $scope.imageNumbers.newImageWidth
        ,height: $scope.imageNumbers.newImageHeight
        ,marginLeft: -($scope.imageNumbers.newImageX)
        ,marginTop: -($scope.imageNumbers.newImageY)
      })
      $('.submitCropContainer').animate({
        marginLeft: 100+"%"
      }, 700);
      setTimeout(function(){
        $('#image').remove();
        $('.cropper-container').remove();
      }, 700);
      $scope.mediaCache[$scope.imageNumbers.index]["cropData"] = $scope.imageNumbers;
      console.log($scope.imageNumbers);
    }
    $scope.cropAway = cropAway;

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

    setInterval(function(){
      var width = $('.submitCell').width();
      // console.log(width);
      $('.submitCell').css({
        height: width*(5/4)+"px"
      })
    }, 500)

    function submitModalOpen(){
      var thisEl = $('.submitSetDiv')[0];
      animateClick(thisEl, '#8CDD81', 'transparent');
      for (var i = 0; i < $scope.mediaCache.length; i++) {
        document.getElementById('submit'+i).src = $scope.mediaCache[i].link
      }
      setTimeout(function(){
        $scope.submitModalVar = true;
        setTimeout(function(){
          cordova.plugins.camerapreview.hide();
        }, 100);
      }, 150);
    }

    $scope.submitModalOpen = submitModalOpen;

    function backToPhotos(){
      var thisEl = $(".backToPhotos")[0];
      animateClick(thisEl, "#6d8383", '#013220');
      setTimeout(function(){
        $scope.submitModalVar = false;
        setTimeout(function(){
          cordova.plugins.camerapreview.show();
        }, 500);
      }, 100);
    }
    $scope.backToPhotos = backToPhotos;

    function toggleView(evt){
      console.log('fffff');
      var thisEl = $(evt.currentTarget);
      console.log(thisEl);
      animateClick(thisEl, '#c0caca', 'transparent');
      cordova.plugins.camerapreview.switchCamera();
    }
    $scope.toggleView = toggleView;

    function leaveCamera(){
      var thisEl = $('.longArrow');
      animateClick(thisEl, '#c0caca', 'transparent');
      setTimeout(function(){
        cordova.plugins.camerapreview.hide();
        window.location.hash = "#/tab/account"
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
  }
