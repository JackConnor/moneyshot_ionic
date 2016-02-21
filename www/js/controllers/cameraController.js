angular.module('cameraController', [])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'Camera'];
  function cameraCtrl($http, $scope, Camera){
    var self = $scope;
    console.log('yoyoyyoyo');
    Camera.getPicture()
      .then(function(imageUrl){
        console.log(imageUrl);
      })
  }
