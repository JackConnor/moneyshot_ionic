angular.module('cameraController', [])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http'];
  function cameraCtrl($http){
    var self = this;

    console.log('camera baby');
  }
