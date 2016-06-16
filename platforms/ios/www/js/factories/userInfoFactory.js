angular.module('userInfoFactory', [])

  .factory('userInfo', userInfo);

  userInfo.$inject = ["$http"];

  function userInfo($http){
    var userInfoCache = [];

    function getUserInfo(token, bool){
      console.log(token);
      alert(userInfoCache);
      //////if there is a token, we do a lookup
      if(bool === true){
        $http({
          method: "GET"
          ,url: 'http://192.168.0.5:5555/api/get/userinfo/'+token
        })
        .then(function(user){
          console.log(user);
          userInfoCache = user.data;
          console.log(userInfoCache);
          return userInfoCache
        })
      }
      else {
        return userInfoCache;
      }
    }

    return {
      userInfoFunc: getUserInfo
    }
  }
