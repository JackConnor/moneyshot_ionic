angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken){
    ////////////////////////////
    /////////global variables///
    console.log('yoyoyoy');
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
        $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', result, options)
        .then(function(callbackImage){
          $http({
            method: "GET"
            ,url: "https://moneyshotapi.herokuapp.com/api/decodetoken/"+window.localStorage.webToken
          })
          .then(function(decodedToken){
            console.log(decodedToken);
            var parsedPhoto = JSON.parse(callbackImage.response);
            $http({
              method: "POST"
              ,url: "https://moneyshotapi.herokuapp.com/api/createphotos"
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

    takePicture();

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
