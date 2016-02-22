angular.module('singlePhotoFactory', ['ngFileUpload'])

  .factory('singlePhoto', singlePhoto);

  singlePhoto.$inject = ['$http', 'Upload'];

  function singlePhoto($http, Upload){
    console.log(Upload);
    console.log('yoyoyo');
    function uploadPhoto(photoFile){
      return $http({
        method: "POST"
        ,url: "http://localhost:5555/api/newimage"
        ,data: {file: photoFile, info: "we doing it?"}
      })
    }
    return uploadPhoto
  }
