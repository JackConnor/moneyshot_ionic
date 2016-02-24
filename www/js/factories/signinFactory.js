angular.module('signinFactory', [])

  .factory('signin', signin);

  signin.$inject = ["$http"];

  function signin($http){

    function signingIn(email, password){
      return $http({
        method: "POST"
        ,url: "http://moneyshotapi.herokuapp.com/api/signin"
        ,data: {email: email, password: password}
      })
    }

    return signingIn;
  }
