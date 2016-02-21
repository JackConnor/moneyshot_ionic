angular.module('uploadController', ['allPhotosFactory'])

  .controller('uploadCtrl', uploadCtrl);

  uploadCtrl.$inject = ['$http', '$scope', 'allPhotosFac'];

  function uploadCtrl($http, $scope, allPhotosFac){
    var vm = $scope;
    console.log('in the upload part');
    console.log('he yeaaaa');
    vm.test = 'boom';

    /////function to call and organize all photo urls into an array
    function loadPhotos(){
      allPhotosFac()
      .then(function(allPhotos){
        console.log(allPhotos);
        vm.allPhotos = [];
        for (var i = 0; i < allPhotos.data.length; i++) {
          vm.allPhotos.push(allPhotos.data[i].url);
          console.log(vm.allPhotos);
        }
        console.log(vm.allPhotos);
      })
    }
    loadPhotos();
  }
