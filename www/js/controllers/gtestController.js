(function(ang) {
	ang.module('testing', [])
	.controller( 'testCtrl', testCtrl )

	testCtrl.$inject = ['$state', '$http'];

	function testCtrl($state, $http) {
		var vm = this;
		vm.poop = 'this works'

		vm.signin = function() {
			console.log('CLick')
			$state.go( 'signin' )
		}

		vm.camera = function() {
			console.log('Clicky')
			$state.go( 'tab.camera' )
		}

		function checkToken(token) {
			$http({
				method: 'GET',
				url: 'http://localhost:5555/checkToken'
			})
			.then(function(data){
				console.log('Back', data)
				setTimeout( vm.camera, 1500 )
			})
		}

		function checkLocal() {
			var token = localStorage.webToken
				token ? checkToken(token) : setTimeout( vm.signin, 1500 )
		}

		checkLocal()

	}
})(angular);