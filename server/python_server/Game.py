import random
import copy

class Board:
    DIR = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]

    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.new_board()


    def new_board(self):
        self.board = [[0] * self.cols for x in range(self.rows)]
        self.init_pieces()

    
    def set_board(self, matrix):
        self.board = matrix


    def set_piece(self, piece, x, y):
        self.board[x][y] = piece


    def init_pieces(self):
        start_x = self.rows // 2 - 1
        start_y = self.cols // 2 - 1

        self.set_piece(1, start_x, start_y)
        self.set_piece(1, start_x + 1, start_y + 1)
        self.set_piece(2, start_x + 1, start_y)
        self.set_piece(2, start_x, start_y + 1)

    
    def is_on_board(self, x, y):
        return x >= 0 and x < self.rows and y >= 0 and y < self.cols


    def valid_direction(self, player, x, y, dir_x, dir_y):
        i = x + dir_x
        j = y + dir_y
        gain = 0

        if not self.is_on_board(i, j):
            return False

        while self.board[i][j] == 3 - player:
            gain += 1
            i += dir_x
            j += dir_y

            if not self.is_on_board(i, j):
                return False

        if gain > 0 and self.board[i][j] == player:
            return True
        
        return False

    
    def set_available_moves(self, player):
        for x in range(self.rows):
            for y in range(self.cols):
                if self.board[x][y] == -1:
                    self.board[x][y] = 0

                if self.board[x][y] == 0:
                    for i, j in self.DIR:
                        if self.valid_direction(player, x, y, i, j):
                            self.board[x][y] = -1


    def validate_move(self, player, x, y):
        if not self.is_on_board(x, y):
            print("INPUT OUT OF RANGE")
            return False

        if self.board[x][y] > 0:
            print("SLOT OCCUPIED")
            return False

        if self.board[x][y] == -1:
            return True
        else:
            print("NO PIECE TO TAKE")
            return False

    
    def make_move(self, player, x, y):
        self.set_piece(player, x, y)

        for i, j in self.DIR:
            if self.valid_direction(player, x, y, i, j):
                dir_x = x + i
                dir_y = y + j

                while self.board[dir_x][dir_y] != player:
                    self.set_piece(player, dir_x, dir_y)

                    dir_x += i
                    dir_y += j


    def get_scores(self):
        scores = [0 , 0]

        for row in range(self.rows):
            for col in range(self.cols):
                if self.board[row][col] == 1:
                    scores[0] += 1
                elif self.board[row][col] == 2:
                    scores[1] += 1

        return scores


    def get_board(self):
        return self.board

    
    def playable(self):
        for x in range(self.rows):
            for y in range(self.cols):
                if self.board[x][y] == -1:
                    return True

        return False


    def print_board(self):
        for row in range(self.rows):
            for col in range(self.cols):
                print(self.board[row][col], end="\t")
            print()
        print()


class Bot:
    def __init__(self, turn):
        self.turn = turn


    def get_available_moves(self, board):
        moves = []

        for row in range(len(board)):
            for col in range(len(board[0])):
                if board[row][col] < 0:
                    moves.append([row, col])

        #print(moves)
        return moves


    def make_move(self, board):
        temp_board = board.get_board()
        moves = self.get_available_moves(temp_board)

        choice = moves[0]
        #print(self.turn, choice)

        return choice

    def __str__(self):
        return 'Bot'


class Game:
    def __init__(self, rows = 8, cols = 8):
        self.board = Board(rows, cols)
        self.turn = 2
        self.end_counter = 0

        self.new_turn()

    
    def new_turn(self):
        self.turn = 3 - self.turn
        self.board.set_available_moves(self.turn)
            
    
    def game_over(self):
        return self.end_counter > 1

    def get_turn(self):
        return self.turn


    def get_status(self):
        print("Current player: " + str(self.turn))

        x, y = self.board.get_scores()
        print("x: " + str(x) + "\ty: " + str(y))

        self.board.print_board()

    def get_board(self):
        flatten_board = [str(col) for row in self.board.get_board() for col in row]
        board = " ".join(flatten_board)
        return board
        

    def get_move(self):
        print("Player:", self.turn)

        x = input("Input row:")
        y = input("Input column:")
        
        while not self.validate_input(x, y):
            x = input("Input row again:")
            y = input("Input column again:")

        return (x, y)

    
    def validate_input(self, x, y):
        if (not x.isnumeric()) or (not y.isnumeric()):
            print("INVALID INPUT")
            return False
        else:
            x = int(x)
            y = int(y)

        return self.board.validate_move(self.turn, x, y)


    def make_move(self, x, y):
        self.board.make_move(self.turn, x, y)


    def next_turn(self):
        self.new_turn()
        self.end_counter = 0

        if not self.board.playable():
            #self.get_status()
            self.end_counter += 1
            self.new_turn()

            if self.board.playable():
                self.end_counter = 0
            else:
                self.end_counter += 1

    
    def get_result(self):
        x, y = self.board.get_scores()

        if x > y:
            print("1 wins")
        elif x < y:
            print("2 wins")
        else:
            print("tie")
        
        return [x, y]


class BotGame(Game):
    def __init__(self, bot1, bot2, rows = 8, cols = 8):
        super().__init__(rows, cols)

        self.player1 = bot1
        self.player2 = bot2


    def get_move(self):
        if self.turn == 1:
            return self.player1.make_move(self.board)
        else:
            return self.player2.make_move(self.board)

class SinglePlayerGame(Game):
    def __init__(self, bot, player_turn, rows = 8, cols = 8):
        super().__init__(rows, cols)

        self.bot = bot
        self.player_turn = player_turn

    def get_choice_move(self):
        if self.turn == self.player_turn:
            return super().get_move()
        else:
            return self.bot.make_move(self.board)



class Randy(Bot):
    def __init__(self, turn):
        super().__init__(turn)

    def make_move(self, board):
        #print('Randy')
        temp_board = board.get_board()
        moves = self.get_available_moves(temp_board)

        choice = random.choice(moves)
        #print(choice)

        return choice

    def __str__(self):
        return 'Randy'


class Gordon(Bot):
    VAL = [[120, -20, 20,  5,  5, 20, -20, 120],
           [-20, -40, -5, -5, -5, -5, -40, -20],
           [ 20,  -5, 15,  3,  3, 15,  -5,  20],
           [  5,  -5,  3,  3,  3,  3,  -5,   5],
           [  5,  -5,  3,  3,  3,  3,  -5,   5],
           [ 20,  -5, 15,  3,  3, 15,  -5,  20],
           [-20, -40, -5, -5, -5, -5, -40, -20],
           [120, -20, 20,  5,  5, 20, -20, 120]]


    def __init__(self, turn):
        super().__init__(turn)


    def make_move(self, board):
        temp_board = board.get_board()
        moves = self.get_available_moves(temp_board)

        reward = [self.VAL[move[0]][move[1]] for move in moves]

        return moves[reward.index(max(reward))]

    def __str__(self):
        return 'Gordon'



class MiniMax(Gordon):
    min_eval_board = -1776
    max_eval_board = 1776

    def __init__(self, turn, depth):
        super().__init__(turn)
        self.depth = depth


    def eval_board(self, board, turn):
        temp_board = board.get_board()
        total_reward = 0

        for row in range(board.rows):
            for col in range(board.cols):
                if temp_board[row][col] == self.turn:
                    total_reward += self.VAL[row][col]
                if temp_board[row][col] == 3 - self.turn:
                    total_reward -= self.VAL[row][col]

        return total_reward


    def sort_nodes(self, moves):
        sorted_nodes = [[move, self.VAL[move[0]][move[1]]] for move in moves]

        sorted_nodes = sorted(sorted_nodes, key = lambda node: node[1], reverse = True)
        
        return [node[0] for node in sorted_nodes]


    def get_available_moves(self, board, player):
        board.set_available_moves(player)
        temp_board = board.get_board()

        return super().get_available_moves(temp_board)

    
    def minimax_alpha_beta(self, board, depth, player, Alpha, Beta, turn):
        valid_moves = self.get_available_moves(board, player)
        best_value = 0

        if depth == 0 or len(valid_moves) == 0:
            return self.eval_board(board, turn)

        if player == turn:
            tiles = self.sort_nodes(valid_moves)
            best_value = self.min_eval_board

            for piece in tiles:
                board_temp = copy.deepcopy(board)

                board_temp.make_move(player, piece[0], piece[1]) 
                val = self.minimax_alpha_beta(board_temp, depth - 1, 3 - player, Alpha, Beta, turn)
                
                #print(val, "Alpha_Beta_sorted() val maximize_player")

                if val > best_value:
                    best_value = val

                if val > Alpha:
                    Alpha = val

                if Alpha >= Beta:
                    break #beta cut-off
                
            #print(Alpha, "Alpha_Beta_sorted() Alpha maximize_player")
        else: # minimizingPlayer
            tiles = self.sort_nodes(valid_moves)
            best_value = self.max_eval_board

            for piece in tiles:
                board_temp = copy.deepcopy(board)

                board_temp.make_move(player, piece[0], piece[1])  
                val = self.minimax_alpha_beta(board_temp, depth - 1, 3 - player, Alpha, Beta, turn)
                
                #print(val, "Alpha_Beta_sorted() val minimize_player")

                if val < best_value:
                    best_value = val
                
                if val < Beta:
                    Beta = val

                if Alpha >= Beta:
                    break #alpha cut-off

            #print(Beta, "Alpha_Beta_sorted() Beta minimize_player")
        
        #print(best_value, "Alpha_Beta_sorted()", depth)
        return best_value


    def make_move(self, board):
        moves = self.get_available_moves(board, self.turn)
        sorted_tiles = self.sort_nodes(moves)

        max_points = self.min_eval_board
        best_move = []

        for move in sorted_tiles:
            board_temp = copy.deepcopy(board)
            board_temp.make_move(self.turn, move[0], move[1]) 

            points = self.minimax_alpha_beta(board_temp, self.depth, 3 - self.turn, max_points, self.max_eval_board, self.turn)
                    
            if points > max_points:
                max_points = points
                best_move = move
            elif points == max_points:
                if random.randint(0, 1):
                    best_move = move

        #print(best_move, "alpha_beta_sorted_move()")
        return best_move

    
    def __str__(self):
        return "MiniMax"


def play_bot_game(bot1, bot2, display=False):
    print('player 1:', bot1)
    print('player 2:', bot2)
    game = BotGame(bot1, bot2)
    while True:
        if game.game_over():
            break

        if display:
            game.get_status()

        x, y = game.get_move()

        game.make_move(x, y)
        game.next_turn()

    game.get_result()


def play_single_game(bot, player_turn, display=False):
    print('player turn: ', player_turn)
    game = SinglePlayerGame(bot, player_turn)
    play_with_bot(game,display)


def play_multi_game(display=True):
    game = Game()
    game_play(game,display)
    

def game_play(game,display):
    while True:
        if game.game_over():
            break

        if display:
            game.get_status()

        print("Player:", game.get_turn())

        x = input("Input row:")
        y = input("Input column:")
        
        while not game.validate_input(x, y):
            x = input("Input row again:")
            y = input("Input column again:")

        game.make_move(x, y)
        game.next_turn()

    game.get_result()

def play_with_bot(game,display):
    while True:
        if game.game_over():
            break

        if display:
            game.get_status()

        x, y = game.get_choice_move()

        game.make_move(x, y)
        game.next_turn()

    game.get_result()

