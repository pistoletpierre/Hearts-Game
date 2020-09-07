const CREATE_GAME_QUERY =
  "INSERT INTO games (max_players, game_name, round_number, first_starting_player) VALUES " +
  "($1, $2, $3, (select floor(random() * $1))) RETURNING game_id";

const CREATE_GAME_PLAYER_QUERY =
  "INSERT INTO game_players (user_id, game_id, total_score, current_round_score, " +
  "turn_sequence, moonshot_up26) VALUES ($1, $2, $3, $4, $5, true)";

const GET_CURRENT_GAMES_QUERY =
  "SELECT g.game_id, game_name, max_players, COUNT(*) as player_count " +
  "FROM games g, game_players gp WHERE g.game_id=gp.game_id GROUP BY g.game_id";

const CHECK_GAME_EXISTS_QUERY = "SELECT * FROM games WHERE game_id = $1";

const PLAYER_COUNT_QUERY =
  "SELECT COUNT(*) as player_count FROM game_players WHERE game_id=$1";

const OBSERVE_GAME_QUERY =
  "INSERT into game_observers(user_id, game_id) VALUES ($1, $2)";

const JOIN_GAME_QUERY =
  "INSERT into game_players (user_id, game_id, total_score, current_round_score, turn_sequence) " +
  "VALUES ($1, $2, $3, $4, $5)";

const DELETE_GAME_QUERY =
  "DELETE FROM cards_in_play WHERE game_id = $1; DELETE FROM passed_cards WHERE game_id = $1; " +
  "DELETE FROM user_game_cards WHERE game_id = $1; DELETE FROM game_observers WHERE game_id = $1; " +
  "DELETE FROM game_players WHERE game_id = $1; DELETE FROM games WHERE game_id = $1;";

const VERIFY_IN_GAME_QUERY =
  "SELECT MAX(count) as in_Game FROM (SELECT COUNT(*) FROM game_players WHERE " +
  "game_players.user_id = $1 AND game_players.game_id = $2 UNION SELECT COUNT(*) FROM game_observers WHERE " +
  "game_observers.user_id = $1 AND game_observers.game_id = $2) as counts";

const MAX_PLAYERS_QUERY = "SELECT max_players FROM games WHERE game_id = $1";

const INIT_CARDS_QUERY =
  "DO $$ " +
  "BEGIN " +
  "FOR counter IN 1..52 LOOP " +
  "INSERT INTO user_game_cards (game_id, card_id) " +
  "VALUES ($1, counter); " +
  "END LOOP; " +
  "END; $$ ";

const GET_USERS_QUERY =
  "SELECT username, turn_sequence FROM users, game_players " +
  "WHERE users.user_id = game_players.user_id AND game_players.game_id = $1 ORDER BY turn_sequence ";

const GET_CARDS_QUERY = "SELECT * from user_game_cards WHERE game_id = $1";

const SET_CARD_OWNER_QUERY =
  "UPDATE user_game_cards SET user_id = $1 WHERE card_id = $2 AND game_id = $3";

const CHECK_GAME_STATE_QUERY = "SELECT * FROM user_game_cards WHERE game_id=$1";

const SORT_BY_TURN_QUERY =
  "SELECT * FROM game_players WHERE game_id = $1 ORDER BY turn_sequence";

const SHARED_INFO_QUERY =
  "SELECT  username, turn_sequence, " +
  "current_round_score, total_score, " +
  "cards_in_play.card_id AS card_in_play, 0 AS card_count, game_players.moonshot_up26 as moonshot_up26 " +
  "FROM users, game_players, cards_in_play " +
  "WHERE users.user_id = game_players.user_id " +
  "AND cards_in_play.game_id = $1 " +
  "AND cards_in_play.user_id = users.user_id " +
  "AND game_players.game_id = $1 " +
  "GROUP BY username, turn_sequence, current_round_score, total_score, cards_in_play.card_id, game_players.moonshot_up26 " +
  "ORDER BY turn_sequence";

const GET_HAND_SIZE_QUERY =
  "SELECT count(DISTINCT user_game_cards.card_id) AS card_count " +
  "FROM users, user_game_cards " +
  "WHERE users.username = $1 " +
  "AND users.user_id = user_game_cards.user_id " +
  "AND user_game_cards.game_id = $2 ";

const JOIN_CARDS_IN_PLAY_QUERY =
  "INSERT INTO cards_in_play (user_id, game_id) VALUES ($1, $2)";

const GET_GAME_PLAYERS_QUERY =
  "SELECT * FROM game_players WHERE game_id = $1 ORDER BY turn_sequence";

const GET_PLAYER_CARDS_QUERY =
  //"SELECT card_id FROM user_game_cards WHERE user_game_cards.user_id = $1 AND " +
  //"game_id = $2 ORDER BY card_id";

  "SELECT joined.card_id FROM " +
  "(SELECT user_game_cards.card_id, cards.card_value, cards.card_suit FROM " +
    "user_game_cards JOIN cards ON user_game_cards.card_id = cards.card_id " +
    "WHERE user_game_cards.user_id = $1 " +
      "AND game_id = $2 " +
      "ORDER BY (CASE cards.card_suit " +
      "    WHEN 'Clubs' " +
      "    THEN 1 " +
      "    WHEN 'Diamonds' " +
      "    THEN 2 " +
      "    WHEN 'Spades' " +
      "    THEN 3 " +
      "    WHEN 'Hearts' " +
      "    THEN 4     " +
      "    END " +
      ") ASC, cards.card_value" +
  ") as joined";

const TURN_QUERY =
  "SELECT users.username AS current_player FROM games, users WHERE game_id = $1 AND " +
  "current_player = users.user_id";

const GET_CURRENT_TURN_QUERY =
  "SELECT current_player FROM games WHERE game_id = $1";

const GET_CARD_QUERY =
  "SELECT card_id FROM user_game_cards WHERE card_id = $1 AND user_id = $2 AND game_id = $3";

const GET_USER_GAME_CARD_QUERY =
  "SELECT * FROM user_game_cards WHERE user_id=$1 AND game_id=$2 AND card_id=$3";

const PASS_CARD_QUERY =
  "INSERT INTO passed_cards (user_id, game_id, card_id) VALUES ($1, $2, $3)";

const GET_PASS_CARD_QUERY =
  "SELECT COUNT(DISTINCT card_id) FROM passed_cards WHERE game_id = $1";

const GET_CURRENT_RND_NUMBER = "SELECT round_number FROM games WHERE game_id=$1";

const GET_ALL_PASS_CARDS =
  "SELECT * FROM passed_cards WHERE user_id=$1 AND game_id=$2";

const DELETE_PASS_CARD_QUERY =
  "DELETE FROM passed_cards WHERE card_id=$1 AND game_id=$2";

const SET_CURRENT_PLAYER_QUERY =
  "UPDATE games SET current_player=$1 WHERE game_id=$2";

//EDIT
//const GET_STARTING_PLAYER_QUERY =
//  "SELECT user_id FROM user_game_cards WHERE game_id=$1 AND card_id=$2";

const GET_STARTING_PLAYER_QUERY =
  //"WITH current_round_number AS (SELECT round_number FROM games WHERE game_id=$1), " +
  //"  unique_user_ids_in_this_game AS (SELECT DISTINCT user_id FROM user_game_cards WHERE game_id=$1 ORDER BY user_id) " +
  //"SELECT user_id " +
  //"FROM unique_user_ids_in_this_game " +
  //"LIMIT 1 " +
  //"OFFSET (SELECT MOD(round_number + (SELECT first_starting_player FROM games where game_id=$1), (SELECT max_players FROM games where game_id=$1)) FROM games WHERE game_id=$1)  ";
  "WITH current_round_number AS (SELECT round_number FROM games WHERE game_id=$1), " +
  "  unique_user_ids_in_this_game AS (SELECT DISTINCT user_id, turn_sequence FROM game_players WHERE game_id=$1 ORDER BY turn_sequence) " +
  "SELECT user_id " +
  "FROM unique_user_ids_in_this_game " +
  "LIMIT 1 " +
  "OFFSET (" +
  "  SELECT MOD(" +
  "    round_number + (SELECT first_starting_player FROM games where game_id=$1), (SELECT max_players FROM games where game_id=$1)" +
  "  ) FROM games WHERE game_id=$1)  ";



const PLAY_CARD_QUERY =
  "UPDATE cards_in_play SET card_id = $1 WHERE user_id = $2 AND game_id = $3";

const GET_PLAYER_TURN_SEQUENCE =
  "SELECT turn_sequence FROM game_players WHERE user_id = $1 AND game_id = $2";

const CARDS_LEFT_QUERY =
  "SELECT COUNT(DISTINCT card_id) AS cards_left FROM user_game_cards WHERE " +
  "game_id = $1 AND user_id <> 0";

const CARDS_IN_PLAY_QUERY = "SELECT * from cards_in_play WHERE game_id = $1";

const UPDATE_CARDS_IN_PLAY_QUERY =
  "UPDATE cards_in_play SET card_id = null WHERE game_id = $1";

const UPDATE_POINTS =
  "UPDATE game_players SET current_round_score = current_round_score + $1 WHERE game_id = $2 " +
  "AND user_id = $3";

const CARDS_COUNT_QUERY =
  "SELECT COUNT(card_id) FROM cards_in_play WHERE card_id <> 0 AND game_id = $1";

const GET_LEAD_SUIT_QUERY = "SELECT leading_suit FROM games WHERE game_id = $1";

const SET_LEAD_SUIT_QUERY =
  "UPDATE games SET leading_suit = $1 WHERE game_id = $2";

const GET_ROUND_SCORES =
  "SELECT user_id, current_round_score FROM game_players WHERE game_id = $1";

const SET_PLAYER_MOONSHOT_SETTING =
  "UPDATE game_players SET moonshot_up26 = $3 WHERE game_id = $2 AND user_id = $1";

const GET_PLAYER_MOONSHOT_SETTING =
  "SELECT moonshot_up26 from game_players WHERE game_id = $1 AND user_id = $2";

const UPDATE_SCORES_QUERY =
  "UPDATE game_players SET total_score = total_score + current_round_score WHERE game_id = $1";

const UPDATE_SCORES_QUERY_UP26 =
  "UPDATE game_players SET total_score = total_score + 26 WHERE game_id = $1 AND user_id = $2";

const UPDATE_SCORES_QUERY_DOWN26 =
  "UPDATE game_players SET total_score = total_score - 26 WHERE game_id = $1 AND user_id = $2";

const INCREMENT_ROUND_QUERY =
  "UPDATE games SET round_number = round_number + 1 WHERE game_id = $1";

const GET_USER_ID = "SELECT user_id FROM users WHERE username = $1";

const NUDGE_QUERY =
  "UPDATE game_players " +
  "SET total_score = total_score + 100 " +
  "WHERE game_id = $1 " +
  "AND user_id " +
  "NOT IN" +
  "(SELECT user_id FROM passed_cards " +
  "WHERE game_id = $1)";

const TOTAL_POINTS_QUERY =
  "UPDATE game_players SET total_score = total_score + $1 WHERE game_id = $2 AND user_id = $3";

const GET_MAX_SCORE_QUERY =
  "SELECT MAX(total_score) AS maximum_score FROM game_players WHERE game_id = $1";

const VERIFY_PLAYER_QUERY =
  "SELECT * FROM game_players WHERE user_id = $1 AND game_id = $2";

const RESET_POINTS_QUERY =
  "UPDATE game_players SET current_round_score = 0 WHERE game_id = $1";

module.exports = {
  CREATE_GAME_QUERY,
  CREATE_GAME_PLAYER_QUERY,
  GET_CURRENT_GAMES_QUERY,
  CHECK_GAME_EXISTS_QUERY,
  PLAYER_COUNT_QUERY,
  OBSERVE_GAME_QUERY,
  JOIN_GAME_QUERY,
  DELETE_GAME_QUERY,
  VERIFY_IN_GAME_QUERY,
  MAX_PLAYERS_QUERY,
  INIT_CARDS_QUERY,
  GET_USERS_QUERY,
  GET_CARDS_QUERY,
  SET_CARD_OWNER_QUERY,
  CHECK_GAME_STATE_QUERY,
  SORT_BY_TURN_QUERY,
  SHARED_INFO_QUERY,
  GET_HAND_SIZE_QUERY,
  JOIN_CARDS_IN_PLAY_QUERY,
  GET_GAME_PLAYERS_QUERY,
  GET_PLAYER_CARDS_QUERY,
  TURN_QUERY,
  GET_CURRENT_TURN_QUERY,
  GET_CARD_QUERY,
  GET_USER_GAME_CARD_QUERY,
  PASS_CARD_QUERY,
  GET_PASS_CARD_QUERY,
  GET_CURRENT_RND_NUMBER,
  GET_ALL_PASS_CARDS,
  DELETE_PASS_CARD_QUERY,
  SET_CURRENT_PLAYER_QUERY,
  GET_STARTING_PLAYER_QUERY,
  PLAY_CARD_QUERY,
  GET_PLAYER_TURN_SEQUENCE,
  CARDS_LEFT_QUERY,
  CARDS_IN_PLAY_QUERY,
  UPDATE_CARDS_IN_PLAY_QUERY,
  UPDATE_POINTS,
  CARDS_COUNT_QUERY,
  GET_LEAD_SUIT_QUERY,
  SET_LEAD_SUIT_QUERY,
  GET_ROUND_SCORES,
  UPDATE_SCORES_QUERY,
  INCREMENT_ROUND_QUERY,
  GET_USER_ID,
  NUDGE_QUERY,
  TOTAL_POINTS_QUERY,
  GET_MAX_SCORE_QUERY,
  VERIFY_PLAYER_QUERY,
  RESET_POINTS_QUERY,
  SET_PLAYER_MOONSHOT_SETTING,
  GET_PLAYER_MOONSHOT_SETTING,
  UPDATE_SCORES_QUERY_DOWN26,
  UPDATE_SCORES_QUERY_UP26
};
