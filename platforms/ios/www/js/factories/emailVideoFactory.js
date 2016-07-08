angular.module('emailVideoFactory', [])

  .factory('emailThisVideo', emailThisVideo);

  emailThisVideo.$inject = ['$http'];

  function emailThisVideo($http){

    function sendVideo(email, videoUrl){
      return $http({
        url: 'http://45.55.24.234:5555/api/email/video'
        ,method: "POST"
        ,data: {email: email, videoUrl: videoUrl}
      })
    }
    return sendVideo;
  }
