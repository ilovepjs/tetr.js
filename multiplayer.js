var MAX_PLAYERS = 6;
var MIN_PLAYERS = 2;
var BOARD_HEIGHT = 21;
var BOARD_WIDTH = 10;

var LOSER = "LOSER!";
var WINNER = "WINNER!";

var THIS_PLAYER;

var GAMESERVER_URL = "ws://forthcoming.co:8080/ws";

var numPlayers = 0;
var stacks = {};
var divs = {};
var MULTIPLAYER_GAME_SEED;

var onOpen = function() {
    hash = window.location.hash
    if (hash != '') {
        gameClient.joinRoom(hash.replace('#', ''));
        multiplayer = true;
        menu(CONNECTING_MENU);
        window.document.getElementById('multiplayer-url').innerText = hash;
    }
}
var gameClient = new GameClient(GAMESERVER_URL, onOpen);
var roomID;

var host = false;

var TEMP_LOSE;

//TALKS TO GAMESERVER
function createRoom() {
    gameClient.createRoom();
    menu(CONNECTING_MENU);
}

//FROM GAMESERVER
function handleRoomCreated(roomID) {
    host = true;
    multiplayer = true;

    roomID = roomID;
    window.location.hash = roomID;

    window.document.getElementById('multiplayer-url').innerText = window.document.URL;
}

//TALKS TO GAMESERVER
function joinRoom() {
    if (currentMenu != CONNECTING_MENU) {
        menu(CONNECTING_MENU);
    }
}

//TALKS TO GAMESERVER
function leaveRoom() {
    roomID = '';
    gameClient.leaveRoom(roomID)
    menu(MAIN_MENU);
}

//FROM GAMESERVER
function handlePlayerJoin(playerID) {
    if (currentMenu == CONNECTING_MENU) {
        menu(WAITING_ON_PLAYERS_MENU);

        THIS_PLAYER = playerID;
        divs[playerID] = document.getElementById("b");
        stacks[playerID] = getCurrentPlayerStack();
    } else {
        createStack(playerID);

        //Show start game option to host when 2+ players
        if (numPlayers == 1 && host) {
            showStartGameButton();
        }
    }
    numPlayers ++
    clearStackCtxs();

    window.document.getElementById('room-count').innerText = numPlayers
}

//FROM GAMESERVER
function handlePlayerLeave(playerID) {
    removeStack(playerID);

    numPlayers --;
    clearStackCtxs();

    window.document.getElementById('room-count').innerText = numPlayers
}

//Remove a player's stack when they leave a room
function removeStack(playerID) {
    var div = document.getElementById(playerID);
    div.parentNode.removeChild(div);

    delete divs[playerID];
    delete stacks[playerID];
}

//Draws a player's stack when they enter a room
function createStack(playerID) {
    var div = document.createElement("div");
    div.setAttribute("id", playerID);
    div.setAttribute("class", "b");
    div.setAttribute("data-spritecanvas", "spriteTwo");

    var stackCanvas = document.createElement('canvas');
    stackCanvas.id = "canvas";
    div.appendChild(stackCanvas);

    var msg = document.createElement("p");
    msg.id = "otherMsg";
    msg.setAttribute("class", "otherMsg");
    div.appendChild(msg);

    document.getElementById("content").appendChild(div);
    divs[playerID] = div;

    var stack = new Stack(stackCanvas.getContext("2d"));
    stack.new(10, 22);
    stacks[playerID] = stack;
}

//TALKS TO SERVER
function serverStartGame() {
    gameClient.requestGameStart();
}

//FROM GAMESERVER
function handleStartGame(randomSeed) {
    //TODO: create random bag for players
    TEMP_LOSE = {};
    init(2);
}

function clearStackCtxs() {
    for (var key in divs) {
        var stackCtx = divs[key].getElementsByTagName("canvas")[0].getContext("2d");
        stacks[key].new(10,22);
        clear(stackCtx);
    }
    resizeStackCanvases();
}

function drawStacks() {
    for (var key in stacks) {
        stacks[key].draw(getSpriteCanvas(key));
    }
}

function resizeStackCanvases() {
    var cellSize = getCellSize() - (numPlayers * 4);
    for (var key in divs) {
        var canvas = divs[key].getElementsByTagName("canvas")[0];
        var msg = divs[key].getElementsByTagName("p")[0];

        canvas.cellSize = cellSize;

        canvas.width = cellSize * 10;
        canvas.height = cellSize * 20;
        divs[key].style.width = canvas.width + "px";
        divs[key].style.height = canvas.height + "px";

        makeSprite(canvas.cellSize, spriteCanvasTwo, spriteCtxTwo);

        msg.style.fontSize = ~~(canvas.width / 6) + 'px';
    }
}

//TALKS TO SERVER
function dropPiece(tetro) {
    stacks[THIS_PLAYER].addPiece(tetro, true, getSpriteCanvas(THIS_PLAYER));

    var rotation = piece.pos;
    var position = piece.x - 2;
    console.log(rotation, position);
    gameClient.move(rotation, position);
}

//adds lines to players stacks
function addLines(gap_positions) {
    lines = gap_positions.length
    for (var y = 0; y <= BOARD_HEIGHT - lines; y++) {
        for (var x = 0; x < BOARD_WIDTH; x++) {
            if (stack.grid[x][y + lines] !== undefined) {
                stack.grid[x][y] = stack.grid[x][y + lines];
            }
        }
    }

    for (var y = BOARD_HEIGHT; y > BOARD_HEIGHT - lines; y--) {
        for (var x = 0; x < BOARD_WIDTH; x++) {
            if (x != gap_positions[BOARD_HEIGHT - y]) {
                stack.grid[x][y] = 8;
            } else {
                stack.grid[x][y] = undefined;
            }
        }
    }
    stack.draw(spriteCanvas);
}

function removeCanvases() {
    for (var i = 0; i < divs.length - 1; i++) {
        divs[i].parentNode.removeChild(divs[i]);
    }

    stacks = {};
    divs = [];
}

function endPlayer(id, status) {
    id += "";
    var msg = divs[id].getElementsByTagName("p")[0];

    greyOutStack(stacks[id], getSpriteCanvas(id));
    msg.innerHTML = status;

    TEMP_LOSE[id + ""] = true;

    if (id == THIS_PLAYER) {
        gameState = 9;
    }
}

function end(winner) {
    for (var i = 0; i < numPlayers; i++) {
        if (i == winner) {
            endPlayer(i, WINNER);
        } else {
            endPlayer(i, LOSER);
        }
    }

    setTimeout(function() {
        for (var i = 0; i < numPlayers; i++) {
            var msg = divs[i].getElementsByTagName("p")[0];
            msg.innerHTML = '';
        }
        clearStackCtxs();

        menu(WAITING_ON_PLAYERS_MENU);
    }, 3000);
}

function showStartGameButton() {
    menuDiv = window.document.getElementById('waiting-menu');
    optionsUl = menuDiv.getElementsByTagName('ul').item(0);

    startGameLi = window.document.createElement('li');
    startGameAnchor = window.document.createElement('a');
    startGameAnchor.innerHTML = 'Start Game';
    startGameAnchor.onclick = serverStartGame;
    startGameLi.appendChild(startGameAnchor);
    optionsUl.appendChild(startGameLi);
}

function getSpriteCanvas(i) {
    return document.getElementById(divs[i].dataset.spritecanvas);
}

window.onload = function() {
    roomID = window.location.hash

    if (roomID != '') {
        menu(CONNECTING_MENU);
    }

    spriteCanvasTwo = document.getElementById('spriteTwo');
    spriteCtxTwo = spriteCanvasTwo.getContext('2d');

    window.document.getElementById('room-count').style['visibility'] = 'visible'
    window.document.getElementById('room-count-id').style['visibility'] = 'visible'
}
