function HighscoreManager() {
	var self = this;
	
	self.leaderBoardoptions = { // all of these are optional
	  cumulative: false, // Optional, if set to true grabs the sum of all scores for each player
	  best: false, // Optional, if set to true grabs the best score from each player
	  limit: 10, // Optional, how many scores to show (0 for all). Default is 10
	  self: false, // Optional, Boolean if set to true shows just the scores of the player viewing
	  friends: false, // Optional, Boolean if set to true shows just the scores of the player viewing AND their Clay.io friends
	}; 

	Clay.ready(function(){
		console.log('Clay ready');
	  	self.leaderboard = new Clay.Leaderboard( { id: 3685 } ); // The 3685 signifies the leaderboard ID.  
	});

	HighscoreManager.prototype.getLeaderboard = function(){
		return self.leaderboard;
	};	

	HighscoreManager.prototype.getHighScore = function(){
		var deferred = Q.defer();
		if(self.leaderboard){
			self.leaderboard.show(self.leaderBoardoptions, function(response){
		    	deferred.resolve(response.data);	 
		  	}); 			
		}
		else {
			deferred.reject(new Error('No leaderboard found'));
		}

		return deferred.promise; 
	};

	HighscoreManager.prototype.submitHighscore = function(score, name){
		var deferred = Q.defer();
		if(self.leaderboard){
			var options = {
			    score: score,
			    name: name,
			    hideUI: true
			}
			  
			self.leaderboard.post(options, function(response) {
				deferred.resolve(response.data);
			});			
		}
		else {
			deferred.reject(new Error('Failed to submit score'));
		}

		return deferred.promise; 	
	}
}