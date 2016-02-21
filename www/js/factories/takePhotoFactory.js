angular.module('Camera', [])

  .factory('Camera', Camera);

  Camera.$inject = ['$q', '$cordovaCamera'];
  function Camera($q, $cordovaCamera){

    return {
      getPicture: function() {
        console.log('yoooooooyoyoyoyoyo');
        var q = $q.defer();
        console.log($cordovaCamera);
        console.log($cordovaCamera.getPicture());
        $cordovaCamera.getPicture(function(result) {
          console.log(result);
          // Do any magic you need
          q.resolve(result);
        }, function(err) {
          q.reject(err);
        });

        return q.promise;
      }
    }

  }
