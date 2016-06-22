angular.module('initLoad', [])
.controller( 'initCtrl', initCtrl )

initCtrl.$inject = ['$state', '$http', '$timeout'];

function initCtrl($state, $http, $timeout) {
	var vm = this;
	// alert('init');

	// if(navigator.splashscreen){
	//   navigator.splashscreen.show();
	// }


	function checkToken(token) {
		// alert(token);
		if(token === undefined || token === 'undefined' || token === 'null' || token === null || token === ''){
			// alert('signin')
			// $state.go( 'signin' )
		}
		else {
			// $timeout(function(){
				// alert('camera')
				// $state.go( 'tab.camera' );
			// }, 2000);
		}
	}

	document.addEventListener("deviceready", function(){
		navigator.splashscreen.hide();
		// alert('in device-ready');
		$timeout(function(){
			// alert('in timeout')
			if( /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
				// console.log('its a device');
				var token = window.localStorage.webToken;
				// alert(token)
				checkToken(token);
				// console.log('yo yo 1');
			}
			// else {
			// 	var token = window.localStorage.webToken;
			// 	checkToken();
			// }
		}, 1000);
	});
}
