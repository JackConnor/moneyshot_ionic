angular.module("persistentPhotosFactory", [])

  .factory('persistentPhotos', persistentPhotos);

  persistentPhotos.$inject = [];
  function persistentPhotos(){
    var photoCache = [];
    console.log(photoCache);
    return function savePhotos(photosToSave){
      console.log(photosToSave);
      /////photos only come through as a batch from mediaCache
      if(photosToSave && photosToSave !== 'empty'){
        photoCache = photosToSave;
        console.log(photoCache);
      }
      else if (photosToSave === 'empty'){
        console.log('emptying');
        photoCache = [];
        console.log(photoCache);
      }
      else {
        console.log(photoCache);
        return photoCache;
      }
    }

  }
