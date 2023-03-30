from bridge import *
import hashlib as hlib

ip = "10.13.37.127"
port = "3000"

set_connection(ip, port)

# test number 1: we add a new user to the system
user_id = None # PLEASE PUT YOUR PUBLIC ADDRESS HERE
prikeyfile = "" # PLEASE PUT YOUR PRIVATE KEY FILE HERE
prikey = None
with open(prikeyfile, 'r') as file:
    prikey = file.read()

add_user(user_id, prikey)

# test number 2: we add a file to the system
fname = "MySecretPasswords.txt"
with open(fname, "w") as file:
    # there may still be an issue if we write binary files
    val = "Hello World!"
    file.write(val)
file = open(fname, "r")
# testing purposes allows this, but user_hash is wrong in reality
upload_file(user_id, prikey, fname, file)
file.close()

# test number 3: modify the file and save it again
with open(fname, "a") as file:
    val = "\nGoodbye World!"
    file.write(val)
file = open(fname, "r")
upload_file(user_id, prikey, fname, file)
file.close()


