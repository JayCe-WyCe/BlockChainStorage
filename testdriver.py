from bridge import *

ip = "http://10.13.37.127"
port = ":3000"

set_connection(ip, port)

# test number 1: we add a new user to the system
user_id = 727
pbkey_v = 1337
pbkey_r = 1338
pbkey_s = 1339

add_user(user_id, pbkey_v, pbkey_r, pbkey_s)

# test number 2: we add a file to the system
fname = "MySecretPasswords.txt"
file = open(fname)
upload_file(user_id, fname, file)


