import socket

HOST = 'localhost'
PORT = 50007
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.listen(1)
client = None
conn, addr = s.accept()

if(client == None):
    client = conn

if(conn == client):
    print("ok")
elif(conn != client):
    print("no")
    
print ('Connected by', addr)
while 1:
    data = conn.recv(4096)
    if not data: break
    conn.send(data)
conn.close()