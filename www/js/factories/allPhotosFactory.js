angular.module('allPhotosFactory', [])

  .factory('allPhotosFac', allPhotosFac);

  allPhotosFac.$inject = ['$http'];

  function allPhotosFac($http){


    function allPhotos(){
      return $http({
              method: 'GET'
              ,url: "http://192.168.0.3:5555/api/test"
            })
    }

    return allPhotos;

  }
