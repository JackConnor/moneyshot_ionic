angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture){
    ////////////////////////////
    /////////global variables///
    var sessionSet = [];
    $scope.sessionSet = sessionSet;
    console.log();
    console.log($cordovaCapture);
    // setTimeout(function(){
    //   console.log('hey yoooo');
    //   if(window.localStorage.webToken.length > 10){
    //     takePicture();
    //   }
    // }, 2000);
    /////////global variables///
    ////////////////////////////

    /////////////////////////////
    /////functions to upload photos////
    function takePicture(){
      var options = {
          quality : 80,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          headers: {
            userId: '12345'
          }
      };
      $cordovaCamera.getPicture({})
      .then(function(result){
        $cordovaFileTransfer.upload('http://192.168.0.3:5555/api/newimage', result, options)
        .then(function(callbackImage){
          $http({
            method: "GET"
            ,url: "http://192.168.0.3:5555/api/decodetoken/"+window.localStorage.webToken
          })
          .then(function(decodedToken){
            console.log(decodedToken);
            var parsedPhoto = JSON.parse(callbackImage.response);
            $http({
              method: "POST"
              ,url: "http://192.168.0.3:5555/api/createphotos"
              ,data: {url: parsedPhoto.secure_url, userId: decodedToken.data.userId}
            })
            .then(function(newPhoto){
              console.log('the photo object');
              console.log(newPhoto);
            })
          })
          // takePicture();
        })
      })
    }

    // takePicture();
    function getPic(){
      console.log('camera baby');
      $cordovaCapture.captureVideo({})
      .then(function(result){
        console.log(result);
        $scope.sessionSet.push(result);
        console.log('set coming');
        console.log($scope.sessionSet);
        if(result != null){
          getPic();
        }
      })
    }
    $scope.getPic = getPic;
    getPic();

    /////test video stuff
    // function launchVideo(){
    //   var options = { limit: 3, duration: 15 };
    //   $cordovaCamera.captureVideo(options)
    //   .then(function(videoResult){
    //     console.log(videoResult);
    //   })
    // }
    // launchVideo();
    // $cordovaCamera.captureVideo({})
    // .then(function(videoResult){
    //   console.log(videoResult);
    // })
    //////end test video stuff

    function submitAllPhotos(set){
      console.log('submitting');
      console.log(set);
      console.log(set.length);
      // alert(set);
      for (var i = 0; i < set.length; i++) {
        var options = {
            quality : 80,
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.Camera ,
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            headers: {
              userId: '12345'
            }
        };
        $cordovaFileTransfer.upload('http://192.168.0.4:5555/api/newimage', set[0], options)
        .then(function(callbackImage){
          console.log(callbackImage);
          $http({
            method: "GET"
            ,url: "http://192.168.0.4:5555/api/decodetoken/"+window.localStorage.webToken
          })
          .then(function(decodedToken){
            console.log(decodedToken);
            var parsedPhoto = JSON.parse(callbackImage.response);
            $http({
              method: "POST"
              ,url: "http://192.168.0.4:5555/api/createphotos"
              ,data: {url: parsedPhoto.secure_url, userId: decodedToken.data.userId}
            })
            .then(function(newPhoto){
              console.log('the photo object');
              console.log(newPhoto);
            })
          })
          // takePicture();
        })
      }
    }
    $scope.submitAllPhotos = submitAllPhotos;

    //////function to check for an active user and launch the camera
    // function launchCamera(){
    //   if(window.localStorage.webToken.length > 4){
    //     console.log('we got a token');
    //     takePicture();
    //   }
    //   else {
    //     console.log('need a token');
    //   }
    // }

    // launchCamera();

    //////function to open the camera on the controller's load if there are no modals open
    // function loadCameraIfSigned(){
    //   console.log('camera coming');
    //   if($scope.signupModalVar == false && $scope.signinModalVar == false && $scope.signupModalTabs == false){
    //     takePicture();
    //   }
    // }
    // loadCameraIfSigned();
    //////////////end upload photos////
    ///////////////////////////////////


  }
