roject Dependencies
Before running the setup scripts for the project, please make sure all of the required dependencies are installed.

NPM
Express
Body-parser
Web3
@openzeppelin/merkle-tree
Fs
@google-cloud/storage
Python
Web3
Google-cloud-storage
Infrastructure
Make sure that there is at least one Google account. There will need to be a VM-instance hosting a Linux virtual machine and at least one bucket set up. A service account needs to be added for a bucket, and the private key to access that bucket will need to be imported into the VM. Make sure that there are at least two MetaMask accounts, one for the server and one for the user. The Sepolia test network is used. The fileImport folder contains the temp_key for the server owner.

Scripts
Assuming that dependencies are satisfied, and the infrastructure is ready, separate the script files into two parts:

Client-side
Bridge.py
Testdriver.py
Server-side
The rest of the files
Run setup.py on the server to generate metatree.json, bucketlist.json, and keyfiles folder. Please move all bucket access keys into the keyfiles folder. Check to make sure that metatree.json only contains an empty array, i.e., []. Make sure that bucketlist.json only contains an empty array, i.e., [].

Next, run providers.py to set up bucket providers. The syntax to do this can be found as a comment in the file. For instance,

