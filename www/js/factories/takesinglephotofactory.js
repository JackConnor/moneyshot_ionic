angular.module('singlePhotoFactory', ['ngFileUpload'])

  .factory('singlePhoto', singlePhoto);

  singlePhoto.$inject = ['$http', 'Upload'];

  function singlePhoto($http, Upload){
    console.log(Upload);
    console.log('yoyoyo');
    function uploadPhoto(photoFile){
      return $http({
        method: "POST"
        ,url: "http://192.168.0.11:5555/api/newimage"
        ,data: photoFile
      })
    }
    return uploadPhoto
  }
