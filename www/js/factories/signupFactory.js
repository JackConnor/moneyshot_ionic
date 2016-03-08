angular.module('signupFactory', [])

  .factory('signup', signup);

  signup.$inject = ["$http"];

  function signup($http){

    function signingUp(email, password){
      return $http({
          method: "POST"
          ,url: "https://moneyshotapi.herokuapp.com/api/signup"
          ,data: {email: email, password: password}
        })
    }

    return signingUp;
  }
