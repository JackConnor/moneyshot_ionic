angular.module('decodeTokenFactory', [])

  .factory('decodeToken', decodeToken);

  decodeToken.$inject = ["$http"];

  function decodeToken($http){
    function getDecode(token){
      return $http({
        method: "GET"
        ,url: "http://45.55.24.234:5555/api/decodetoken/"+token
      })
    }
    return getDecode;
  }
