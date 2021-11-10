import socket, pickle, time

HOST = 'localhost'
PORT = 50007
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))


arr = ([1,2,3,4,5,6],[1,2,3,4,5,6])
print(arr[0][2])
data_string = pickle.dumps(arr)

while 1:
    s.send(data_string)
    print(data_string)
    data = s.recv(4096)
    data_arr = pickle.loads(data)
    print ('Received', repr(data_arr))
    time.sleep(1)