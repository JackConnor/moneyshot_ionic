angular.module('userPhotosFactory', [])

  .factory('userPhotos', userPhotos);

  userPhotos.$inject = ["$http"];

  function userPhotos($http){

    function getPhotos(userId){
      return $http({
        method: "GET"
        ,url: "http://45.55.24.234:5555/api/usersubmissions/"+userId
      })
    }
    return getPhotos;
  }
