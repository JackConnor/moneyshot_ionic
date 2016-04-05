angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', 'Upload', '$cordovaStatusbar', '$timeout'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture, Upload, $cordovaStatusbar, $timeout){
    // delete window.localStorage.webToken;

    // ionic.Platform.fullScreen();//////hides status bar
    ////////function to remove tabs from this view
    function removeTabs(){
      $('ion-tabs').addClass('tabs-item-hide');
    }
    removeTabs();
    ////////////////////////////
    /////////global variables///
    // $scope.mediaCache = [{"link":"/img/adam.jpg", "type":"photo"}, {"link":"/img/max.png", "type":"photo"}, {"link":"/img/ben.png", "type":"photo"}];
    $scope.mediaCache = [{type:'photo', link: '/img/adam.jpg'}, {type:'photo', link: '/img/ben.png'}];
    // $scope.mediaCache = [];
    $scope.croppedPhoto = '';
    $scope.submitModalVar = true;
    $scope.cameraModal = false;
    $scope.cameraLaunched = false;
    $scope.cameraToggle = true;
    var eraseSubmitArr = [];
    /////end global variables///
    ////////////////////////////

    /////////////////////////////
    /////functions to upload photos////
    // console.log(CanvasCamera);
    function uploadPhotos() {
      console.log('cameraaaaaa');
        $scope.cameraLaunched = true;
        var tapEnabled = false; //enable tap take picture
        var dragEnabled = true; //enable preview box drag across the screen
        var toBack = false; //send preview box to the back of the webview
        // console.log(cordova.plugins.camerapreview);
        var rect = {x: 0, y: 50, width: 375, height: 398};
        cordova.plugins.camerapreview.startCamera(rect, 'front', tapEnabled, dragEnabled, toBack);
        cordova.plugins.camerapreview.show();
        cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
          console.log('yoooooo');
          console.log(result);
          // $('.boom').attr('src', result[0]);
          // alert($('.boom').attr('src'));
          var picResult = result[0]
          // $scope.newPhotoData = result[0];
          $scope.mediaCache.push({
            type: "photo"
            ,link: picResult
            ,date: new Date()
          });
        });
        function toggleView(){
          cordova.plugins.camerapreview.switchCamera();
        }
        $scope.toggleView = toggleView;
        // window.plugin.CanvasCamera.start(opt);
        // document.getElementById('camera').style.height = 100+"%";
        function takeCordovaPicture(){
          cordova.plugins.camerapreview.takePicture({maxWidth:2000, maxHeight:2000});
          $('.takePhotoButton').css({
            backgroundColor: "red"
          })
          setTimeout(function(){
            $('.takePhotoButton').css({
              backgroundColor: "blue"
            })
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
        $scope.takeCordovaPicture = takeCordovaPicture;
    }
    document.addEventListener("deviceready", uploadPhotos);
    $timeout(function(){
      if(!$scope.cameraLaunched){
        uploadPhotos();
      }
    }, 1500);
    ////////delayed functions fire in case the device is not loading up for the first time if the app was already open
    // setTimeout(function(){
    //   console.log();
    //   if($scope.cameraLaunched == false){
    //     uploadPhotos();
    //   }
    // }, 100);
    // setTimeout(function(){
    //   if($scope.cameraLaunched == false){
    //     uploadPhotos();
    //   }
    // }, 500);
    // setTimeout(function(){
    //   if($scope.cameraLaunched == false){
    //     uploadPhotos();
    //   }
    // }, 1000);
    // setTimeout(function(){
    //   if($scope.cameraLaunched == false){
    //     uploadPhotos();
    //   }
    // }, 2000);

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
      $cordovaCapture.captureVideo({})
      .then(function(result){
        var pathFull = result[0].fullPath;///////this is what we need to add to our cache
        /////next, we push the video plus some extra data to the media cache, where it waits to be submitted
        $scope.mediaCache.push({
          type: "video"
          ,link: pathFull
          ,date: new Date()
        })
      })
    }
    $scope.getPic = getPic;
    // getPic();

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
      for (var i = 0; i < eraseSubmitArr.length; i++) {
        $scope.mediaCache.splice(eraseSubmitArr[i], 1);
      }
      eraseSubmitArr = [];
    }
    $scope.deletePhotos = deletePhotos;

    //////function to submit all cached photos from your session to the db
    function submitAllPhotos(set){
      console.log('working');
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
      console.log('huh?');
      //////first we need to find the users ID, so we can use it to make the post requests
      $http({
        method: "GET"
        ,url: "https://moneyshotapi.herokuapp.com/api/decodetoken/"+window.localStorage.webToken
      })
      .then(function(decodedToken){
        console.log('yo decoded '+decodedToken.data.userId);
        var userFullId = decodedToken.data.userId;
        submissionData.userId = userFullId;

        ////now iterate through to submit to backend
        for (var i = 0; i <= set.length; i++) {
          if(set[i].type == "video"){
            console.log('video');
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/upload/video', set[i].link, {})
            .then(function(callbackImage){
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
                if(amalgam == parseInt(set.length)){
                  $http({
                    method: "POST"
                    ,url: "https://moneyshotapi.herokuapp.com/api/new/submission"
                    ,data: submissionData
                  })
                  .then(function(newSubmission){
                    console.log(newSubmission);
                    if(i = set.length-1){
                      $scope.submitModalVar = false;
                      $scope.cameraModal = false;
                      window.location.hash = "#/tab/account"
                    }
                  })
                }
              })
            })
          }
          else if(set[i].type == "photo"){
            console.log('photo');
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
                console.log(photoOptions);
              }
              else {
                var el = $('body').append(
                  "<img src='"+set[i].link+"' class='tempImage'></img>"
                )
                console.log('width');
                console.log($('.tempImage').naturalWidth);
                photoOptions.params.naturalWidth = $('.tempImage').naturalWidth;
                photoOptions.params.naturalHeight = $('.tempImage').naturalHeight;
              }
            }
            addCrop();
            $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', set[i].link, photoOptions)
            .then(function(callbackImage){
              var parsedPhoto = JSON.parse(callbackImage.response);
              console.log(parsedPhoto);
              $http({
                method: "POST"
                ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
                ,data: {url: parsedPhoto.secure_url, userId: userFullId, isVid: false}
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
                    console.log(newSubmission);
                    // console.log(newSubmission);
                    if(i = set.length-1){
                      $scope.submitModalVar = false;
                      $scope.cameraModal = false;
                      window.location.hash = "#/tab/account"
                    }
                  })
                }
              })
            })
          }
        }
      })
    }
    $scope.submitAllPhotos = submitAllPhotos;

    function cropPhoto(photoData, evt, index){
      console.log(photoData);
      // $scope.croppedPhoto = photoData;
      $('.submitCropContainer').animate({
        marginLeft: 0
      }, 700);
      $('.submitCropContainer').append(
        "<img id='image' src='"+photoData.link+"' class='cropImage'>"
      )
      $('.cropImage').css({
        width: 100+"%"
        ,height: 100+"%"
      })
      $(".cropImage").cropper({
        zoomOnWheel: false,
        background: false,
        modal: false,
        autoCrop: true,
        viewMode: 1,
        aspectRatio: 4/5,
        crop: function(e){
          $scope.cropData = e;
          // console.log(e);
          // console.log(JSON.parse(e));
          var cropData = $(".cropImage").cropper('getData');
          console.log(cropData);
          var imageData = $(".cropImage").cropper('getImageData');
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
            ,newImageWidth: imageData.width*$('.submitPhoto').width()/cropData.width
            ,newImageHeight: imageData.height*$('.submitPhoto').width()/cropData.width
            ,newImageX: cropData.x*$('.submitPhoto').width()/cropData.width
            ,newImageY: cropData.y*$('.submitPhoto').width()/cropData.width
            ,index: index
          }
          $scope.imageNumbers = imageNumbers;
          console.log(imageNumbers);
        },
        built: function (e) {
          // $(this).cropper('crop');
        }
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
        $('.cropper-container').remove();
      }, 700);
      $scope.mediaCache[$scope.imageNumbers.index]["cropData"] = $scope.imageNumbers;
      console.log($scope.mediaCache);

    }
    $scope.cropAway = cropAway;

    function backToSubmit(){
      $('.submitCropContainer').animate({
        marginLeft: 100+"%"
      }, 700);
      setTimeout(function(){
        $('.cropper-container').remove();
      }, 700);
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
      cordova.plugins.camerapreview.hide();
      $scope.submitModalVar = true;
                /////
      console.log($scope.mediaCache);
      setTimeout(function(){
        for (var i = 0; i < $scope.mediaCache.length; i++) {

          document.getElementById('submit'+i).src = $scope.mediaCache[i].link
        }
      }, 500);
      // for (var i = 0; i < $scope.mediaCache.length; i++) {
      //   if($scope.mediaCache[i].type == 'photo'){
      //     alert('photo');
      //     $('.submitRepeat').append(
      //       "<h2>YOOOOOOO</h2>"+
      //       "<div class='submitCell col-xs-6'>"+
      //         // "<img class='submitPhoto submitPhoto"+i+"' src='"+$scope.mediaCache[i].link+"'/>"+
      //         "<img class='submitPhoto submitPhoto"+i+"' src='http://weknowyourdreamz.com/images/book/book-07.jpg'/>"+
      //       "</div>"
      //     )
      //   }
      //   else if($scope.mediaCache[i].type == 'video'){
      //     $('.submitRepeat').append(
      //       "<div class='submitCell col-xs-6'>"+
      //       "<video src='"+$scope.mediaCache[i].link+"' class='submitPhoto submitPhoto"+i+"></video>"+
      //       "</div>"
      //     )
      //   }
      // }
    }

    $scope.submitModalOpen = submitModalOpen;

    function backToPhotos(){
      cordova.plugins.camerapreview.show();
      $scope.submitModalVar = false;
    }
    $scope.backToPhotos = backToPhotos;

    function leaveCamera(){
      cordova.plugins.camerapreview.hide();
      window.location.hash = "#/tab/account"
      // setTimeout(function(){
      //   cordova.plugins.camerapreview.stopCamera();
      // }, 2000);
    }
    $scope.leaveCamera = leaveCamera;
  }
