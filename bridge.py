# bridge.py
# script to provide some friendly interfaces to bridge the API.

import requests
import json
from web3 import Web3
from eth_account.messages import encode_defunct
import base64

url_path = None
web = Web3()

def set_connection(ip, port):
    global url_path
    url_path = f"http://{ip}:{port}/"

def upload_file(user_id, prikey, filename, file):
    # note filename should be string
    url = url_path + "upload_file"
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
    url = url_path + "add_user"
    print(f"DEBUG: Trying to access the URL {url}")
    signpackage = sign_message(user_id, prikey)
    user_id_hash = signpackage[0]
    sign_v, sign_r, sign_s = signpackage[1]

    b64_user_id = base64.b64encode(user_id.to_bytes((user_id.bit_length()+7)// 8, 'big')).decode()
    print(f"I am mostly worried about the hash. {user_id_hash}")
    print(f"When we turn it into hex, we get: {user_id_hash.hex()[2:]}")
    b64_user_id_hash = base64.b64encode(bytes.fromhex(user_id_hash.hex()[2:])).decode()
    b64_v = base64.b64encode(sign_v.to_bytes((sign_v.bit_length()+7)// 8, 'big')).decode()
    b64_r = base64.b64encode(sign_r.to_bytes((sign_r.bit_length()+7)// 8, 'big')).decode()
    b64_s = base64.b64encode(sign_s.to_bytes((sign_s.bit_length()+7)// 8, 'big')).decode()

    headers = {"Content-Type": "application/json"}
    data = {
                "metadata": {
                    "id":b64_user_id,
                    "id_hash":b64_user_id_hash,
                    "sign_v":b64_v,
                    "sign_r":b64_r,
                    "sign_s":b64_s
                }
            }
    
    payload = json.dumps(data)
    print(f"Sending payload {payload}...")
    res = requests.post(url, headers=headers, data=payload)
    print(f"Result = {res}")

    return res

def sign_message(message, prikey):
    # sign a message of choice from the user
    # expectation is that message is bytes object. encode any strings!
    account = web.eth.account.from_key(prikey)
    print(f"The message is {message} and the type is {type(message)}")
    messagehex = hex(message)[2:]
    print(f"The sign message type is {message} and message hex is {messagehex}")
    encoded_message = encode_defunct(hexstr=messagehex)
    signed = account.sign_message(encoded_message)
    print(f"The type of signed {signed} is {type(signed)}")
    v = signed.v
    r = signed.r
    s = signed.s
    signpackage = (signed.messageHash, (v, r, s))

    print(f"\n\n>>> WARNING <<<")
    print(f"Currently the hash is sent as {type(signpackage[0])}")
    print(f"The data types for v, r, s is {type(v)}, {type(r)}, {type(s)}")
    print(f"This may cause the request to CRASH!")
    print(f"In the case it doesn't, it is safe to remove this warning")
    print(f"\n\n")
     
    return signpackage


