# providers.py

# This script is used to append or remove a new provider that registers
# with the system. When a bucket is being registered with the cloud
# file manager, they will need to provide:
# (ProjectID, keyfile-path)
# we need to add this information to bucketlist.json

# usage:
# python3 providers.py <append|remove> <provider public address> <project> <bucket number> <bucket size GB> <keyfile path|null>

import json
import sys

bucketlist = "bucketlist.json"
argv = sys.argv

def append_provider(sargv, jfile):
    # retrieve the google cloud project and the bucket identifier
    # as well as the keypath to allow permission for access accounts
    provider_id = sargv[2]
    project = sargv[3]
    bucket_num = sargv[4]
    bucket_size = sargv[5]
    keyfile_path = sargv[6]
    print(f"Appending ({provider_id}, {project}, {bucket_num}, {bucket_size}, {keyfile_path})")
    # load the bucket list file
    jdata = json.load(jfile)
    print(f"Test jdata is : {jdata}")
    # create a new provider entry
    # NOTE: "free" keeps track of free space. We want to subtract this number whenever adding a file, and add when freeing.
    provider_new = {"provider":provider_id, "project":project, "bucket":bucket_num, "size":bucket_size, "free":bucket_size, "keyfile":keyfile_path}
    # add the new provider (of cloud disk storage) and save the file
    jdata.append(provider_new)
    print(f"jdata is now: {jdata}")
    json.dump(jdata, jfile, indent=4)
    jfile.close()

def remove_provider(sargv, jfile):
    # retrieve the google cloud project and the bucket identifier
    provider_id = sargv[2]
    project = sargv[3]
    bucket_num = sargv[4]
    # load the bucket list file
    jdata = json.load(jfile)
    # find the entry if it exists, and remove it
    for jentry in jdata:
        if(jentry["provider"]==provider_id and jentry["project"]==project and jentry["bucket"]==bucket_num):
            jdata.remove(jentry)
            break
    # save the file
    json.dump(jdata, jfile)
    jfile.close()

funcs = {"append":append_provider,
         "remove":remove_provider}
   
try:
    print(f"Debug: opening the file bucketlist")
    jfile = open(bucketlist, 'r+')
    cmd = argv[1]
    print(f"The command is {cmd}, file is {jfile}")
    funcs[cmd](argv, jfile)
except Exception as err:
    print(f"Failed to run the command! {err}")
