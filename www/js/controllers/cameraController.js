angular.module('cameraController', [])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'Camera'];
  function cameraCtrl($http, $scope, Camera){
    var self = $scope;
    Camera.getPicture()
      .then(function(imageUrl){
        console.log(imageUrl);
      })
  }
