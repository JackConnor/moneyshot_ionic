angular.module('signupFactory', [])

  .factory('signup', signup);

  signup.$inject = ["$http"];

  function signup($http){
    function signingUp(email, password){
      console.log(email, password);
      return $http({
          method: "POST"
          ,url: "http://localhost:5555/api/signup"
          ,data: {email: email, password: password}
        })
    }
    return signingUp;
  }
