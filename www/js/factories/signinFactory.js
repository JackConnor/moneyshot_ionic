angular.module('signinFactory', [])

  .factory('signin', signin);

  signin.$inject = ["$http"];

  function signin($http){

    function signingIn(email, password){
      return $http({
        method: "POST"
        ,url: "http://192.168.0.4:5555/api/signin"
        ,data: {email: email, password: password}
      })
    }

    return signingIn;
  }
