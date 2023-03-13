# setup.py

# used for setting up the javascript server.

import json
import os

# create accounts json for holding id and public key
accounts = open("accounts.json", "w")
json.dump([], accounts)
accounts.close()

# create the json for managing files and permissions, directory system 
manager = open("metatree.json", "w")
json.dump([], manager)
manager.close()

# create a simple list of disks and their paths
diskpath = "/home/kali/Projects/bcapi/storage"
os.mkdir(diskpath)
disklist = open("disklist.json", "w")
disks = [diskpath]
json.dump(disks, disklist)
disklist.close()
