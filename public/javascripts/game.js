const gameSocket = io("/game");

let numPlayers;
let leftPlayerOrder, topPlayerOrder, rightPlayerOrder, bottomPlayerOrder;
let leftPlayer, topPlayer, rightPlayer, bottomPlayer;
let playerNames;
let playersCards;
let currentPlayer;
let turnState;
let observer;

let lastCards = null;

let moon_shot_up_26 = true;

let current_round_number;

let just_loaded = true;

let selectedSingle = false;
let selectedFirst = false;
let selectedSecond = false;
let selectedThird = false;
let selectedSingleCard = "0";
let selectedMultiple = ["0", "0", "0"];
let validPass = false;
let gameOver = false;

let must_pick_2_of_clubs_first = false;
let hearts_must_be_broken = false
let no_points_on_first_trick_lead = true;
let no_points_on_first_trick = false;
let only_show_current_hand_scores_to_observer = true;
let nudge_timeout_seconds = 3000;
let nudge_timeout_value = nudge_timeout_seconds * 1000;


gameSocket.on("SEND ROUND NUMBER", data => {
  current_round_number = data.round_number[0].round_number;
});


gameSocket.on("LOAD PLAYERS", data => {
  playerNames = data.game_players;

  numPlayers = playerNames.length;

  bottomPlayer = null;

  for (let i = 0; i < numPlayers; i++) {
    if (username == playerNames[i].username) {
      bottomPlayerOrder = i;
      break;
    }
  }

  if (bottomPlayerOrder == null) {
    observer = true;
    bottomPlayerOrder = 0;
  } else {
    observer = false;
  }

  if (numPlayers == 4) {
    leftPlayerOrder = (bottomPlayerOrder + 1) % 4;
    topPlayerOrder = (bottomPlayerOrder + 2) % 4;
    rightPlayerOrder = (bottomPlayerOrder + 3) % 4;
  } else {
    topPlayerOrder = (bottomPlayerOrder + 1) % 2;
  }
});

gameSocket.on("SET_LAST_HAND", data => {
  lastCards = data.lastCards;
});


function up26() {
  // set moonshot setting to push everyone else up 26
  moon_shot_up_26 = true;
  gameSocket.emit("MOONSHOT SETTING CHANGE", {
    user_id: user_id,
    game_id: game_id,
    moon_shot_up_26: moon_shot_up_26
  });
  updateGameBoard();
}

function down26() {
  // set moonshot setting to go down 26
  moon_shot_up_26 = false;
  gameSocket.emit("MOONSHOT SETTING CHANGE", {
    user_id: user_id,
    game_id: game_id,
    moon_shot_up_26: moon_shot_up_26
  });
  updateGameBoard();
}

gameSocket.on("UPDATE", data => {
  try {
    clearTimeout(timer);
  } catch (e) {}

  just_loaded = false

  validPass = false;

  topPlayer = data.shared_player_information[topPlayerOrder];
  bottomPlayer = data.shared_player_information[bottomPlayerOrder];

  moon_shot_up_26 = data.shared_player_information[bottomPlayerOrder].moonshot_up26;

  if (numPlayers == 4) {
    leftPlayer = data.shared_player_information[leftPlayerOrder];
    rightPlayer = data.shared_player_information[rightPlayerOrder];
  }

  if (data.current_round_number == null) { gameSocket.emit("GET ROUND NUMBER", { user_id: user_id, game_id: game_id }); }

  if (observer) {
    turnState = "observer";
    if (data.turn_information[0] == null) {
      currentPlayer = null;
    } else {
      currentPlayer = data.turn_information[0].current_player;
    }
  } else if (data.turn_information[0] == null) {
    turnState = "pass";
    currentPlayer = null;
  } else if (data.turn_information[0].current_player == username) {
    turnState = "play";
    currentPlayer = data.turn_information[0].current_player;
  } else {
    turnState = "nudge";
    currentPlayer = data.turn_information[0].current_player;
  }

  selectedFirst = false;
  selectedSecond = false;
  selectedThird = false;
  selectedMultiple = ["0", "0", "0"];
  selectedSingleCard = "0";
  selectedSingle = false;

  if (observer) {
    updateGameBoard();
  } else {
    gameSocket.emit("GET PLAYER HAND", { user_id: user_id, game_id: game_id });
  }
});

gameSocket.on("VALID PASS", data => {
  let { user_id, game_id } = data;
  validPass = true;
  gameSocket.emit("GET PLAYER HAND", { user_id: user_id, game_id: game_id });
});

gameSocket.on("SEND PLAYER HAND", data => {
  playersCards = data.player_hand;

  updateGameBoard();
});

gameSocket.on("GAME OVER", data => {
  gameOver = true;
  const board = document.getElementsByClassName("game-box")[0];

  let scoreHtml =
    '<div class="container" >' +
    '    <div class="modal modal-dialog" id="game_over_window" role="dialog" style="border-radius: 15px; background-color: #086305; padding-left: 0; padding-right: 0;">' +
    '                <div class="modal-header">' +
    "                    <center>" +
    '                        <h4 class="modal-title">Game Over!</h4>' +
    "                    </center>" +
    "                </div>" +
    '                <div class="modal-body" style="color:#086305;background-color: #ffffff;">' +
    '                    <table class="table table-striped table-dark">' +
    "                        <thead>" +
    "                            <tr>" +
    '                                <th scope="col">Player\'s name</th>' +
    '                                <th scope="col">Score</th>' +
    "                            </tr>" +
    "                        </thead>" +
    "                        <tbody>" +
    "                            <tr>" +
    "                                <td>" +
    playerNames[bottomPlayerOrder].username +
    "</td>" +
    "                                <td>" +
    bottomPlayer.total_score +
    "</td>" +
    "                            </tr>" +
    "                            <tr>" +
    "                                <td>" +
    playerNames[topPlayerOrder].username +
    "</td>" +
    "                                <td>" +
    topPlayer.total_score +
    "</td>" +
    "                            </tr>";

  if (numPlayers == 4) {
    scoreHtml +=
      "                            <tr>" +
      "                                <td>" +
      playerNames[leftPlayerOrder].username +
      "</td>" +
      "                            <td>" +
      leftPlayer.total_score +
      "</td>" +
      "                            </tr>" +
      "                            <tr>" +
      "                                <td>" +
      playerNames[rightPlayerOrder].username +
      "</td>" +
      "                            <td>" +
      rightPlayer.total_score +
      "</td>" +
      "                            </tr>";
  }

  scoreHtml +=
    "                        </tbody>" +
    "                    </table>" +
    "                </div>" +
    '                <div class="modal-footer">' +
    '                  <a href="/lobby" style="color:#e9eb89">Return to lobby...</a>';
  "            </div>" + "</div>";

  let div = document.createElement("div");
  div.innerHTML = scoreHtml;

  board.appendChild(div);

  $("#game_over_window").modal();
});

function updateGameBoard() {
  const board = document.getElementsByClassName("game-box")[0];
  let gameHtml = "";
  let z = 1;

  if (current_round_number == null) { gameSocket.emit("GET ROUND NUMBER", { user_id: user_id, game_id: game_id }); }


  gameHtml +=
    '<div class = "top-player-info">' +
    "<p>" +
    playerNames[topPlayerOrder].username +
    "</p>" +
    '<div class = "player-score-box">';
  if (!only_show_current_hand_scores_to_observer || observer) {
    gameHtml +=
    '<p class = "player-round-score">Score this round: ' +
    topPlayer.current_round_score +
    "</p>";
  }
  gameHtml +=
    '<p class = "player-total-score">Total score: ' +
    topPlayer.total_score +
    "</p>" +
    "</div></div>";
  let displacement = 540 - (26 - topPlayer.card_count) * 10;
  for (let i = 0; i < topPlayer.card_count; i++) {
    gameHtml +=
      '<div class= "top-player card-back" style="left: ' +
      displacement +
      "px; z-index: " +
      z +
      ';"></div>';
    z++;
    displacement -= 20;
  }
  if (topPlayer.card_in_play != null) {
    let suit = -Math.floor((topPlayer.card_in_play - 1) / 13) * 100;
    let face = -((topPlayer.card_in_play - 1) % 13) * 69;
    gameHtml +=
      '<div class = "top-player-to-mid card " style="background-position-y: ' +
      suit +
      "px; background-position-x: " +
      face +
      'px" id="' +
      topPlayer.card_in_play +
      '"></div>';
  }
  let   up_26_button = "";
  let down_26_button = "";

  let buttonString = "";
  let moon_shot_button_string = "";
  if (moon_shot_up_26) {
    moon_shot_button_string += '<button class="up26-button   btn btn-primary moonshot_button_selected"    disabled="" id="up26"   onclick="up26()">+26</button>';
    moon_shot_button_string += '<button class="down26-button btn btn-primary moonshot_button_nonselected"             id="down26" onclick="down26()">-26</button>';
  } else {
    moon_shot_button_string += '<button class="up26-button   btn btn-primary moonshot_button_nonselected"             id="up26"   onclick="up26()">+26</button>';
    moon_shot_button_string += '<button class="down26-button btn btn-primary moonshot_button_selected"    disabled="" id="down26" onclick="down26()">-26</button>';
  }
  gameHtml += moon_shot_button_string
  if (validPass) {
    buttonString = "";
    gameHtml +=
      '<button class="game-button btn btn-primary" id="nudge-button" onclick="nudgeButton()">Nudge</button>';
    gameHtml +=
      '<div class = "alert-box"><p>Waiting for other plays to select their cards to pass...</p></div>';
  } else if (turnState == "play") {
    buttonString = 'onclick="selectSingleCard(this.id)"';
    gameHtml +=
      '<button class="game-button btn btn-primary" id="single-button" onclick="playButton()" disabled>Play</button>';
    gameHtml +=
      '<div class = "alert-box"><p>Your turn to play a card.</p></div>';
  } else if (turnState == "pass") {
    buttonString = 'onclick="selectMultipleCard(this.id)"';
    let pass_direction = "unknown";
    if (just_loaded && current_round_number == undefined) { pass_direction = "left"; }
    if (current_round_number % 3 == 1) { pass_direction = "left"; }
    if (current_round_number % 3 == 2) { pass_direction = "across"; }
    if (current_round_number % 3 == 0) { pass_direction = "right"; }
    gameHtml += '<button class="game-button btn btn-primary " id="multiple-button" onclick="passButton()" disabled>Pass ' + pass_direction + '</button>';
    gameHtml += '<div class = "alert-box"><p>Select three cards to pass.</p></div>';
  } else if (!observer) {
    buttonString = "";
    gameHtml +=
      '<button class="game-button btn btn-primary" id="nudge-button" onclick="nudgeButton()">Nudge</button>';
    gameHtml +=
      '<div class = "alert-box"><p>' +
      currentPlayer +
      "'s turn to play a card.</p></div>";
  } else {
    gameHtml +=
      '<div class = "alert-box"><p>' +
      currentPlayer +
      "'s turn to play a card.</p></div>";
    gameHtml += '<div class = "alert-box"></div>';
  }

  gameHtml +=
    '<div class = "player-info">' +
    '<div class = "player-score-box">';
  if (!only_show_current_hand_scores_to_observer || observer) {
    gameHtml +=
    '<p class = "player-round-score">Score this round: ' +
    bottomPlayer.current_round_score +
    "</p>";
  }
  gameHtml +=
    '<p class = "player-total-score">Total score: ' +
    bottomPlayer.total_score +
    "</p>" +
    "</div>" +
    "<p>" +
    playerNames[bottomPlayerOrder].username +
    "</p>" +
    "</div>";

  if (observer) {
    displacement = 170 + (13 - bottomPlayer.card_count) * 10;
    for (let i = 0; i < bottomPlayer.card_count; i++) {
      gameHtml +=
        '<div class= "bottom-player-observer card-back" style="left: ' +
        displacement +
        "px; z-index: " +
        z +
        ';"></div>';
      z++;
      displacement += 20;
    }
  } else {
    displacement = 170 + (13 - playersCards.length) * 10;
    for (let i = 0; i < playersCards.length; i++) {
      let suit = -Math.floor((playersCards[i].card_id - 1) / 13) * 100;
      let face = -((playersCards[i].card_id - 1) % 13) * 69;
      gameHtml +=
        '<div class= "bottom-player" style="left: ' +
        displacement +
        "px; z-index: " +
        z +
        "; background-position-y: " +
        suit +
        "px; background-position-x: " +
        face +
        'px" ' +
        buttonString +
        ' id="' +
        playersCards[i].card_id +
        '"></div>';
      z++;
      displacement += 20;
    }
  }

  if (bottomPlayer.card_in_play != null) {
    let suit = -Math.floor((bottomPlayer.card_in_play - 1) / 13) * 100;
    let face = -((bottomPlayer.card_in_play - 1) % 13) * 69;
    gameHtml +=
      '<div class = "bottom-player-to-mid card " style="background-position-y: ' +
      suit +
      "px; background-position-x: " +
      face +
      'px" id="' +
      bottomPlayer.card_in_play +
      '"></div>';
  }


  // SHOW LAST TRICK
  const last_played_box = document.getElementsByClassName("last-played-box")[0];
  let last_played_HTML = "<p class=\"last-played-box-p\">Cards played last hand:</p>";
  displacement = 300;
  if ( ! (lastCards == null)) {
    for (let i = 0; i < numPlayers; i++) {
      let card_id = lastCards[i].card_id;
      let suit = -Math.floor((card_id - 1) / 13) * 100;
      let face = -((card_id - 1) % 13) * 69;
      last_played_HTML +=
        '<div class= "last-trick" style="left: ' +
        displacement +
        "px; z-index: " +
        z +
        "; background-position-y: " +
        suit +
        "px; background-position-x: " +
        face +
        'px" ' +
        buttonString +
        ' id="' +
        i +
        '"></div>';
      z++;
      displacement += 20;
    }
  }
  last_played_box.innerHTML = last_played_HTML;


  if (numPlayers == 4) {
    updateBoardFourPlayers(gameHtml);
  } else {
    board.innerHTML = gameHtml;
  }
}

function updateBoardFourPlayers(gameHtml) {
  const board = document.getElementsByClassName("game-box")[0];
  let z = 30;

  gameHtml +=
    '<div class = "left-player-info">' +
    '<div class = "player-score-box">';
  if (!only_show_current_hand_scores_to_observer || observer) {
    gameHtml +=
    '<p class = "player-round-score">Score this round: ' +
    leftPlayer.current_round_score +
    "</p>";
  }
  gameHtml +=
    '<p class = "player-total-score">Total score: ' +
    leftPlayer.total_score +
    "</p>" +
    "</div>" +
    "<p>" +
    playerNames[leftPlayerOrder].username +
    "</p>" +
    "</div>";
  let displacement = 150 + (13 - leftPlayer.card_count) * 10;
  for (let i = 0; i < leftPlayer.card_count; i++) {
    gameHtml +=
      '<div class= "left-player card-back" style="top: ' +
      displacement +
      "px; z-index: " +
      z +
      ';"></div>';
    z++;
    displacement += 20;
  }
  if (leftPlayer.card_in_play != null) {
    let suit = -Math.floor((leftPlayer.card_in_play - 1) / 13) * 100;
    let face = -((leftPlayer.card_in_play - 1) % 13) * 69;
    gameHtml +=
      '<div class = "left-player-to-mid card " style="background-position-y: ' +
      suit +
      "px; background-position-x: " +
      face +
      'px" id="' +
      leftPlayer.card_in_play +
      '"></div>';
  }

  gameHtml +=
    '<div class = "right-player-info">' +
    '<div class = "player-score-box">';
  if (!only_show_current_hand_scores_to_observer || observer) {
    gameHtml +=
    '<p class = "player-round-score">Score this round: ' +
    rightPlayer.current_round_score +
    "</p>";
  }
  gameHtml +=
    '<p class = "player-total-score">Total score: ' +
    rightPlayer.total_score +
    "</p>" +
    "</div>" +
    "<p>" +
    playerNames[rightPlayerOrder].username +
    "</p>" +
    "</div>";
  displacement = 390 - (13 - rightPlayer.card_count) * 10;
  for (let i = 0; i < rightPlayer.card_count; i++) {
    gameHtml +=
      '<div class= "right-player card-back" style="top: ' +
      displacement +
      "px; z-index: " +
      z +
      ';"></div>';
    z++;
    displacement -= 20;
  }
  if (rightPlayer.card_in_play != null) {
    let suit = -Math.floor((rightPlayer.card_in_play - 1) / 13) * 100;
    let face = -((rightPlayer.card_in_play - 1) % 13) * 69;
    gameHtml +=
      '<div class = "right-player-to-mid card " style="background-position-y: ' +
      suit +
      "px; background-position-x: " +
      face +
      'px" id="' +
      rightPlayer.card_in_play +
      '"></div>';
  }

  board.innerHTML = gameHtml;
}

function selectCard(id) {
  const div = document.getElementById(id);
  div.style.top = "440px";
}

function resetCard(id) {
  const div = document.getElementById(id);
  div.style.top = "480px";
}

function selectSingleCard(id) {
  const alertBox = document.getElementsByClassName("alert-box")[0];

  if (selectedSingle != "0") {
    if (selectedSingleCard == id) {
      resetCard(selectedSingleCard);
      selectedSingleCard = "0";
      selectedSingle = false;
    } else {
      resetCard(selectedSingleCard);
      selectedSingleCard = id;
      selectCard(id);
    }
  } else {
    selectedSingleCard = id;
    selectCard(id);
    selectedSingle = true;
  }

  let btn = document.getElementById("single-button");

  if (selectedSingle && !gameOver) {
    buttonDisableLogic(); //btn.disabled = false;
  } else {
    alertBox.innerHTML = "";
    btn.disabled = true;
  }
}

function buttonDisableLogic() {
  const alertBox = document.getElementsByClassName("alert-box")[0];

  let selectedCard = parseInt(selectedSingleCard);
  let selectedSuit = Math.floor((selectedCard - 1) / 13);

  let btn = document.getElementById("single-button");

  let handSizeTotal = parseInt(topPlayer.card_count) + parseInt(bottomPlayer.card_count);
  if (numPlayers == 4) {
    handSizeTotal += parseInt(leftPlayer.card_count) + parseInt(rightPlayer.card_count);
  }

  let hasNonPoint = false;
  for (let i = 0; i < playersCards.length; i++) {
    if ( ! (playersCards[i].card_id == 38 || ( 40 <= playersCards[i].card_id && playersCards[i].card_id <= 52 ) ) ) {
      hasNonPoint = true;
    }
  }

  // first trick rules
  if ( handSizeTotal == 52 ) {
    if (must_pick_2_of_clubs_first) {
      //Must pick 2 of clubs
      if (selectedCard == 2) {
        alertBox.innerHTML = "";
        btn.disabled = false;
      } else {
        alertBox.innerHTML =
          "<p> The two of clubs must be the first card played each round.</p>";
        btn.disabled = true;
      }
    } else if (no_points_on_first_trick_lead && hasNonPoint) {
      alertBox.innerHTML = "";
      btn.disabled = false;
      if (selectedCard == 38 || (40 <= selectedCard && selectedCard <= 52) ) {
        alertBox.innerHTML =
          "<p> No points can be lead in the first trick unless you only have point cards </p>";
        btn.disabled = true;
      }
    } else { // Play whatever you want first
      alertBox.innerHTML = "";
      btn.disabled = false;
    }
    return;
  }
  //else if (handSizeTotal > 52 - numPlayers + 1) {
  //  if ( no_points_on_first_trick_lead && no_points_on_first_trick && hasNonPoint) {
  //    alertBox.innerHTML = "";
  //    btn.disabled = false;
  //    if (selectedCard == 38 || (40 <= selectedCard && selectedCard <= 52) ) {
  //      alertBox.innerHTML =
  //        "<p> No points can be played in the first trick unless you only have point cards </p>";
  //      btn.disabled = true;
  //    }
  //  }
  //}

  let leadCard = 0;

  if (numPlayers == 4) {
    if (rightPlayer.card_in_play != null) {
      leadCard = parseInt(rightPlayer.card_in_play);
    }
    if (topPlayer.card_in_play != null) {
      leadCard = parseInt(topPlayer.card_in_play);
    }
    if (leftPlayer.card_in_play != null) {
      leadCard = parseInt(leftPlayer.card_in_play);
    }
  } else {
    if (topPlayer.card_in_play != null) {
      leadCard = parseInt(topPlayer.card_in_play);
    }
  }

  //Case: you're the leading suit
  if (leadCard == 0) {
    let brokenHearts = 0;
    if (hearts_must_be_broken) {
      brokenHearts += parseInt(bottomPlayer.current_round_score) + parseInt(topPlayer.current_round_score);
      if (numPlayers == 4) {
        brokenHearts += parseInt(leftPlayer.current_round_score) + parseInt(rightPlayer.current_round_score);
      }
    } else {
      brokenHearts = 1;
    }

    let hasNonHeart = false;
    for (let i = 0; i < playersCards.length; i++) {
      if (Math.floor((playersCards[i].card_id - 1) / 13) == 2) {
        hasNonHeart = true;
      }
    }

    if (brokenHearts == 0 && selectedSuit == 3 && hasNonHeart) {
      alertBox.innerHTML =
        "<p>Hearts haven't been broken yet, you can't play hearts as the lead suit.</p>";
      btn.disabled = true;
    } else {
      alertBox.innerHTML = "";
      btn.disabled = false;
    }
    return;
  }

  let leadSuit = Math.floor((leadCard - 1) / 13);

  if (leadSuit != selectedSuit) {
    let playableCard = false;
    for (let i = 0; i < playersCards.length; i++) {
      if (leadSuit == Math.floor((playersCards[i].card_id - 1) / 13)) {
        playableCard = true;
      }
    }
    if (playableCard) {
      alertBox.innerHTML = "<p>Your card must match the leading suit.</p>";
      btn.disabled = true;
    } else {
      alertBox.innerHTML = "";
      btn.disabled = false;
    }
  } else {
    alertBox.innerHTML = "";
    btn.disabled = false;
  }
}

function selectMultipleCard(id) {
  if (selectedFirst && selectedMultiple[0] == id) {
    resetCard(id);
    selectedMultiple[0] = "0";
    selectedFirst = false;
  } else if (
    !selectedFirst &&
    id != selectedMultiple[1] &&
    id != selectedMultiple[2]
  ) {
    selectedMultiple[0] = id;
    selectCard(id);
    selectedFirst = true;
  } else if (selectedSecond && selectedMultiple[1] == id) {
    resetCard(id);
    selectedMultiple[1] = "0";
    selectedSecond = false;
  } else if (!selectedSecond && id != selectedMultiple[2]) {
    selectedMultiple[1] = id;
    selectCard(id);
    selectedSecond = true;
  } else if (selectedThird && selectedMultiple[2] == id) {
    resetCard(id);
    selectedMultiple[2] = "0";
    selectedThird = false;
  } else if (!selectedThird) {
    selectedMultiple[2] = id;
    selectCard(id);
    selectedThird = true;
  }

  let btn = document.getElementById("multiple-button");

  if (selectedFirst && selectedSecond && selectedThird && !gameOver) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

function passButton() {
  // send three cards to server
  gameSocket.emit("PASS CARDS", {
    user_id: user_id,
    game_id: game_id,
    passed_cards: [
      selectedMultiple[0],
      selectedMultiple[1],
      selectedMultiple[2]
    ]
  });

  resetCard(selectedMultiple[0]);
  resetCard(selectedMultiple[1]);
  resetCard(selectedMultiple[2]);
  selectedFirst = false;
  selectedSecond = false;
  selectedThird = false;
  selectedMultiple = ["0", "0", "0"];
  let btn = document.getElementById("multiple-button");
  btn.disabled = true;
}

function playButton() {
  //send one card to the server
  gameSocket.emit("PLAY CARDS", {
    user_id: user_id,
    game_id: game_id,
    passed_card: selectedSingleCard
  });

  resetCard(selectedSingleCard);
  selectedSingleCard = "0";
  selectedSingle = false;
  let btn = document.getElementById("single-button");
  btn.disabled = true;
}

function nudgeButton() {
  let btn = document.getElementById("nudge-button");
  btn.disabled = true;

  let nudgedNote = "";


  if (currentPlayer == null) {
    nudgedNote =
      "<b>(System)</b> " +
      username +
      " has nudged all players; players have "+nudge_timeout_seconds+" seconds to finish passing their cards or they will forfeit!";
  } else {
    nudgedNote =
      "<b>(System)</b> " +
      currentPlayer +
      " has been nudged and has "+nudge_timeout_seconds+" seconds to play a card or they will forfeit!";
  }

  chatSocket.emit("NUDGE NOTIFICATION", {
    room_id: room.value,
    nudged_player: nudgedNote
  });

  let timer = setTimeout(nudgeFinal, nudge_timeout_value);

  gameSocket.emit("NUDGE NOTIFICATION", {
    room_id: room.value,
    nudge_timer: timer
  });
}

gameSocket.on("CANCEL NUDGE", timer => {
  clearTimeout(timer);
});

function nudgeFinal() {
  gameSocket.emit("NUDGE TIMER OVER", {
    game_id: game_id,
    nudged_player: currentPlayer
  });
}
