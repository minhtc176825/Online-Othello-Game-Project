from jsonsocket import Server
from jsonMessage import toClient
from _thread import *
import threading
import socket

from room import Room
from players import Players


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

    while True : 
        data = server.recv(conn)

        print("code: " + data['code'])

        code = data['code']

        print_lock.acquire()

        clearData(toClient)

        #code == 0 ------------------------------------------------------------------------------------------------------------------------------------
        if code == "0":
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
        elif code == "1":
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
        elif code == "2":
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
        elif code == "3":
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

        
        #code == 4 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == "4":
            print("Code 4")
            # start the game


        server.send(conn,toClient)

        print_lock.release()



if __name__ == '__main__':
    Main()