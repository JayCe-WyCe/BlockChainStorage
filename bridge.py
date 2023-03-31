# bridge.py
# script to provide some friendly interfaces to bridge the API.

import requests
import json
from web3 import Web3
from eth_account.messages import encode_defunct

url_path = None
web = Web3()

def set_connection(ip, port):
    global url_path
    url_path = f"http://{ip}:{port}/"

def upload_file(user_id, prikey, filename, file):
    # note filename should be string
    url = url_path + "/upload_file"
    signpackage = sign_message(filename.encode(), prikey)
    filehash = signpackage[0]
    sign_v, sign_r, sign_s = signpackage[1]
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

def add_user(user_id, prikey):
    # add a new user to the system - note: user_id should be int
    url = url_path + "/add_user"
    print(f"DEBUG: Trying to access the URL {url}")
    signpackage = sign_message(user_id, prikey)
    user_id_hash = signpackage[0]
    sign_v, sign_r, sign_s = signpackage[1]

    payload = {"id":user_id,
               "id_hash":user_id_hash,
               "sign_v":sign_v,
               "sign_r":sign_r,
               "sign_s":sign_s}
    res = requests.post(url, json=payload)

    return res

def sign_message(message, prikey):
    # sign a message of choice from the user
    # expectation is that message is bytes object. encode any strings!
    account = web.eth.account.from_key(prikey)
    encoded_message = encode_defunct(hexstr=message.hex())
    signed = account.sign_message(encoded_message)
    v = hex(signed.v)
    r = hex(signed.r)
    s = hex(signed.s)
    signpackage = (signed.messageHash, (v, r, s))

    print(f"\n\n>>> WARNING <<<\n\n")
    print(f"Currently the hash is sent as {type(signpackage[0])}")
    print(f"This may cause the request to CRASH!")
    print(f"In the case it doesn't, it is safe to remove this warning")
    print(f"\n\n")
     
    return signpackage

k = signed_package = sign_message('ree'.encode(), '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')

