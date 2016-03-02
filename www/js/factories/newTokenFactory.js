angular.module('newTokenFactory', [])

  .factory('newToken', newToken);

  newToken.$inject = ["$http"];

  function newToken($http){

    function getToken(userId){
      console.log(userId);
      return $http({
        method: "POST"
        ,url: "http://192.168.0.4:5555/api/gettoken"
        ,data: {userId: userId}
      })
    }
    return getToken;
  }
