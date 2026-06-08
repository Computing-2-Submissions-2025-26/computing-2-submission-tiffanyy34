const AnimalStack = Object.create(null);

AnimalStack.new_game = function () {
    return {
        currentPlayer: 1,
        winner: null,
        ended: false
    };
};

AnimalStack.current_player = function (game) {
    return game.currentPlayer;
};

AnimalStack.next_turn = function (game) {
    return {
        ...game,
        currentPlayer:
            game.currentPlayer === 1 ? 2 : 1
    };
};

AnimalStack.end_game = function (losingPlayer, game) {
    return {
        ...game,
        ended: true,
        winner: losingPlayer === 1 ? 2 : 1
    };
};

AnimalStack.is_ended = function (game) {
    return game.ended;
};

AnimalStack.winner = function (game) {
    return game.winner;
};

AnimalStack.is_playable = function(game) {
    return !game.ended;
};

export default Object.freeze(AnimalStack);


