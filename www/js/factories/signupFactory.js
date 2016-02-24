angular.module('signupFactory', [])

  .factory('signup', signup);

  signup.$inject = ["$http"];

  function signup($http){
    function signingUp(email, password){
      return
        $http({
          method: "POST"
          ,url: "/api/signup"
          ,data
        })
    }
    return "function goes here";
  }
