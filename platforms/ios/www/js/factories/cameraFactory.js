angular.module('cameraFactory', [])

  .factory('cameraFac', cameraFac);

  cameraFac.$inject = [];

  function cameraFac(){
    var self = this;
    self.friendlyMessage = 'halllo'

    //////function to launch picture taken handler
    // var isReady = ionic.Platform.isReady;
    // if(isReady){
    self.returnPictureFunction = function(photoResult){
      console.log(result);
    }
    ionic.Platform.ready(function(){
      // alert('setting plugins')
      // self.pictureHandler = cordova.plugins.camerapreview.setOnPictureTakenHandler(self.returnPictureFunction);

      self.startCamera = cordova.plugins.camerapreview.startCamera;
    })

    return self;

  }
