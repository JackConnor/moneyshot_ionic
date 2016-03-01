angular.module('userPhotosFactory', [])

  .factory('userPhotos', userPhotos);

  userPhotos.$inject = ["$http"];

  function userPhotos($http){

    function getPhotos(userId){
      return $http({
        method: "GET"
        ,url: "http://192.168.0.3:5555/api/userphoto/"+userId
      })
    }
    return getPhotos;
  }
