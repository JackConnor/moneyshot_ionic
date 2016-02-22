angular.module('singlePhotoFactory', ['ngFileUpload'])

  .factory('singlePhoto', singlePhoto);

  singlePhoto.$inject = ['$http', 'Upload'];

  function singlePhoto($http, Upload){
    console.log(Upload);
    console.log('yoyoyo');
    function uploadPhoto(photoFile){
      return Upload.upload({
        ,url: "http://192.168.0.11:5555/api/newimage"
        ,data: {file: photoFile, text: "testing this out"}
      })
    }
    return uploadPhoto
  }
