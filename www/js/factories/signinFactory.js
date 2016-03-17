angular.module('signinFactory', [])

  .factory('signin', signin);

  signin.$inject = ["$http"];

  function signin($http){

    function signingIn(email, password){
      console.log('email');
      return $http({
        method: "POST"
        ,url: "https://moneyshotapi.herokuapp.com/api/signin"
        ,data: {email: email, password: password}
      })
    }

    return signingIn;
  }
