angular.module('userPhotosFactory', [])

  .factory('userPhotos', userPhotos);

  userPhotos.$inject = ["$http"];

  function userPhotos($http){

    function getPhotos(userId){
      return $http({
        method: "GET"
        ,url: "http://192.168.0.2:5555/api/usersubmissions/"+userId
      })
    }
    return getPhotos;
  }
