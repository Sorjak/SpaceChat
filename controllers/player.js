
function Player(id, name) {
    this.positionX = 0;
    this.positionY = 0;

    this.currentInput = null;

    this.name = name;
    this.id = id;

    this.room = "";
    this.message = "";

    this.isTraitor = false;


}
// class methods

// export the class
module.exports = Player;