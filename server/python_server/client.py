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

    MESSAGE = input("Enter code to continue:")
    toServer['code'] = MESSAGE

    MESSAGE = input("Enter name:")
    toServer['name'] = MESSAGE

    if toServer['code'] == "3":
        MESSAGE = input("Enter roomId:")
        toServer['rooms'].append({
            "roomId": int(MESSAGE)
        })

    # toServer['username'] = MESSAGE

    client.send(ClientMultiSocket, toServer)



    response = client.recv(ClientMultiSocket)

    print(response)


    time.sleep(1)

client.close()