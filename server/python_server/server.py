from jsonsocket import Server
from jsonMessage import toClient
from _thread import *
import threading
import socket

from room import Room
from players import Players
from Game import Randy, Gordon, MiniMax


print_lock = threading.Lock()

host = 'LOCALHOST'
port = 8080

server = Server()
client = None

rooms = []
players = []



ServerSideSocket = socket.socket()
try:
    ServerSideSocket.bind((host, port))
except socket.error as e:
    print(str(e))

print('Socket is listening..')
ServerSideSocket.listen(10)


i = "init"

def Main():

    while True:
        client, address = ServerSideSocket.accept()

        # print(client)
        print('Connected to :', address[0], ':', address[1])

        start_new_thread(threaded,(client,))
    
    ServerSideSocket.close()

def boardListToString(board):
    return ' '.join([str(col) for row in board for col in row])

def clearData(data):
    data['code'] = ""
    data['username'] = ""
    data['rooms'].clear()

def findSubString(string, substr):
    str_lower = string.lower()
    sub_lower = substr.lower()
    if sub_lower in str_lower: return True
    else: return False

    
def threaded(conn): 

    new_player = Players()
    new_player.setSocket(conn)
    players.append(new_player)

    while True : 
        data = server.recv(conn)

        if not data or len(data) == 0: 
            print("Client Disconnect: " + conn)
            index = 0
            for p in players:
                if(p.getSocket() == conn):
                    players.pop(index)
                    break
                index += 1

            if(len(rooms) == 0):
                break

            for r in rooms:
                if(r.getNumPlayer() == 2):
                    if(r.findSpectator(conn)):
                        for s in r.getSpectators():
                            if (s.getSocket() == conn):
                                print("Removing Spectator: " + s.getName())
                        r.removeSpectator(conn)
                    else:
                        if(r.getPlayers()[0].getSocket() == conn):
                            print("Removing Player 1: " + r.getPlayers()[0].getName())
                            r.removePlayer(1)
                        elif(r.getPlayers()[1].getSocket() == conn):
                            print("Removing Player 2: " + r.getPlayers()[1].getName())
                            r.removePlayer(2)
                        else:
                            continue

                        r.setTurn(1,1)
                        r.newGame()

                        board = r.getGame().get_board().replace("-1","0")

                        toClient['rooms'].append({
                            "roomId": r.getRoomId(),
                            "currentBoard": board,
                            "clientTurn": r.getPlayers()[0].getTurn(),
                            "nextTurn": r.getGame().get_turn(),
                            "user1": r.getPlayers()[0].getName(),
                            "user2": "#",
                            "score1": r.getGame().get_result()[0],
                            "score2": r.getGame().get_result()[1]
                        })

                        server.send(r.getPlayers()[0].getSocket(), toClient)

                        for s in r.getSpectators():
                            server.send(s.getSocket(), toClient)

                elif(r.getNumPlayer() == 1):
                    if(r.getPlayers()[0].getSocket() == conn):
                        print("Current player's name: " + r.getPlayers()[0].getName())
                        r.removePlayer(1)

            print("Client list: ")
            for p in players:
                print(p.getName())

        print("code: " + data['code'])

        code = data['code']

        print_lock.acquire()

        clearData(toClient)

        #code == 0 ------------------------------------------------------------------------------------------------------------------------------------
        if code == 0:
            print("Code 0")
            # return username of that client
            if(data['name'] == ""):
                for p in players:
                    if(p.getSocket() == conn):
                        print("Name: ",p.getName())
                        if(p.getName() == ""):
                            toClient['username'] == "null"
                        else:
                            toClient['username'] == p.getName()
                        break

            # create new name or change name
            else:
                exist = False
                for p in players:
                    if(p.getName() == data['name'] and p.getSocket() != conn):
                        toClient['state'] = 0
                        exist = True
                        break

                for p in players:
                    if(p.getSocket() == conn and exist is False):
                        p.setName(data['name'])
                        toClient['state'] = 1
                        exist = True
                        break
                
                if(exist == False):
                    p = Players()
                    p.setName(data['name'])
                    p.setSocket(conn)
                    players.append(p)
                    toClient['state'] = 1
        
        #code == 1 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 1:
            print("Code 1")
            # search for rooms with name or just return all rooms
            if(len(rooms) > 0):
                for r in rooms:
                    if(r.getNumPlayer() > 0 and not r.getGame().game_over()):
                        if(findSubString(r.getPlayers()[0].getName(),data['name'])):
                            toClient['rooms'].append({
                                "roomId": r.getRoomId(),
                                "user1": r.getPlayers()[0].getName(),
                                "score1": r.getGame().get_result()[0],
                                "score2": r.getGame().get_result()[1]
                            })
                            if(r.getNumPlayer() == 1):
                                toClient['rooms'][len(toClient['rooms']) - 1].update({
                                    "user2": "#"
                                })
                            else:
                                toClient['rooms'][len(toClient['rooms']) - 1].update({
                                    "user2": r.getPlayers()[1].getName()
                                })

        #code == 2 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 2:
            print("Code 2")
            # create a new room then join it
            r = Room()
            r.addPlayer(conn, 1, data["name"])
            r.setRoomId(len(rooms) + 1)
            rooms.append(r)

            board = r.getGame().get_board().replace("-1","0")
            toClient['rooms'].append({
                "roomId": r.getRoomId(),
                "currentBoard": board,
                "nextTurn": r.getGame().get_turn()
            })

            print("Player 1 inside room")


        #code == 3 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 3:
            print("Code 3")
            # join a room
            for r in rooms:
                if (r.getRoomId() == data['rooms'][0]['roomId']):
                    # join as a player
                    if(r.getNumPlayer() == 1):
                        print("player join")
                        r.addPlayer(conn, 2, data['name'])

                        board = r.getGame().get_board().replace("-1","0")
                        toClient['rooms'].append({
                            "roomId": r.getRoomId(),
                            "currentBoard": board,
                            "clientTurn": 2,
                            "user1": r.getPlayers()[0].getName(),
                            "user2": data['name'],
                            "score1": r.getGame().get_result()[0],
                            "score2": r.getGame().get_result()[1]
                        })
                        server.send(r.getPlayers()[0].getSocket(), toClient)

                    # join as a spectator
                    elif(r.getNumPlayer() == 2):
                        print("spectator join")
                        r.addSpectator(conn, data['name'])
                        print(data['name'] + " is watching")

                        board = r.getGame().get_board().replace("-1","0")
                        toClient['rooms'].append({
                            "roomId": r.getRoomId(),
                            "currentBoard": board,
                            "user1": r.getPlayers()[0].getName(),
                            "user2": r.getPlayers()[1].getName(),
                            "score1": r.getGame().get_result()[0],
                            "score2": r.getGame().get_result()[1]
                        })
                        for s in r.getSpectators():
                            server.send(s.getSocket(), toClient)

                    break

        
        #code == 4 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 4:
            print("Code 4")
            # start the game
            if(data['rooms'][0]['roomId'] == 0): # play with bot
                for p in players:
                    if(p.getSocket() == conn):
                        board = p.getGame().get_board()
                        
                        if(p.getTurn() == 0):
                            p.setTurn(1)
                        
                        if(p.getTurn() == 2):
                            board = board.replace("-1","0")

                        toClient['rooms'].append({
                            "roomId": 0,
                            "currentBoard": board,
                            "clientTurn": p.getTurn(),
                            "nextTurn": p.getGame().get_turn(),
                            "user1": p.getName(),
                            "user2": "Duy",
                            "score1": p.getGame().get_result()[0],
                            "score2": p.getGame().get_result()[1]
                        })
                        
                        break

            else: # play with another player
                for r in rooms:
                    if(r.getRoomId() == data['rooms'][0]['roomId']):
                        if(r.getNumPlayer() == 2):
                            if(r.getState() == 1):
                                r.setState(0)
                            
                            board = r.getGame().get_board().replace("-1","0")
                            toClient['rooms'].append({
                                "roomId": r.getRoomId(),
                                "currentBoard": board,
                                "nextTurn": r.getGame().get_turn(),
                                "user1": r.getPlayers()[0].getName(),
                                "user2": r.getPlayers()[1].getName(),
                                "score1": r.getGame().get_result()[0],
                                "score2": r.getGame().get_result()[1]
                            })

                            server.send(r.getPlayers()[1].getSocket(), toClient)
                            for s in r.getSpectators():
                                server.send(s.getSocket(), toClient)
                            
                            board = r.getGame().get_board()
                            toClient['rooms'][0]['currentBoard'] = board

                            break
        

        #code == 5 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 5:
            print("Code 5")
            # send a move
            x = data['rooms'][0]['moveRow']
            y = data['rooms'][0]['moveCol']

            # play with bot
            if(data['rooms'][0]['roomId'] == 0):
                for p in players:
                    if p.getSocket() == conn:
                        if(x == 8 and y == 8):
                            moveBot = p.getBot().make_move(p.getGame().getBoard())
                            x = moveBot[0]
                            y = moveBot[1]

                        if(p.getGame().validate_input(x,y)):
                            p.getGame().make_move(x,y)
                            p.getGame().next_turn()
                            p.getGame().get_status()
                        
                        board = p.getGame().getBoard()
                        nextTurn = p.getGame().get_turn()
                        if(nextTurn is not p.getTurn()):
                            board = board.replace("-1", "0")
                        
                        if(p.getGame().game_over()):
                            nextTurn = -1
                        
                        toClient['rooms'].append({
                            "roomId": 0,
                            "currentBoard": board,
                            "clientTurn": p.getTurn(),
                            "nextTurn": nextTurn,
                            "user1": p.getName(),
                            "user2": "Duy",
                            "score1": p.getGame().get_result()[0],
                            "score2": p.getGame().get_result()[1]
                        })

                        break

            # play with another player   
            else:
                for r in rooms:
                    if(r.getRoomId() == data['rooms'][0]['roomId']):
                        if(r.getNumPlayer() == 1): # other player quit game
                            board = r.getGame().get_board().replace("-1","0")
                            toClient['rooms'].append({
                                "roomId": r.getRoomId(),
                                "currentBoard": board,
                                "clientTurn": r.getPlayers()[0].getTurn(),
                                "nextTurn": -2,
                                "user1": r.getPlayers()[0].getName(),
                                "user2": "#",
                                "score1": 1,
                                "score2": 0
                            })
                            print("The other quit game")
                        
                        else:
                            print("Row: " + x)
                            print("Col: " + y)

                            if(r.getGame().validate_input(x, y)):
                                r.getGame().make_move(x,y)
                                r.getGame().next_turn()
                                r.getGame().get_status()
                            
                            board = r.getGame().get_board()
                            opponentBoard = board.replace("-1","0")
                            nextTurn = r.getGame().get_turn()
                            toClient['rooms'].append({
                                "roomId": r.getRoomId(),
                                "currentBoard": board,
                                "clientTurn": 0,
                                "nextTurn": nextTurn,
                                "user1": r.getPlayers()[0].getName(),
                                "user2": r.getPlayers()[1].getName(),
                                "score1": r.getGame().get_result()[0],
                                "score2": r.getGame().get_result()[1]
                            })
                            if(r.getPlayers()[0].getTurn() == nextTurn and not r.getGame().game_over()):
                                if(r.getPlayers()[0].getSocket() == conn):
                                    toClient['rooms'][0]['clientTurn'] = r.getPlayers()[1].getTurn()
                                    toClient['rooms'][0]['currentBoard'] = opponentBoard
                                    server.send(r.getPlayers()[1].getSocket(), toClient)
                                    for s in r.getSpectators():
                                        server.send(s.getSocket(), toClient)

                                    toClient['rooms'][0]['currentBoard'] = board

                                else:
                                    toClient['rooms'][0]['clientTurn'] = r.getPlayers()[0].getTurn()
                                    toClient['rooms'][0]['currentBoard'] = board
                                    server.send(r.getPlayers()[0].getSocket(), toClient)

                                    toClient['rooms'][0]['currentBoard'] = opponentBoard
                                    for s in r.getSpectators():
                                        server.send(s.getSocket(), toClient)

                            elif(r.getPlayers()[1].getTurn() == nextTurn and not r.getGame().game_over()):
                                if(r.getPlayers()[0].getSocket() == conn):
                                    toClient['rooms'][0]['clientTurn'] = r.getPlayers()[1].getTurn()
                                    toClient['rooms'][0]['currentBoard'] = board
                                    server.send(r.getPlayers()[1].getSocket(), toClient)

                                    toClient['rooms'][0]['currentBoard'] = opponentBoard
                                    for s in r.getSpectators():
                                        server.send(s.getSocket(), toClient)

                                else:
                                    toClient['rooms'][0]['clientTurn'] = r.getPlayers()[0].getTurn()
                                    toClient['rooms'][0]['currentBoard'] = opponentBoard
                                    server.send(r.getPlayers()[0].getSocket(), toClient)
                                    for s in r.getSpectators():
                                        server.send(s.getSocket(), toClient)
                                    
                                    toClient['rooms'][0]['currentBoard'] = board

                            elif(r.getGame().game_over()):
                                print("Game Over")
                                toClient['rooms'][0]['nextTurn'] = -1
                                toClient['rooms'][0]['currentBoard'] = opponentBoard
                                if(r.getPlayers()[0].getSocket() == conn):
                                    server.send(r.getPlayers()[1].getSocket(), toClient)
                                else:
                                    server.send(r.getPlayers()[0].getSocket(), toClient)

                                for s in r.getSpectators():
                                    server.send(s.getSocket(), toClient)

                        break
                                

        #code == 6 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 6:
            print("Code 6")
            # quit room

            for r in rooms:
                if(r.getRoomId() == data['rooms'][0]['roomId']):
                    if(r.getNumPlayer() == 2):
                        if(r.getPlayers()[0].getSocket() == conn):
                            r.removePlayer(1)
                        else:
                            r.removePlayer(2)
                        r.setTurn(1,1)

                        if(data['rooms'][0]['state'] == 0):
                            board = r.getGame().get_board().replace("-1","0")
                            nextTurn = 0
                            toClient['rooms'].append({
                                "roomId": r.getRoomId(),
                                "currentBoard": board,
                                "clientTurn": r.getPlayers()[0].getTurn(),
                                "nextTurn": nextTurn,
                                "user1": r.getPlayers()[0].getName(),
                                "user2": "#",
                                "score1": r.getGame().get_result()[0],
                                "score2": r.getGame().get_result()[1],
                                "state": 1
                            })
                        
                        else:
                            board = r.getGame().get_board()
                            nextTurn = -2
                            toClient['rooms'].append({
                                "roomId": r.getRoomId(),
                                "currentBoard": board,
                                "clientTurn": r.getPlayers()[0].getTurn(),
                                "nextTurn": nextTurn,
                                "user1": r.getPlayers()[0].getName(),
                                "user2": "#",
                                "score1": 1,
                                "score2": 0,
                                "state": 1
                            })

                        server.send(r.getPlayers()[0].getSocket(), toClient)
                        
                    
                    elif(r.getNumPlayer() == 1):
                        r.removePlayer(1)
                        toClient['rooms'].append({
                            "state": 0
                        })

                    for s in r.getSpectators():
                        server.send(s.getSocket(), toClient)
                    
                    toClient['rooms'][0]['state'] = 0

                    break

        #code == 7 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 7:
            print("Code 7")
            # play again
            if(data['rooms'][0]['roomId'] == 0):
                for p in players:
                    if(p.getSocket() == conn):
                        p.newGame()
                        board = p.getGame().get_board().replace("-1","0")
                        nextTurn = 4

                        if(p.getTurn() == 1):
                            p.setTurn(2)
                        else:
                            p.setTurn(1)
                        
                        toClient['rooms'].append({
                            "roomId": 0,
                            "currentBoard": board,
                            "clientTurn": p.getTurn(),
                            "nextTurn": nextTurn,
                            "user1": p.getName(),
                            "user2": "Duy",
                            "score1": p.getGame().get_result()[0],
                            "score2": p.getGame().get_result()[1]
                        })

                        break
            
            else:
                for r in rooms:
                    if(r.getRoomId() == data['rooms'][0]['roomId']):

                        board = r.getGame().get_board().replace("-1","0")

                        if(r.getNumPlayer() == 1):  # if there is 1 player in a room, set as host
                            r.newGame()
                            
                            nextTurn = 3

                            print("Play again: " + r.getPlayers()[0].getName())

                            toClient['rooms'].append({
                                "roomId": r.getRoomId(),
                                "currentBoard": board,
                                "clientTurn": r.getPlayers()[0].getTurn(),
                                "nextTurn": nextTurn,
                                "user1": r.getPlayers()[0].getName(),
                                "user2": "#",
                                "score1": r.getGame().get_result()[0],
                                "score2": r.getGame().get_result()[1]
                            })
                        elif(r.getNumPlayer() == 2):
                            # if clicked first
                            print("State: " + r.getState())
                            if(r.getState() == 0):
                                # wait for another player's response
                                r.setState(1)
                                r.newGame()

                                nextTurn = 0

                                toClient['rooms'].append({
                                    "roomId": r.getRoomId(),
                                    "currentBoard": board,
                                    "nextTurn": nextTurn,
                                    "user1": r.getPlayers()[0].getName(),
                                    "user2": r.getPlayers()[1].getName(),
                                    "score1": r.getGame().get_result()[0],
                                    "score2": r.getGame().get_result()[1]
                                })
                            
                            elif(r.getState() == 1):
                                r.swapTurn()
                                toClient['rooms'].append({
                                    "roomId": r.getRoomId(),
                                    "currentBoard": board,
                                    "clientTurn": 0,
                                    "nextTurn": r.getGame().get_turn(),
                                    "user1": r.getPlayers()[0].getName(),
                                    "user2": r.getPlayers()[1].getName(),
                                    "score1": r.getGame().get_result()[0],
                                    "score2": r.getGame().get_result()[1]
                                })
                                if(r.getPlayers()[0].getSocket() == conn):
                                    toClient['rooms'][0]['clientTurn'] = r.getPlayers()[1].getTurn()
                                    server.send(r.getPlayers()[1].getSocket(), toClient)

                                    toClient['rooms'][0]['clientTurn'] = r.getPlayers()[0].getTurn()
                                else:
                                    toClient['rooms'][0]['clientTurn'] = r.getPlayers()[0].getTurn()
                                    server.send(r.getPlayers()[0].getSocket(), toClient)

                                    toClient['rooms'][0]['clientTurn'] = r.getPlayers()[1].getTurn()

                        for s in r.getSpectators():
                            server.send(s.getSocket(), toClient)
                        
                        break

        #code == 8 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 8:
            print("Code 8")
            # spectator quit room
            for r in rooms:
                if(r.getRoomId() == data['rooms'][0]['roomId']):
                    r.removeSpectator(conn)
                    print("Remained Spectators: ")
                    for s in r.getSpectators():
                        print(s.getName())
                    
                    break

            toClient['rooms'].append({
                "state": 0
            })

        
        #code == 9 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == 9:
            print("Code 9")
            # play with bot
            diff = data['difficulty']
            for p in players:
                if(p.getSocket() == conn):

                    board = p.getGame().get_board().replace("-1","0")
                    nextTurn = 0

                    toClient['rooms'].append({
                        "roomId": 0,
                        "currentBoard": board,
                        "clientTurn": p.getTurn(),
                        "nextTurn": nextTurn,
                        "user1": p.getName(),
                        "user2": "Duy",
                        "score1": p.getGame().get_result()[0],
                        "score2": p.getGame().get_result()[1],
                        "state": 1
                    })

                    if(diff == 0): # exit bot
                        p.newGame()
                        toClient['rooms'][0]['state'] = 0

                    elif(diff == 1): # easy mode
                        bot = Randy(2)
                        p.setBot(bot)
                    
                    elif(diff == 2): # medium mode
                        bot = Gordon(2)
                        p.setBot(bot)

                    elif(diff == 3): # hard mode
                        bot = MiniMax(2, 3)
                        p.setBot(bot)

                    break


        server.send(conn,toClient)

        print_lock.release()



if __name__ == '__main__':
    Main()