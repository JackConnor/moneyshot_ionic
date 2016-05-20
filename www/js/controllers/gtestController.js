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
				url: 'https://moneyshotapi.herokuapp.com/checkToken'
			})
			.then(function(data){
				alert('Back', data)
				vm.camera()
			})
			// vm.camera();
		}

		function checkLocal() {
			var token = localStorage.webToken
			console.log(token);
				token ? checkToken(token) : vm.signin()
		}

		checkLocal()

	}
})(angular);
