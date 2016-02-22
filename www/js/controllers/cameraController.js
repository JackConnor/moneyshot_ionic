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
        console.log(callbackImage.url);
        // $scope.newPhoto = callbackImage.secure_url;
        $('.testPhoto').attr('src', callbackImage.secure_url);
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


  // {
  //   "responseCode":200,
  //   "headers":
  //     {"Access-Control-Allow-Origin":"*","Content-Type":"application/json; charset=utf-8","X-Powered-By":"Express","Connection":"keep-alive","Date":"Mon, 22 Feb 2016 23:10:11 GMT","Content-Length":"545","Etag":"W/\"221-h9plcAy/Mv8nhhxJxtovOQ\""},
  //   "response":
  //     "{\"public_id\":\"lmqurdsaktfcrlpvfulg\",\"version\":1456182610,\"signature\":\"ca063b29edf07c25812a39c21a067f0475356f22\",\"width\":266,\"height\":266,\"format\":\"jpg\",\"resource_type\":\"image\",\"created_at\":\"2016-02-22T23:10:10Z\",\"tags\":[],\"bytes\":26216,\"type\":\"upload\",\"etag\":\"d287e75aac034128df0803c96f7ef443\",\"url\":\"http://res.cloudinary.com/drjseeoep/image/upload/v1456182610/lmqurdsaktfcrlpvfulg.jpg\",\"secure_url\":\"https://res.cloudinary.com/drjseeoep/image/upload/v1456182610/lmqurdsaktfcrlpvfulg.jpg\",\"original_filename\":\"927605dc4ec6bf01a394640898ff01f7\"}","bytesSent":26963}
