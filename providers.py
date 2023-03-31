# providers.py

# This script is used to append or remove a new provider that registers
# with the system. When a bucket is being registered with the cloud
# file manager, they will need to provide:
# (ProjectID, keyfile-path)
# we need to add this information to bucketlist.json

# usage:
# python3 providers.py <append|remove> <provider public address> <project> <bucket number> <keyfile path|null>

import json
import sys

bucketlist = "bucketlist"
argv = sys.argv[1]
funcs = {"append":append_provider,
         "remove":remove_provider}

def append_provider(sargv, jfile):
    # retrieve the google cloud project and the bucket identifier
    # as well as the keypath to allow permission for access accounts
    provider_id = sargv[2]
    project = sargv[3]
    bucket_num = sargv[4]
    keyfile_path = sargv[5]
    print(f"Appending ({provider_id}, {project}, {bucket_num}, {keyfile_path})")
    # load the bucket list file
    jdata = json.load(jfile)
    # create a new provider entry
    provider_new = {"provider":provider_id, "project":project, "bucket":bucket_num, "keyfile":keyfile_path}
    # add the new provider (of cloud disk storage) and save the file
    jdata.append(provider_new)
    json.dump(jdata, jfile)
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
     
try:
    jfile = open(bucketlist, 'r+')
    cmd = argv[1]
    funcs[cmd](argv, jfile)
except Exception as err:
    print(f"Failed to run the command! {err}")
