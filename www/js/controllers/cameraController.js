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
    // navigator.camera.getPicture(function(imageURI){
    //   console.log(imageURI);
    //   var options = {}
    //   $cordovaFileTransfer.upload('http://localhost:5555/api/newimage', imageURI, options)
    //   .then(function(uploadResult){
    //     console.log(uploadResult);
    //   })
    // })
    // Camera.getPicture()
    //   .then(function(imageUrl){
    //     console.log(imageUrl);
    //   })
  }
