from bridge import *

ip = "http://10.13.37.127"
port = ":3000"

set_connection(ip, port)

# test number 1: we add a new user to the system
user_id = 727
pbkey = 1337

success_flag = add_user(user_id, pbkey)
print(f"Return type: {type(success_flag)}\nReturn value:\n{success_flag}")

# test number 2: we add a few more users to the system

collections = {728:1338, 729:1339, 730:1340}
for c in collections:
    success_flag = add_user(c, collections[c])
    print(f"Return type: {type(success_flag)}\nReturn value:\n{success_flag}")

# test number 3: we try to upload a file
filename = "somethingelse.txt"
file = open(filename, "rb")
success_flag = upload_file(user_id, pbkey, filename, file)
print(f"Return type: {type(success_flag)}\nReturn value:\n{success_flag}")
