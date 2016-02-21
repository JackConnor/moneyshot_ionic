angular.module('cameraController', [])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', '$cordovaFileTransfer', 'Camera'];
  function cameraCtrl($http, $scope, $cordovaFileTransfer, Camera){
    var self = $scope;
    console.log('yoyoyyoyo');
    navigator.camera.getPicture(function(imageURI){
      console.log(imageURI);
      var options = {}
      $cordovaFileTransfer.upload('http://localhost:5555/api/newimage', imageURI, options, true)
      .then(function(uploadResult){
        console.log(uploadResult);
      })
    })
    // Camera.getPicture()
    //   .then(function(imageUrl){
    //     console.log(imageUrl);
    //   })
  }
