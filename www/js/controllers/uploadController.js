angular.module('uploadController', ['allPhotosFactory'])

  .controller('uploadCtrl', uploadCtrl);

  uploadCtrl.$inject = ['$http', 'allPhotosFac'];

  function uploadCtrl($http, allPhotosFac){
    var vm = this;
    console.log('in the upload part');
    allPhotosFac()
    .then(function(allPhotos){
      console.log(allPhotos);
    })
  }
