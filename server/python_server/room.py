from Game import Game
from players import Players

class Room(object):
    roomId = 0
    numPlayer = 0
    state = 0
    players = []
    spectators = []
    game = None

    def __init__(self):
        self.numPlayer = 1
        self.state = 1
        self.game = Game()

    def getGame(self):
        return self.game

    def setNumPlayer(self, num):
        self.numPlayer = num

    def getNumPlayers(self):
        return self.numPlayer

    def setRoomId(self, roomId):
        self.roomId = roomId

    def getRoomId(self):
        return self.roomId
    
    def setState(self, state):
        self.state = state

    def getState(self):
        return self.state

    def addPlayer(self, socket, turn, name):
        p = Players()
        p.setSocket(socket)
        p.setTurn(turn)
        p.setName(name)
        self.players.append(p)

    def removePlayer(self, index):
        self.players.pop(index-1)

    def addSpectator(self, socket, name):
        p = Players()
        p.setSocket(socket)
        p.setName(name)
        self.spectators.append(p)

    def removeSpectator(self, socket):
        index = 0
        for s in self.spectators:
            if(s.getSocket() == socket):
                self.spectators.pop(index)
                break
            index += 1
        
    def removeAllSpectators(self):
        self.spectators.clear()

    def setTurn(self, index, turn):
        self.players[index-1].setTurn(turn)

    def swapTurn(self):
        temp = self.players[0].getTurn()
        self.players[0].setTurn(self.players[1].getTurn())
        self.players[1].setTurn(temp)

    def getPlayers(self):
        return self.players

    def getSpectators(self):
        return self.spectators

    def findSpectator(self, socket):
        for s in self.spectators:
            if(s.getSocket() == socket):
                return True
        return False
        
        