angular.module('initLoad', [])
.controller( 'initCtrl', initCtrl )

initCtrl.$inject = ['$state', '$http', '$timeout'];

function initCtrl($state, $http, $timeout) {
	var vm = this;

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
			// alert('camera')
			// $state.go( 'tab.camera' );
		}
	}

	document.addEventListener("deviceready", function(){
		console.log('yo yo 1');
		$timeout(function(){
			if( /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
				var token = window.localStorage.webToken;
				checkToken(token);
				console.log('yo yo 1');
			}
			// else {
			// 	var token = window.localStorage.webToken;
			// 	checkToken();
			// }
		}, 100);
	});
}
