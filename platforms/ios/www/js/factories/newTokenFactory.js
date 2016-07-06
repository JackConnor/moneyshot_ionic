angular.module('newTokenFactory', [])

  .factory('newToken', newToken);

  newToken.$inject = ["$http"];

  function newToken($http){

    function getToken(userId){
      console.log(userId);
      return $http({
        method: "POST"
        ,url: "http://moneyshotapi.herokuapp.com/api/gettoken"
        ,data: {userId: userId}
      })
    }
    return getToken;
  }
