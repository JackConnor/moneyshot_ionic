angular.module('decodeTokenFactory', [])

  .factory('decodeToken', decodeToken);

  decodeToken.$inject = ["$http"];

  function decodeToken($http){
    function getDecode(token){
      return $http({
        method: "GET"
        ,url: "https://moneyshotapi.herokuapp.com/api/decodetoken/"+token
      })
    }
    return getDecode;
  }
