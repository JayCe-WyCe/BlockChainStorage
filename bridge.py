# bridge.py
# script to provide some friendly interfaces to bridge the API.

import requests
import hashlib as hlib
import json

url_path = None

def set_connection(ip, port):
    global url_path
    url_path = f"http://{ip}:{port}/"

def upload_file(user_id, filename, filehash,
                sign_v, sign_r, sign_s, file):
    url = url_path + "/upload_file"
    print(f"DEBUG: Trying to access the URL {url}")
    headers = {"Content-Type": "application/json"}
    data = {
        "filecontent": file.read(),
        "metadata": {
            "id": user_id,
            "filename": filename,
            "filehash": filehash,
            "sign_v": sign_v,
            "sign_r": sign_r,
            "sign_s": sign_s
        }
    }
    payload = json.dumps(data)
    res = requests.post(url, headers=headers, data=payload)
    return res

def content_hash(data):
    sha = hlib.sha256()
    sha.update()

    
def add_user(user_id, user_id_hash, sign_v, sign_r, sign_s):
    # add a new user to the system
    url = url_path + "/add_user"
    print(f"DEBUG: Trying to access the URL {url}")
    payload = {"id":user_id,
               "id_hash":user_id_hash,
               "sign_v":sign_v,
               "sign_r":sign_r,
               "sign_s":sign_s}
    res = requests.post(url, json=payload)

    return res

