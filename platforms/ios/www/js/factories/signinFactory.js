angular.module('signinFactory', [])

  .factory('signin', signin);

  signin.$inject = ["$http"];

  function signin($http){

    function signingIn(email, password){
      console.log('email');
      return $http({
        method: "POST"
        ,url: "http://45.55.24.234:5555/api/signin"
        ,data: {email: email.toLowerCase(), password: password}
      })
    }

    return signingIn;
  }
