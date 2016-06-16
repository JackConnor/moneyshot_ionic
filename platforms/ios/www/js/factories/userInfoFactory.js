angular.module('userInfoFactory', [])

  .factory('userInfo', userInfo);

  userInfo.$inject = ["$http"];

  function userInfo($http){
    var userInfo = {}

    function getUserInfo(token){
      console.log(token);
      $http({
        method: "GET"
        ,url: 'http://192.168.0.5:5555/api/get/userinfo/'+token
      })
      .then(function(user){
        console.log(user);
        userInfo = user.data;
      })
    }

    return {
      userInfoFunc: getUserInfo
      ,getUserInfo: userInfo
    }
  }
