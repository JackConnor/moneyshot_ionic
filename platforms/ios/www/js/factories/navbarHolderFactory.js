angular.module('navbarHolderFactory', [])

  .factory('navbar', navbar);

  navbar.$inject = [];

  function navbar(){
    var navHtml =
    '<div class="navBar">'+
      '<div class="col-xs-8 col-xs-offset-2 nameTag">'+
        'MoPho<p>get money for your photo</p>'+
      '</div>'+
      '<div class="col-xs-2">'+
        '<button type="button" ng-click="signoutUser">Signout</button>'+
      '</div>'+
    '</div>';

    return {html: navHtml}
  }
