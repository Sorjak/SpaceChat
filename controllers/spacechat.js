
function SpaceChat() {
    this.players = [];
    this.traitors = [];
}
// class methods

SpaceChat.prototype.PlayerExists = function(playerName) {
    return this.getPlayerByName(playerName) !== null;
}

SpaceChat.prototype.AddPlayer = function(playerObj) {
    if (this.traitors.length < this.players.length / 4) {
        // not enough traitors
        var ratio = ((this.players.length % 4) + 1) / 4;
        var ran = Math.random();

        if (ran < ratio) {
            playerObj.isTraitor = true;
            this.traitors.push(playerObj);
        }
    }

    this.players.push(playerObj);
};

SpaceChat.prototype.RemovePlayer = function(playerObj) {
    var index = this.players.indexOf(playerObj);
    if (index > -1) {
        this.players.splice(index, 1);
    }
    var t_index = this.traitors.indexOf(playerObj);
    if (t_index > -1) {
        this.traitors.splice(t_index, 1);
    }
};

SpaceChat.prototype.RemoveAllPlayers = function() {
    this.players = [];
    this.traitors = [];
};

SpaceChat.prototype.getPlayerByName = function(playerName) {
    var output = null;
    this.players.forEach(function(player) {
        if (player.name == playerName)
            output = player;
    });

    return output;
}
    

// export the class
module.exports = SpaceChat;