angular.module('allPhotosFactory', [])

  .factory('allPhotosFac', allPhotosFac);

  allPhotosFac.$inject = ['$http'];

  function allPhotosFac($http){


    function allPhotos(){
      return $http({
              method: 'GET'
              ,url: "http://localhost:5555/api/test"
            })
    }

    return allPhotos;

  }
