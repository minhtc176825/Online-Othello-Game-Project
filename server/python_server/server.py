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
    data['roomId'] = ""
    data['currentBoard'] = ""
    data['currentTurn'] = ""
    data['nextTurn'] = ""
    data['user1'] = ""
    data['user2'] = ""
    data['score1'] = ""
    data['score2'] = ""
    data['state'] = ""


    
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
            if(data['username'] == ""):
                for p in players:
                    if(p.getSocket() == conn):
                        print("Name: ",p.getName())
                        if(p.getName() == ""):
                            toClient['username'] == "null"
                            server.send(conn,toClient)
                        else:
                            toClient['username'] == p.getName()
                            server.send(conn,toClient)
                        break

            # create new name or change name
            else:
                exist = False
                for p in players:
                    if(p.getName() == data['username'] and p.getSocket() != conn):
                        toClient['state'] = 0
                        server.send(conn,toClient)
                        exist = True
                        break
                    elif(p.getSocket() == conn):
                        p.setName(data['username'])
                        toClient['state'] = 1
                        server.send(conn,toClient)
                        exist = True
                        break
                
                if(exist == False):
                    p = Players()
                    p.setName(data['username'])
                    p.setSocket(conn)
                    players.append(p)
                    toClient['state'] = 1
                    server.send(conn,toClient)
        
        #code == 1 ------------------------------------------------------------------------------------------------------------------------------------
        elif code == "1":


        print_lock.release()



if __name__ == '__main__':
    Main()