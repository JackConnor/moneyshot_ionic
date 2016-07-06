angular.module('userInfoFactory', [])

  .factory('userInfo', userInfo);

  userInfo.$inject = ["$http"];

  function userInfo($http){
    var userInfoCache;
    console.log(userInfoCache);
    console.log('fired');

    var promise = function(token){
                    return $http({
                      method: "GET"
                      ,url: 'http://moneyshotapi.herokuapp.com/api/get/userinfo/'+token
                    })
                  }

    function getUserInfo(token, httpBool, mediaData){
      if(httpBool === true){
        promise(token)
        .then(function(user){
          userInfoCache = user.data;
          userInfoCache.submissions = userInfoCache.submissions.reverse();
          return userInfoCache
        })
        .catch(function(err){
          console.log(err);
          return err
        })
      }
      else {
        console.log(mediaData);
        mediaData.submissions = mediaData.submissions.reverse();
        userInfoCache = mediaData;
        console.log(userInfoCache);

      }
    }

    function cacheOnly(){
      return userInfoCache;
    }

    return {
      userInfoFunc: getUserInfo
      ,promiseOnly: promise
      ,cacheOnly: cacheOnly
    }
  }
