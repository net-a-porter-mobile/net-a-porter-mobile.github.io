function HTMLActuator() {
  this.currentBackground = 1;

  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.highscoreContainer = document.querySelector(".highscore-container");
  this.submitContainer = document.querySelector(".submit-container");

  this.tileLinks = {
    2: {
     name: 'Slides',
     link: 'http://www.net-a-porter.com/Shop/Shoes/Sandals?cm_sp=topnav-_-shoes-_-sandals&level3Filter=Slides&pn=1&npp=60&image_view=product&dScroll=0&sizeScheme=IT'
    },
    4: {
     name: 'Simple Sandals',
     link: 'http://www.net-a-porter.com/Shop/List/Simple_Sandal?cm_sp=topnav-_-shoes-_-simplesandals&level3Filter=&pn=1&npp=60&image_view=product&dScroll=0'
    },
    8: {
     name: 'Fabulous Flats',
     link: 'http://www.net-a-porter.com/Shop/List/Fabulous_Flats?cm_sp=topnav-_-shoes-_-fabulousflats&level3Filter=&pn=1&npp=60&image_view=product&dScroll=0'
    },
    16: {
     name: 'Fashion Runner',
     link: 'http://www.net-a-porter.com/Shop/List/Fashion_Runners?cm_sp=topnav-_-shoes-_-fashionrunner&level3Filter=&pn=1&npp=60&image_view=product&dScroll=0'
    },
    32: {
     name: 'Ankle Boots',
     link: 'http://www.net-a-porter.com/Shop/Shoes/Boots?image_view=product&level3Filter=Ankle_Boots&pn=1&npp=60&dScroll=0&sizeScheme=IT'
    },
    64: {
     name: 'Midi Heels',
     link: 'http://www.net-a-porter.com/Shop/List/Midi_Heels?cm_sp=topnav-_-shoes-_-midiheels&level3Filter=&pn=1&npp=60&image_view=product&dScroll=0'
    },
    128: {
     name: 'Leopard',
     link: 'http://www.net-a-porter.com/Shop/Search/Leopard/Shoes'
    },
    256: {
     name: 'Metallic',
     link: 'http://www.net-a-porter.com/Shop/Search/Metallic/Shoes'
    },
    512: {
     name: 'High Heel',
     link: 'http://www.net-a-porter.com/Shop/Shoes/Sandals?level3Filter=High_Heel&pn=1&npp=60&image_view=product&dScroll=0&sizeScheme=IT'
    },
    1024 : {
     name: 'Gold',
     link: 'http://www.net-a-porter.com/Shop/Search/gold/Shoes'
    },
    2048: {
     name: 'Editor\'s Picks',
     link: 'http://www.net-a-porter.com/Shop/List/The_Shoe_Edit?cm_sp=topnav-_-shoes-_-editorspicks&level3Filter=&pn=1&npp=60&image_view=product&dScroll=0'
    },
    4096: {
     name: 'FENDI - Iridia suede and PVC sandals',
     link: 'http://www.net-a-porter.com/product/429927/Fendi/iridia-suede-and-pvc-sandals'
    },
    8192: {
     name: 'ALAÏA - Studded lace-up leather sandals',
     link: 'http://www.net-a-porter.com/product/411622/Alaia/studded-lace-up-leather-sandals'
    }
  } 
  this.score = 0;
}

HTMLActuator.prototype.addRandomBodyClass = function(max){
  var newBgInt = (Math.floor(Math.random() * (max - 1 + 1)) + 1);

  while(this.currentBackground === newBgInt){
    newBgInt = (Math.floor(Math.random() * (max - 1 + 1)) + 1);
  }    

  this.currentBackground = newBgInt;
  document.body.className = 'background-' + this.currentBackground;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);

    if (metadata.terminated) {
      self.submitContainer.classList.remove('is-hidden');
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

HTMLActuator.prototype.highscoreSubmitted = function(success){
  if(success){
    this.submitContainer.classList.add('is-hidden');
    this.updateMessage('Thank You!');
  }
}

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.addRandomBodyClass(5);
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 8192) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = '<a href="' + self.tileLinks[tile.value]['link'] + '" target="_blank">' + tile.value + '</a>';

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScores, newHighScore) {
  var self = this;
  this.bestContainer.textContent = bestScores[0].score;
  var highscoreList = '',
      newHighScoreClass = '';
  for (var i = 0; i < bestScores.length; i++) {
    if(newHighScore.name == bestScores[i].name && newHighScore.score == bestScores[i].score) newHighScoreClass = 'is-new-player';
    highscoreList += '<li class="' + newHighScoreClass + '"><span class="highscore-name">' + (i + 1) + '. ' + bestScores[i].name + '</span> <span class="highscore-points">' + bestScores[i].score + '</span></li>';
    newHighScoreClass = '';
  };

  this.highscoreContainer.getElementsByTagName("ol")[0].innerHTML = highscoreList;
  this.highscoreContainer.classList.remove('loading');
  window.setTimeout(function(){
    var newPlayerListEl = self.highscoreContainer.getElementsByClassName("is-new-player")[0];
    if(newPlayerListEl) newPlayerListEl.classList.remove('is-new-player');
  }, 1000)
};

HTMLActuator.prototype.updateMessage = function (message) {
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
