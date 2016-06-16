angular.module('userInfoFactory', [])

  .factory('userInfo', userInfo);

  userInfo.$inject = ["$http"];

  function userInfo($http){
    var userInfo = {}

    function getUserInfo(token){
      $http({
        method: "POST"
        ,url: 'http://192.168.0.5:5555/api/get/userinfo'
        ,body: {token: token}
      })
      .then(function(user){
        console.log(userInfo);
        userInfo = user.data;
      })
    }

    return {
      userInfoFunc: getUserInfo
      ,getUserInfo: userInfo
    }
  }
