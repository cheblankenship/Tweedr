var app = angular.module('Twitter', ['ui.router', 'ngCookies']);

app.factory("TwitterApi", function factoryFunction($http, $rootScope, $cookies, $state) {
  var service = {};

  if ($cookies.get('token')) {
    $rootScope.loginState = true;
  }

  else if (!$cookies.get('token')) {
    $rootScope.loginState = false;
  }

  $rootScope.logout = function() {
    console.log('Logout');
    $cookies.remove('token');
    $cookies.remove('userId');
    $state.go('home', {}, {reload: true});
    location.reload();
    console.log("check");
  };

  service.getProfile = function(userID) {
    return $http ({
      url: '/profile/' + userID
    });
  };

  service.getWorldtimeline = function() {
    return $http({
      url: '/world/timeline'
    });
  };

  service.getUserInfo = function(userID) {
    return $http ({
      url: '/user_info/' + userID
    });
  };

// get subs!
  service.getSubfriends = function(userID) {
    return $http({
      url: '/subfriends/' + userID
    });
  };

  service.getUserLogin = function(userId, password) {
    return $http ({
      url: '/userLogin/' + userId + '/' + password
    });
  };

  service.userSignup = function(userId, password, website, avatar_url){
    return $http({
      url: '/signup',
      method: 'POST',
      data: {
        _id : userId,
        password: password,
        website: website,
        avatar_url: avatar_url
      }
    });
  };

  service.createTweet = function(userID, text) {
    return $http({
      url: '/tweet/' + userID + '/' + text,
      method: 'POST'
    });
  };

  service.followUser = function(follower, following) {
    return $http({
      url: '/follow',
      method: 'POST',
      data: {
        followerId: follower,
        followingId: following
      }
    });
  };
  return service;
});



app.controller('HomeController', function($scope, $cookies, TwitterApi, $state, $rootScope) {
  if($rootScope.loginState === true){
    $scope.userId = $cookies.get('userId');
    TwitterApi.getProfile($scope.userId).success(function(result) {
      $scope.tweets = result;
    })
    .error(function(err) {
      console.log('Error: ', err.message);
    });

    $scope.tweet = function(text) {
      TwitterApi.createTweet($scope.userId, text).success(function(res) {
        console.log('Tweeted successfully');
      });
      $state.go('home', {}, {reload: true});
    };
  }

  else if($rootScope.loginState === false) {
    TwitterApi.getWorldtimeline().success(function(result) {
      $scope.tweets = result;
      console.log($scope.tweets);
    });
  }


});

app.controller('ProfileController', function($scope, $stateParams, TwitterApi, $cookies, $state, $rootScope) {
  console.log($stateParams.userID);
  if($rootScope.loginState === true){
    $scope.userId = $cookies.get('userId');
    console.log($scope.userId);
    TwitterApi.getProfile($stateParams.userID).success(function(result) {
      $scope.tweets = result;
      console.log($scope.tweets);
    })
    .error(function(err) {
      console.log('Error: ', err.message);
    });

    $scope.tweet = function(text) {
      TwitterApi.createTweet($scope.userId, text).success(function(res) {
        console.log('Tweeted successfully');
      });
    $state.go('home', {}, {reload: true});
    };

    $scope.normal = true;
    $scope.showSubfriend = function() {
      TwitterApi.getSubfriends($stateParams.userID).success(function(sub) {
        $scope.normal = false;
        $scope.subfriend = sub;
        console.log($scope.subfriend);
        });
      };
    }

    $scope.follow = function(following) {
      TwitterApi.followUser($cookies.get('userId'),following).success(function(statement) {
        $scope.res = statement;
        console.log($scope.res);
        });
        $state.go('home', {}, {reload: true});
      };
});

app.controller('LoginController', function($scope, $stateParams, $state, $cookies, TwitterApi, $rootScope) {
  $scope.userLogin = function(userId, password){

    TwitterApi.getUserLogin(userId, password).success(function(result) {
      if (result !== null) {
        if (result === 'nope'){
          console.log('Nope');
        }
        else {
          $rootScope.loginState = true;
          $cookies.put('token', result.token);
          $cookies.put('userId', userId);
          $state.go('home', {}, {reload: true});
        }
      }

      else {
        $state.go('home', {}, {reload: true});
      }
    });
  };
});


app.controller('SignupController', function($scope, $stateParams, $state, TwitterApi, $rootScope) {
  if($rootScope.loginState === false) {
    $scope.userSignup = function(userId, password, website, avatar_url) {
      TwitterApi.userSignup(userId, password, website, avatar_url).success(function(result) {
        console.log(result);
      });
      $state.go('login', {}, {reload: true});
    };
  }
});




app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state({
      name: 'profile',
      url: '/profileInfo/{userID}',
      templateUrl: '/templates/profile.html',
      controller: 'ProfileController'
    })
    .state({
      name: 'login',
      url: '/login',
      templateUrl: '/templates/login.html',
      controller: 'LoginController'
    })
    .state({
      name: 'signup',
      url: '/signup',
      templateUrl: '/templates/signup.html',
      controller: 'SignupController'
    })
    .state({
      name: 'home',
      url: '/home',
      templateUrl: '/templates/home.html',
      controller: 'HomeController'
    });
});