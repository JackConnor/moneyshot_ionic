angular.module('cameraController', ['singlePhotoFactory'])

  .controller('cameraCtrl', cameraCtrl);

  cameraCtrl.$inject = ['$http', '$scope', 'singlePhoto'];
  function cameraCtrl($http, $scope, singlePhoto){
    var self = $scope;
    console.log(singlePhoto);
    console.log('yoyoyyoyo');
    function testApi(){
      $http({
        method: "GET"
        ,url: "http://192.168.0.11:5555/api/test"
      })
      .then(function(data){
        console.log(data.data);
        console.log(data);
      })
    }
    testApi();

    ///////////////////////////////////
    /////functions to upload photos////
    navigator.camera.getPicture(function(result){
      console.log(result);
      singlePhoto(result)
      .then(function(response){
        console.log(response);
      })
    })

    //////////////end upload photos////
    ///////////////////////////////////
  }
