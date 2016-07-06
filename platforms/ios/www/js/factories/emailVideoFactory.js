angular.module('emailVideoFactory', [])

  .factory('emailThisVideo', emailThisVideo);

  emailThisVideo.$inject = ['$http'];

  function emailThisVideo($http){

    function sendVideo(email, videoUrl){
      return $http({
        url: 'http://192.168.0.10:5555/api/email/video'
        ,method: "POST"
        ,data: {email: email, videoUrl: videoUrl}
      })
    }
    return sendVideo;
  }
