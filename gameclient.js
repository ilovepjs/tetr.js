MESSAGE_TYPES = {
    createRoom: 'createRoom',
    joinRoom: 'joinRoom',
    leaveRoom: 'leaveRoom',
    start: 'requestGameStart',
    move: 'move',
    toppedOut: 'toppedOut'
};

//WHY DO I NEED THIS
function GameClient(url, onOpen) {
    this.socket = new WebSocket(url);
    this.socket.onmessage = this.onmessage.bind(this);
    this.socket.onopen = onOpen;
    this.players = [];
}

GameClient.prototype.close = function() {
    this.socket.close();
};

GameClient.prototype.send = function(type, data) {
    console.log('out --> ' + type)

    var msg = JSON.stringify({
        type: type,
        data: data
    });

    this.socket.send(msg);
};

GameClient.prototype.onmessage = function(event) {
    var msg = JSON.parse(event.data);
    var data = msg.data;
    var type = msg.type;
    console.log(type, data);
    switch(type) {
        case "gameStarted":
            MULTIPLAYER_GAME_SEED = '1834645441';
            //MULTIPLAYER_GAME_SEED = data.seed;
            init(2)
            break;
        case "roomCreated":
            handleRoomCreated(data.roomID)
            this.addPlayer(data.playerID)
            break;
        case "addLines":
            addLines(data.lines)
            break;
        case "playerDead":
            playerID = data.playerID;
            board = data.board
            break;
        case "gameOver":
            winnerID = data.winner;
            break;
        case "playerJoin":
            this.addPlayer(data.playerID);
            break;
        case "playerLeave":
            this.removePlayer(data.playerID);
            break;
        case "roomDigest":
            var players = data.players;
            for (var i = 0; i < players.length; i++) {
                this.addPlayer(players[i].playerID);
            }
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

GameClient.prototype.move = function(rotation, position) {
    type = MESSAGE_TYPES.move;
    data = {
        rotation: rotation,
        position: position
    };
    this.send(type, data);
};

GameClient.prototype.toppedOut = function() {
    this.send(MESSAGE_TYPES.toppedOut, {});
}

GameClient.prototype.removePlayer = function(playerID) {
    playerIndex = this.players.indexOf(playerID);
    if (playerIndex != -1) {
        handlePlayerLeave(playerID);
        this.players.splice(playerIndex, 1);
    }
}

GameClient.prototype.addPlayer = function(playerID) {
    playerIndex = this.players.indexOf(playerID);
    if (playerIndex == -1) {
        this.players.push(playerID);
        handlePlayerJoin(playerID);
    }
}

//go back to sprint after multiplayer (multipalyer = false)
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
// show server down message if server down
// can start a new game on finished if host
// remove retry and pause option during a game controlled by the server
//fix race condition no press button before connected to websocket
