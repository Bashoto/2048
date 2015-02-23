window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function _uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function LocalStorageManager() {
  this.bestScoreKey     = "bestScore";
  this.gameStateKey     = "gameState";
  this.noticeClosedKey  = "noticeClosed";

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
  this.storage.setItem('player', _uuid());

  this.bashoto = new Bashoto("135f4565-c1e2-4d4d-bb77-d187f4067917")
  this.leaderboard = this._setLeaderboard();
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";
  var storage = window.localStorage;

  try {
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Local score getters/setters
LocalStorageManager.prototype.getNearbyScore = function (cb) {
  this.leaderboard.pull(function (scores) {
    console.log(scores);
    if (scores.local && scores.local.length > 0) {
      cb(scores.local[0].score);
    }
  });
}

LocalStorageManager.prototype.addNearbyScore = function (score) {
  this.leaderboard.push({ 
    player: this.storage.getItem('player'), 
    score: score 
  });
}

LocalStorageManager.prototype.locate = function (cb) {
  var manager = this;
  manager.bashoto.locate({
    success: function() {
      manager._setLeaderboard();
      cb();
    }
  });
}

LocalStorageManager.prototype._setLeaderboard = function () {
  this.leaderboard = this.bashoto.leaderboard({ board: '2048' });
  return this.leaderboard;
}

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.storage.setItem(this.bestScoreKey, score);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
};

LocalStorageManager.prototype.setNoticeClosed = function (noticeClosed) {
  this.storage.setItem(this.noticeClosedKey, JSON.stringify(noticeClosed));
};

LocalStorageManager.prototype.getNoticeClosed = function () {
  return JSON.parse(this.storage.getItem(this.noticeClosedKey) || "false");
};
