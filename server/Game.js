var cloneDeep = require('lodash.clonedeep');

function copy(o) {
    // "string", number, boolean
    if(typeof(o) != "object") {
        return o;
    }
    
     // null
    if(!o) {
        return o; // null
    }
    
    var r = (o instanceof Array) ? [] : {};
    for(var i in o) {
        if(o.hasOwnProperty(i)) {
            r[i] = dup(o[i]);
        }
    }
    return r;
}

function isNumeric(str) {
    if (typeof str != "string") {
        console.log("Only use string input")
        return false
    } // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

class Board {
    DIR = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]

    constructor(rows, cols) {
        this.rows = rows
        this.cols = cols
        this.board = new Array(this.rows)
        this.new_board()
    }

    new_board() {
        for(let i = 0; i < this.rows; i++) {
            var col = new Array(this.cols)
            for(let j = 0; j < this.cols; j++) {
                col[j] = 0
            }
            this.board[i] = col
        }
        this.init_pieces()
    }

    set_board(matrix) {
        this.board = matrix
    }

    set_piece(piece, x, y) {
        this.board[x][y] = piece
    }

    init_pieces() {
        let start_x = Math.floor(this.rows / 2 - 1)
        let start_y = Math.floor(this.cols / 2 - 1)

        this.set_piece(1, start_x, start_y)
        this.set_piece(1, start_x + 1, start_y + 1)
        this.set_piece(2, start_x, start_y + 1)
        this.set_piece(2, start_x + 1, start_y)
    }

    is_on_board(x, y) {
        return (x >= 0 && x < this.rows && y >= 0 && y < this.cols)
    }

    valid_direction(player, x, y, dir_x, dir_y) {
        let i = x + dir_x
        let j = y + dir_y
        let gain = 0

        if (!this.is_on_board(i, j)) {
            return false
        }

        while(this.board[i][j] === (3 - player)) {
            gain += 1
            i += dir_x
            j += dir_y

            if(!this.is_on_board(i, j)) {
                return false
            }
        }

        if(gain > 0 && this.board[i][j] === player) {
            return true
        }

        return false
    }

    set_available_moves(player) {
        for(let x = 0; x < this.rows; x++) {
            for(let y = 0; y < this.cols; y++) {
                if(this.board[x][y] === -1) {
                    this.board[x][y] = 0
                }

                if(this.board[x][y] === 0) {
                    for(let i=0; i<8; i++) {
                        if(this.valid_direction(player, x, y, this.DIR[i][0], this.DIR[i][1])) {
                            this.board[x][y] = -1
                        }
                    }
                }
            }
        }
    }

    validate_move(x, y) {
        if(!this.is_on_board(x, y)) {
            return false
        }

        if(this.board[x][y] > 0) {
            return false
        }

        if(this.board[x][y] === -1) {
            return true
        }
        else {
            return false
        }

    }


    make_move(player, x, y) {
        this.set_piece(player, x, y)

        for(let i=0; i<8; i++) {
            if(this.valid_direction(player, x, y, this.DIR[i][0], this.DIR[i][1])) {
                let dir_x = x + this.DIR[i][0]
                let dir_y = y + this.DIR[i][1]

                while(this.board[dir_x][dir_y] != player) {
                    this.set_piece(player, dir_x, dir_y)
                    dir_x += this.DIR[i][0]
                    dir_y += this.DIR[i][1]
                }
            }
        }
    }

    get_scores() {
        let scores = [0, 0]

        for(let row=0; row < this.rows; row ++) {
            for(let col=0; col < this.cols; col ++) {
                if(this.board[row][col] === 1) {
                    scores[0] += 1
                }
                else if(this.board[row][col] === 2) {
                    scores[1] += 1
                }
            }
        }
        return scores
    }

    get_board() {
        return this.board
    }

    playable() {
        for(let x=0; x<this.rows; x++) {
            for(let y=0; y<this.cols; y++) {
                if(this.board[x][y] === -1) {
                    return true
                }
            }
        }
        return false
    }

    print_board() {
        for(let x=0; x<this.rows; x++) {
            let row = ""
            for(let y=0; y<this.cols; y++) {
                row += this.board[x][y]
                row += "\t"
            }
            console.log(row)
        }
        console.log()
    }

}


class Bot {
    constructor(turn) {
        this.turn = turn
        console.log('Bot')
    }

    get_available_moves(board) {
        let moves = []

        for(let x=0; x<board.length; x++) {
            for(let y=0; y<board[x].length; y++) {
                if(board[x][y] < 0) {
                    moves.push([x, y])
                }
            }
        }
        return moves
    }

    make_move(board) {
        let temp_board = board.get_board()
        let moves = this.get_available_moves(temp_board)

        let choice = moves[0]

        return choice
    }

}



class Game {
    constructor(rows = 8, cols = 8) {
        this.board = new Board(rows, cols)
        this.turn = 2
        this.end_counter = 0
        this.new_turn()
    }

    new_turn() {
        this.turn = 3 - this.turn
        this.board.set_available_moves(this.turn)
    }

    game_over() {
        return this.end_counter > 1
    }

    get_turn() {
        return this.turn
    }

    get_status() {
        console.log("Current player: " + this.turn)

        let [x, y] = this.board.get_scores()
        console.log("x: " + x + "\ty: " + y)

        this.board.print_board()
    }

    get_move() {
        console.log("Player: " + this.turn)

        let x = window.prompt("Input row: ")
        let y = window.prompt("Input column: ")

        while(!this.validate_input(x, y)) {
            x = window.prompt("Input row: ")
            y = window.prompt("Input column: ")
        }

        return {x, y}
    }

    validate_input(x, y) {
        if(!isNumeric(x) || !isNumeric(y)) {
            console.log("Invalid input")
            return false
        }
        else {
            x = parseInt(x)
            y = parseInt(y)
        }
        return this.board.validate_move(x, y)
    }

    make_move(x, y) {
        this.board.make_move(this.turn, x, y)
    }

    next_turn() {
        this.new_turn()
        this.end_counter = 0

        if(!this.board.playable()) {
            this.end_counter += 1
            this.new_turn()

            if(this.board.playable()) {
                this.end_counter = 0
            }
            else {
                this.end_counter += 1
            }
        }
    }

    get_result() {
        let [x, y] = this.board.get_scores()

        if(x>y) console.log("1 wins")
        else if(x<y) console.log("2 wins")
        else console.log("tie")
    }
}


class BotGame extends Game {
    constructor(bot1, bot2, rows = 8, cols = 8) {
        super(rows, cols)

        this.player1 = bot1
        this.player2 = bot2
    }

    get_move() {
        if(this.turn === 1) {
            return this.player1.make_move(this.board)
        }
        else {
            return this.player2.make_move(this.board)
        }
    }
}


class SinglePlayerGame extends Game {
    constructor(bot, player_turn, rows = 8, cols = 8) {
        super(rows,cols)

        this.bot = bot
        this.player_turn = player_turn
    }

    get_choice_move() {
        if(this.turn === this.player_turn) {
            return this.get_move()
        }
        else {
            return this.bot.make_move(this.board)
        }
    }
}



class Randy extends Bot {
    constructor(turn) {
        super(turn)
    }

    get_bot_name() {
        return "Random"
    }

    make_move(board) {
        let temp_board = board.get_board()
        let moves = this.get_available_moves(temp_board)

        let choice = moves[Math.floor(Math.random() * moves.length)]

        return choice
    }
}


class Greedy extends Bot {
    VAL = [[120, -20, 20,  5,  5, 20, -20, 120],
           [-20, -40, -5, -5, -5, -5, -40, -20],
           [ 20,  -5, 15,  3,  3, 15,  -5,  20],
           [  5,  -5,  3,  3,  3,  3,  -5,   5],
           [  5,  -5,  3,  3,  3,  3,  -5,   5],
           [ 20,  -5, 15,  3,  3, 15,  -5,  20],
           [-20, -40, -5, -5, -5, -5, -40, -20],
           [120, -20, 20,  5,  5, 20, -20, 120]]


    constructor(turn) {
        super(turn)
    }

    get_bot_name() {
        return "Greedy"
    }

    make_move(board) {
        let temp_board = board.get_board()
        let moves = this.get_available_moves(temp_board)

        let reward = []
        for(let i = 0; i<moves.length; i++) {
            reward.push(this.VAL[moves[i][0]][moves[i][1]])
        }

        return moves[reward.indexOf(Math.max.apply(Math,reward))]
        // return moves[reward.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)]
    }
}


class MiniMax extends Greedy {
    min_eval_board = -1776
    max_eval_board = 1776

    constructor(turn, depth) {
        super(turn)
        this.depth = depth
    }

    get_bot_name() {
        return "MiniMax"
    }

    eval_board(board) {
        let temp_board = board.get_board()
        let total_reward = 0

        for(let x = 0; x < board.rows; x++) {
            for(let y = 0; y < board.cols; y++) {
                if(temp_board[x][y] === this.turn) {
                    total_reward += this.VAL[x][y]
                }
                else if(temp_board[x][y] === 3 - this.turn) {
                    total_reward -= this.VAL[x][y]
                }
            }
        }

        return total_reward
    }

    sort_nodes(moves) {
        let sorted_nodes = []
        for(let i=0; i<moves.length; i++) {
            sorted_nodes.push([moves[i], this.VAL[moves[i][0]][moves[i][1]]])
        }

        sorted_nodes.sort((a, b) => {
            if(a[1] === b[1]) {
                return 0
            }
            else {
                return (a[1] > b[1]) ? -1 : 1
            }
        })

        let nodes = []
        for(let i=0; i<sorted_nodes.length; i++) {
            nodes.push(sorted_nodes[i][0])
        }

        return nodes

    }

    _get_available_moves(board, player) {
        board.set_available_moves(player)
        let temp_board = board.get_board()

        return this.get_available_moves(temp_board)
    }

    minimax_alpha_beta(board, depth, player, alpha, beta, turn) {
        let valid_moves = this._get_available_moves(board, player)
        let best_value = 0

        if(depth === 0 || valid_moves.length === 0) {
            return this.eval_board(board, turn)
        }

        if(player === turn) {
            let tiles = this.sort_nodes(valid_moves)
            best_value = this.min_eval_board

            for(let i=0 ; i<tiles.length ; i++) {
                let board_temp = cloneDeep(board)

                board_temp.make_move(player, tiles[i][0], tiles[i][1])
                let val = this.minimax_alpha_beta(board_temp, depth - 1, 3 - player, alpha, beta, turn)

                if(val > best_value) {
                    best_value = val
                }

                if(val > alpha) {
                    alpha = val
                }

                if(alpha >= beta) {
                    break  //beta cut-off
                }
            }
        }
        else {
            let tiles = this.sort_nodes(valid_moves)
            best_value = this.max_eval_board

            for(let i=0 ; i<tiles.length ; i++) {
                let board_temp = cloneDeep(board)

                board_temp.make_move(player, tiles[i][0], tiles[i][1])
                let val = this.minimax_alpha_beta(board_temp, depth - 1, 3 - player, alpha, beta, turn)

                if(val > best_value) {
                    best_value = val
                }

                if(val < beta) {
                    beta = val
                }

                if(alpha >= beta) {
                    break  //alpha cut-off
                }
            }
        }
        return best_value
    }

    make_move(board) {
        let moves = this._get_available_moves(board, this.turn)
        let sorted_tiles = this.sort_nodes(moves)

        let max_points = this.min_eval_board
        let best_move = []

        for(let i = 0; i < sorted_tiles.length; i++) {
            let board_temp = cloneDeep(board)
            board_temp.make_move(this.turn, sorted_tiles[i][0], sorted_tiles[i][1])

            let points = this.minimax_alpha_beta(board_temp, this.depth, 3 - this.turn, max_points, this.max_eval_board, this.turn)

            if(points > max_points) {
                max_points = points
                best_move = sorted_tiles[i]
            }
            else if(points === max_points) {
                if(Math.round(Math.random * 1)) {
                    best_move = sorted_tiles[i]
                }
            }
        }
        return best_move
    }
}


function play_bot_game(bot1, bot2, display = true) {
    console.log('player 1: ' + bot1.get_bot_name())
    console.log('player 2: ' + bot2.get_bot_name())

    let game = new BotGame(bot1, bot2)
    while(true) {
        if(game.game_over()) {
            if(display) {
                game.get_status()
            }
            break
        }

        if(display) {
            game.get_status()
        }

        [x,y] = game.get_move()

        game.make_move(x, y)
        game.next_turn()
    }
    game.get_result()
}

var r = new Randy(1)
var m = new MiniMax(2,3)
play_bot_game(r,m)
