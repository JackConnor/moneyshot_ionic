angular.module('decodeTokenFactory', [])

  .factory('decodeToken', decodeToken);

  decodeToken.$inject = ["$http"];

  function decodeToken($http){
    function getDecode(token){
      return $http({
        method: "GET"
        ,url: "http://192.168.0.2:5555/api/decodetoken/"+token
      })
    }
    return getDecode;
  }
