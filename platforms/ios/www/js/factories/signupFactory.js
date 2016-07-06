angular.module('signupFactory', [])

  .factory('signup', signup);

  signup.$inject = ["$http"];

  function signup($http){

    function signingUp(email, password){
      return $http({
          method: "POST"
          ,url: "http://192.168.0.10:5555/api/signup"
          ,data: {email: email.toLowerCase(), password: password}
        })
    }

    return signingUp;
  }
