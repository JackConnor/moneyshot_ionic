angular.module('singlePhotoFactory', ['ngFileUpload'])

  .factory('singlePhoto', singlePhoto);

  singlePhoto.$inject = ['$http', 'Upload'];

  function singlePhoto($http, Upload){
    console.log(Upload);
    console.log('yoyoyo');
    function uploadPhoto(photoFile){
      console.log('yooooo');
    }
    return uploadPhoto
  }
