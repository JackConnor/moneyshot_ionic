angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer'];
  function cameraCtrl($http, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile,
    ///////////////////////////////////
    /////functions to upload photos////
    $cordovaFileTransfer){
      $scope.testImg =  "https://res.cloudinary.com/drjseeoep/image/upload/v1456184597/syqevxdxykanrgrda27b.jpg";
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
        $cordovaFileTransfer.upload('http://192.168.0.11:5555/api/newimage', result, {})
        .then(function(callbackImage){
          console.log('in the callback');
          console.log(callbackImage);
          console.log("_--------------------");
          $http({
            method: "GET"
            ,url: "http://192.168.0.11:5555/api/all/photos"
          })
          .then(function(photos){
            console.log('in the callback');
            console.log(photos);
            var allPhotos = photos.data.reverse();
            var allUrls = [];
            for (var i = 0; i < allPhotos.length; i++) {
              allUrls.push(allPhotos[i].url);
              console.log(allUrls);
            }
          })
          // $scope.imageSrc = callbackImage.response;
        })
      })

      // function browserTest(){
      //   console.log($scope.testFile);
      //   console.log($('#uploadedFile')[0].files[0]);
      //   var fileTest = $('#uploadedFile')[0].files[0];
      //   console.log();
      //   Upload.upload({
      //     url: "http://192.168.0.11:5555/api/newimage"
      //     ,data: {file: fileTest, testObj: "yoyoyoyo"}
      //   })
      //   .then(function(resultssss){
      //     console.log(resultssss);
      //   })
      // }
      // $('.submitFile').on('click', browserTest)

    //////////////end upload photos////
    ///////////////////////////////////
  }
