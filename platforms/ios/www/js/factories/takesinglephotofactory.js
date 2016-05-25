angular.module('singlePhotoFactory', ['ngFileUpload'])

  .factory('singlePhoto', singlePhoto);

  singlePhoto.$inject = ['$http', 'Upload'];

  function singlePhoto($http, Upload){

    function uploadPhoto(photoFile){

    }
    return uploadPhoto
  }
