angular.module('cameraController', ['singlePhotoFactory', 'ngFileUpload'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'singlePhoto', 'Upload', '$q', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer'];
  function cameraCtrl($http, $scope, singlePhoto, Upload, $q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer){
    console.log($cordovaFileTransfer);
    var self = $scope;
    $scope.testing2 = 'gregory'
    $scope.testFile;
    console.log(singlePhoto);
    console.log('yoyoyyoyo');
    function testApi(){
      $http({
        method: "GET"
        ,url: "http://192.168.0.11:5555/api/test"
      })
      .then(function(data){
        // console.log(data.data);
        // console.log(data);
      })
    }
    testApi();
    var options = {
        quality : 80,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : Camera.PictureSourceType.Camera ,
        allowEdit : true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 266,
        targetHeight: 266,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
    };
    $cordovaCamera.getPicture(options)
    .then(function(result){
      console.log(result);
      $cordovaFileTransfer.upload('http://192.168.0.11:5555/api/newimage', result, {})
      .then(function(callbackImage){
        console.log('in the callback');
        console.log(callbackImage);
      })
    })
    ///////////////////////////////////
    /////functions to upload photos////



    function browserTest(){
      console.log($scope.testFile);
      console.log($('#uploadedFile')[0].files[0]);
      var fileTest = $('#uploadedFile')[0].files[0];
      console.log();
      Upload.upload({
        url: "http://192.168.0.11:5555/api/newimage"
        ,data: {file: fileTest, testObj: "yoyoyoyo"}
      })
      .then(function(resultssss){
        console.log(resultssss);
      })
    }
    $('.submitFile').on('click', browserTest)

    //////////////end upload photos////
    ///////////////////////////////////
  }
