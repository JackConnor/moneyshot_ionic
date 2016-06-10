angular.module("persistentPhotosFactory", [])

  .factory('persistentPhotos', persistentPhotos);

  persistentPhotos.$inject = [];
  function persistentPhotos(){
    var photoCache = [];
    console.log(photoCache);
    return function savePhotos(photosToSave, eraseBool){
      console.log(photosToSave);
      /////photos only come through as a batch from mediaCache
      if(photosToSave && photosToSave !== 'empty' && eraseBool === false){
        photoCache.push(photosToSave);
        console.log(photoCache);
      }
      if(photosToSave && photosToSave !== 'empty' && eraseBool === true){
        console.log('erasing');
        console.log(photoCache);
        photoCache.splice(photosToSave, 1);
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
