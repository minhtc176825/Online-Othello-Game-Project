from jsonsocket import Client
from jsonMessage import toServer
import time
import socket

host = 'LOCALHOST'
port = 8080

client = Client()
ClientMultiSocket = socket.socket()

print('Waiting for connection response')
try:
    ClientMultiSocket.connect((host, port))
except socket.error as e:
    print(str(e))

while True:

    # toServer['code'] = "0"

    # MESSAGE = input("Enter message to continue:")

    # toServer['username'] = MESSAGE

    # client.send(ClientMultiSocket, toServer)



    # response = client.recv(ClientMultiSocket)

    # print (response["state"])
    # print (response["username"])

    time.sleep(1)

client.close()