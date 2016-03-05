angular.module('userPhotosFactory', [])

  .factory('userPhotos', userPhotos);

  userPhotos.$inject = ["$http"];

  function userPhotos($http){

    function getPhotos(userId){
      return $http({
        method: "GET"
        ,url: "https://moneyshotapi.herokuapp.com/api/usersubmissions/"+userId
      })
    }
    return getPhotos;
  }
