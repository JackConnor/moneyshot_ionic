angular.module('cameraController', [])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', '$cordovaFileTransfer', 'Camera'];
  function cameraCtrl($http, $scope, $cordovaFileTransfer, Camera){
    var self = $scope;
    console.log('yoyoyyoyo');
    function testApi(){
      $http({
        method: "GET"
        ,url: "https://moneyshotapi.herokuapp.com/api/test"
      })
      .then(function(data){
        console.log(data.data);
        console.log(data);
      })
    }
    testApi();
    navigator.camera.getPicture(function(imageURI){
      console.log(imageURI);
      var filename =  'testfile';
      var options = {
         fileKey: "file",
         fileName: filename,
         chunkedMode: false,
         mimeType: "image/jpg",
       params : {'directory':'upload', 'fileName':filename} // directory represents remote directory,  fileName represents final remote file name
       };
      $cordovaFileTransfer.upload('https://moneyshotapi.herokuapp.com/api/newimage', imageURI, options, true)
      .then(function(uploadResult){
        console.log(uploadResult);
      })
    })
    // Camera.getPicture()
    //   .then(function(imageUrl){
    //     console.log(imageUrl);
    //   })
  }
