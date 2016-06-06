angular.module('initLoad', [])
.controller( 'initCtrl', initCtrl )

initCtrl.$inject = ['$state', '$http', '$timeout', '$cordovaStatusbar'];

function initCtrl($state, $http, $timeout, $cordovaStatusbar) {
	var vm = this;

	vm.signin = function() {
		console.log('CLick')
		$state.go( 'signin' )
	}

	vm.camera = function() {
		console.log('Clicky');
		$state.go( 'tab.camera' );
	}

	function checkToken() {
		if(window.localStorage.webToken){
			var toke = window.localStorage.webToken;
		}
		if(toke && toke.length > 3){
			vm.camera();
		}
		else {
			vm.signin();
		}
	}

	function initPage(){
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			document.addEventListener("deviceready", function(){
				$timeout(function(){
					checkToken();
				}, 1000);
			}, false);
		}
		else {
			$timeout(function(){
				checkToken();
			}, 1000);
		}
	}
	initPage();
}
