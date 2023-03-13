# bridge.py
# script to provide some friendly interfaces to bridge the API.

import requests

url_ip = None
url_port = None

def set_connection(ip, port):
    global url_ip, url_port
    url_ip = ip
    url_port = port

def upload_file(user_id, user_sig, filename, file):
    # add a new file to the system
    url = url_ip + url_port + "/upload_file"
    print(f"DEBUG: Trying to access the URL {url}")
    filedata = {"file":(filename, file)}
    metadata = {"id":user_id, "signature":user_sig}
    res = requests.post(url, files=filedata, data=metadata)

    return res

def add_user(user_id, pubkey):
    # add a new user to the system
    url = url_ip + url_port + "/add_user"
    print(f"DEBUG: Trying to access the URL {url}")
    payload = {"id":user_id, "pubkey":pubkey}
    res = requests.post(url, json=payload)

    return res

