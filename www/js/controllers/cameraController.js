angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer'];
  function cameraCtrl($http, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer){
    ///////////////////////////////////
    /////functions to upload photos////
      console.log($cordovaFileTransfer);
      console.log(singlePhoto);
      console.log('yoyoyyoyo');
      var options = {
          quality : 80,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.Camera ,
          allowEdit : true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture({})
      .then(function(result){
        console.log(result);
        $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', result, {})
        .then(function(callbackImage){
          console.log('in the callback');
          console.log(callbackImage);
          console.log("_--------------------");

          $http({
            method: "GET"
            ,url: "https://moneyshotapi.herokuapp.com/api/all/photos"
          })
          .then(function(photos){
            console.log('in the callback');
            console.log(photos);
            var allPhotos = photos.data.reverse();
            var allUrls = [];
            for (var i = 0; i < allPhotos.length; i++) {
              allUrls.push(allPhotos[i].url);
            }
            console.log(allUrls);
            // $scope.testImage = allUrls[0];
            $('.testing').attr('src', allUrls[0])
          })
        })
      })

    //////////////end upload photos////
    ///////////////////////////////////
  }
