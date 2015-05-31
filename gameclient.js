MESSAGE_TYPES = {
    createRoom : 'createRoom',
    joinRoom : 'joinRoom',
    leaveRoom : 'leaveRoom',
    start : 'requestGameStart',
    dropPiece : 'dropPiece',
    toppedOut : 'toppedOut'
};

//WHY DO I NEED THIS
function GameClient(url, onOpen) {
    //this.socket = new WebSocket(url);
    //this.socket.onmessage = this.onmessage.bind(this);
    //this.socket.onopen = onOpen;
    this.playerMapping = {}
}

GameClient.prototype.close = function() {
    this.socket.close();
};

GameClient.prototype.send = function(type, data) {
    console.log('out --> ' + type)
    console.log('out --> ' + data)

    msg = JSON.stringify({
        type: type,
        data: data
    });

    //this.socket.send(msg);
};

GameClient.prototype.onmessage = function(event) {
    var msg = JSON.parse(event.data);
    var data = msg.data;
    var type = msg.type;
    console.log(data);
    switch(type) {
        case "gameStart":
            seed = data.seed;
            // init(2)
            break;
        case "roomCreated":
            handleRoomCreated(data.roomID)
            this.addPlayer(data.playerID)
            break;
        case "addLines":
            addLines(data.lines)
            break;
        case "playerDead":
            playerID = this.playerMapping[data.playerID]
            board = data.board
            break;
        case "gameOver":
            winnerID = data.winner;
            break;
        case "playerJoin":
            this.addPlayer(data.playerID);
            break;
        case "playerLeave":
            var player = data.playerID;
            // remove players stack this.playerMapping[player]
            this.removePlayerFromMapping(player);
            break;
    }
};

GameClient.prototype.createRoom = function() {
    this.send(MESSAGE_TYPES.createRoom, {});
};

GameClient.prototype.joinRoom = function(roomID) {
    type = MESSAGE_TYPES.joinRoom;
    data = {roomID: roomID};
    this.send(type, data);
};

GameClient.prototype.leaveRoom = function(roomID) {
    type = MESSAGE_TYPES.leaveRoom;
    data = {roomID: roomID};
    this.send(type, data);
};

GameClient.prototype.requestGameStart = function() {
    this.send(MESSAGE_TYPES.start, {});
};

GameClient.prototype.dropPiece = function(rotation, position) {
    type = MESSAGE_TYPES.dropPiece;
    data = {
        rotation: rotation,
        position: position
    };
    this.send(type, data);
};

GameClient.prototype.toppedOut = function() {
    this.send(MESSAGE_TYPES.toppedOut, {});
}

GameClient.prototype.removePlayerToMapping = function(playerID) {
    delete this.playerMapping[playerID];
}

GameClient.prototype.addPlayer = function(playerID) {
    if (!(playerID in this.playerMapping)) {
        this.playerMapping[playerID] = numPlayers;
        handlePlayerJoin();
    }
}

//stop making it send 40lines for multiplayer
//go back to sprint after multiplayer (multipalyer = false)
//handle numPlayers and for loops for game on joins during a game
//refactor menus
//stop pieces being able to drop on end(-)
//when num drops below 2 start button bye bye
//need to send over player tokens at he beginnging of a game os i can map it to a board id
//convert pieces for internal representation of board
//make rotation and indexes map up
//different way of dropping pieces, if you give me a board theyre all grey, think it'll be cooler to go for straight real time
// and ill figure out a way to represent it internally
// add removeCanvases to clear up at the end of a game
// disable pause on server controlled game
