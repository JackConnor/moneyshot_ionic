angular.module('initLoad', [])
.controller( 'initCtrl', initCtrl )

initCtrl.$inject = ['$state', '$http', '$timeout', '$cordovaStatusbar'];

function initCtrl($state, $http, $timeout, $cordovaStatusbar) {
	var vm = this;


	function checkToken(token) {
		if(token !== 'null' && token !== null && typeof token === 'string'){
			$state.go( 'tab.camera' );
		}
		else {
			$state.go( 'signin' )
		}
	}

	// if( /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
		document.addEventListener("deviceready", function(){
			$timeout(function(){
				var token = window.localStorage.webToken;
				checkToken(token);
			}, 3000);
		})
	// }
	// else {
	// 	var token = window.localStorage.webToken;
	// 	checkToken();
	// }
}
