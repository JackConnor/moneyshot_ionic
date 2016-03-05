angular.module('allPhotosFactory', [])

  .factory('allPhotosFac', allPhotosFac);

  allPhotosFac.$inject = ['$http'];

  function allPhotosFac($http){


    function allPhotos(){
      return $http({
              method: 'GET'
              ,url: "https://moneyshotapi.herokuapp.com/api/test"
            })
    }

    return allPhotos;

  }
