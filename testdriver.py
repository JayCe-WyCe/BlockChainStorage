from bridge import *
import hashlib as hlib

ip = "10.13.37.127"
port = "3000"

set_connection(ip, port)

# test number 1: we add a new user to the system
user_id = 727
sign_v = 1337
sign_r = 1338
sign_s = 1339

sha = hlib.sha256()
sha.update(str(user_id).encode('ASCII'))
user_hash = sha.hexdigest()

add_user(user_id, user_hash, sign_v, sign_r, sign_s)

# test number 2: we add a file to the system
fname = "MySecretPasswords.txt"
with open(fname, "w") as file:
    # there may still be an issue if we write binary files
    val = "Hello World!"
    file.write(val)
file = open(fname, "r")
# testing purposes allows this, but user_hash is wrong in reality
upload_file(user_id, fname, user_hash, sign_v, sign_r, sign_s, file)
file.close()

# test number 3: modify the file and save it again
with open(fname, "a") as file:
    val = "\nGoodbye World!"
    file.write(val)
file = open(fname, "r")
upload_file(user_id, fname, user_hash, sign_v, sign_r, sign_s, file)
file.close()


