angular.module('allPhotosFactory', [])

  .factory('allPhotosFac', allPhotosFac);

  allPhotosFac.$inject = ['$http'];

  function allPhotosFac($http){


    function allPhotos(){
      return $http({
              method: 'GET'
              ,url: "http://45.55.24.234:5555/api/test"
            })
    }

    return allPhotos;

  }
