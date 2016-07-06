angular.module('emailVideoFactory', [])

  .factory('emailThisVideo', emailThisVideo);

  emailThisVideo.$inject = ['$http'];

  function emailThisVideo($http){

    function sendVideo(email, videoUrl){
      return $http({
        url: 'https://moneyshotapi.herokuapp.com/api/email/video'
        ,method: "POST"
        ,data: {email: email, videoUrl: videoUrl}
      })
    }
    return sendVideo;
  }
