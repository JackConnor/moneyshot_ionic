angular.module('signinFactory', [])

  .factory('signin', signin);

  signin.$inject = ["$http"];

  function signin($http){

    function signingIn(email, password){
      console.log('email');
      return $http({
        method: "POST"
        ,url: "http://192.168.0.3:5555/api/signin"
        ,data: {email: email, password: password}
      })
    }

    return signingIn;
  }
