angular.module('singlePhotoFactory', ['ngFileUpload'])

  .factory('singlePhoto', singlePhoto);

  singlePhoto.$inject = ['$scope', '$http', 'Upload'];

  function singlePhoto($scope, $http, Upload){
    console.log(Upload);
    console.log('yoyoyo');
    function uploadPhoto(photoFile){
      $scope.file = photoFile
      return $http({
        method: "POST"
        ,url: "http://192.168.0.11:5555/api/newimage"
        ,data: {file: photoFile, text: "testing this out"}
        ,files: [$scope.file]
      })
    }
    return uploadPhoto
  }
