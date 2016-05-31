(function(ang) {
	ang.module('initLoad', [])
	.controller( 'initCtrl', initCtrl )

	initCtrl.$inject = ['$state', '$http'];

	function initCtrl($state, $http) {
		var vm = this;
		console.log(vm);

		vm.signin = function() {
			console.log('CLick')
			$state.go( 'signin' )
		}

		vm.camera = function() {
			console.log('Clicky');
			$state.go( 'tab.camera' );
		}

		function checkToken(token) {
			var toke = window.localStorage.webToken;
			if(toke && toke.length > 3){
				vm.camera();
			}
			else {
				vm.signin();
			}
		}

		function checkLocal() {
			if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
				console.log('device');
				document.addEventListener("deviceready", function(){
					checkToken();
				}, false);
			}
			else {
				checkToken();
			}
		}
		checkLocal();

	}
})(angular);
