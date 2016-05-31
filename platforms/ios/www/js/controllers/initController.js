(function(ang) {
	ang.module('initLoad', [])
	.controller( 'initCtrl', initCtrl )

	initCtrl.$inject = ['$state', '$http'];

	function initCtrl($state, $http) {
		var vm = this;

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
			// var token = localStorage.webToken
			// console.log(token);
			// 	token ? checkToken(token) : vm.signin()
			checkToken();
		}

		document.addEventListener("deviceready", function(){
			checkLocal();
		}, false);

	}
})(angular);
