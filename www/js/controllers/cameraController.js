angular.module('cameraController', [])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'Camera'];
  function cameraCtrl($http, $scope, Camera){
    var self = this;
    console.log(Camera);
    Camera.getPicture()
      .then(function(imageUrl){
        console.log(imageUrl);
      })
    console.log('camera baby');
  }
