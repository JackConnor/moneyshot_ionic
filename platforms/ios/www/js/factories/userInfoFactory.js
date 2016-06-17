angular.module('userInfoFactory', [])

  .factory('userInfo', userInfo);

  userInfo.$inject = ["$http"];

  function userInfo($http){
    var userInfoCache;

    function getUserInfo(token, bool){
      console.log(token);
      // alert(userInfoCache);
      //////if there is a token, we do a lookup
      if(bool === true){
        console.log('getting your submissions and user info');
        $http({
          method: "GET"
          ,url: 'https://moneyshotapi.herokuapp.com/api/get/userinfo/'+token
        })
        .then(function(user){
          console.log(user);
          userInfoCache = user.data;
          userInfoCache.submissions = userInfoCache.submissions.reverse();
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
