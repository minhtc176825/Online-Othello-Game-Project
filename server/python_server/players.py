from Game import *


class Players(object):
    game = None
    bot = None
    socket = 0
    name = ""
    turn = 0
    rank = 0

    def __init__(self):
        self.game = Game()
        self.socket = 0
        self.turn = 0
        self.name = ""
        self.bot = Bot(0)

    def getSocket(self):
        return self.socket

    def setSocket(self, socket):
        self.socket = socket

    def getTurn(self):
        return self.turn

    def setTurn(self, turn):
        self.turn = turn
        self.bot.set_turn(3 - turn)

    def getName(self):
        return self.name

    def setName(self, name):
        self.name = name

    def getRank(self):
        return self.rank

    def setRank(self, rank):
        self.rank = rank

    def getGame(self):
        return self.game

    def getBot(self):
        return self.bot

    def setBot(self, bot):
        self.bot = bot
        self.turn = 0

    def newGame(self):
        self.game = Game()
    