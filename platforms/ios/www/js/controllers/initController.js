angular.module('initLoad', [])
.controller( 'initCtrl', initCtrl )

initCtrl.$inject = ['$state', '$http', '$timeout', '$cordovaStatusbar'];

function initCtrl($state, $http, $timeout, $cordovaStatusbar) {
	var vm = this;

	function getToken(){
		if(window.localStorage.webToken && window.localStorage.webToken.length > 2){
			 return window.localStorage.webToken;
		}
		else {
			return false;
		}
	}
	vm.toke = getToken();
	console.log(vm.toke);

	vm.signin = function() {
		console.log('Click')
		$state.go( 'signin' )
	}

	vm.camera = function() {
		console.log('Clicky');
		$state.go( 'tab.camera' );
	}

	function checkToken() {
		if(vm.toke === false){
			vm.signin();
		}
		else {
			vm.camera();
		}
	}

	function initPage(){
		if( /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
			document.addEventListener("deviceready", function(){
				$timeout(function(){
					checkToken();
				}, 4000);
			}, false);
		}
		else {
			$timeout(function(){
				checkToken();
			}, 4000);
		}
	}
	initPage();
}
