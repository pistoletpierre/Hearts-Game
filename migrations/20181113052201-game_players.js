"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("game_players", {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id"
        },
        primaryKey:true
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "games",
          key: "game_id"
        },
        primaryKey: true
      },
      total_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      current_round_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      turn_sequence: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      // TODO: change this to boolean. Using integer for now since it's a mid-game adjustment and boolea
      moonshot_up26: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("game_players");
  }
};
