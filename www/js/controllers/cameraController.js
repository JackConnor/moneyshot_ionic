angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload', 'ngCordova', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$state', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', 'signup', 'signin', 'newToken', '$cordovaCapture', 'Upload'];
  function cameraCtrl($http, $state, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, signup, signin, newToken, $cordovaCapture){

    ////////////////////////////
    /////////global variables///
    var sessionSet = [];
    console.log(Upload);
    //////testing cloudinary direct upload
    //
    // $.cloudinary.config({ cloud_name: 'drjseeoep', api_key: '632163526492235'})
    //
    // console.log($.cloudinary);
    // console.log($.cloudinary);
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
      console.log('opening camera');
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
      };
      $cordovaCamera.getPicture({})
      .then(function(result){
        $cordovaFileTransfer.upload('http://192.168.0.4:5555/api/newimage', result, options)
        .then(function(callbackImage){
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
              // takePicture();
            })
          })
        })
      })
    }
    $scope.takePicture = takePicture;
    // takePicture();
    function getPic(){
      console.log('video baby');
      $cordovaCapture.captureVideo({})
      .then(function(result){
        console.log(result[0].fullPath);
        var pathFull = result[0].fullPath;
        console.log('again again again');
        console.log(pathFull);
        console.log(JSON.stringify(pathFull));
        // $http({
        //   method: "POST"
        //   ,url: 'http://192.168.0.4:5555/api/upload/video'
        //   ,data: {file: pathFull}
        // })
        // .then(function(result){
        //   console.log(result);
        // })
        // Upload.upload({
        //   url: 'http://192.168.0.4:5555/api/upload/video'
        //   ,data: {file: pathFull}
        // })
        // .then(function(videoBack){
        //   console.log(videoBack);
        // })


        $cordovaFileTransfer.upload('http://192.168.0.4:5555/api/upload/video', pathFull, {})
        .then(function(callbackImage){
          if(err){console.log(err)}
          console.log('yoyoyyoyoyoyoyoyoyoy');
          console.log(callbackImage);
        })
        //ERROR: Wrong type for parameter "filePath" of FileTransfer.upload: Expected String, but got Array.
      //   $scope.sessionSet.push(result);
      //   console.log('set coming');
      //   console.log($scope.sessionSet);
      //   if(result != null){
      //     getPic();
      //   }
      })
    }
    $scope.getPic = getPic;
    // getPic();

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
