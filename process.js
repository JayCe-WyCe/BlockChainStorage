//process.js
/*
	This javascript file is used as utility for the main server script to abstract
	away the code clutter. Note that this is simply for auxillary functions.
*/
const fs = require('fs');
const StandardMerkleTree = require( "@openzeppelin/merkle-tree");

const Web3 = require('web3');
const filesyscontrol = require("./filesyscontrol");
const googlebucket = require("./googlebucket")

const filename_accounts = "accounts.json";
const filename_disklist = "bucketlist.json"; 

const providerAddr = "https://eth-sepolia.g.alchemy.com/v2/m5xr5zKeM3WLGQL2l_pbLYkWwIhdAXl-";
const web3 = new Web3(providerAddr);
let key_str = fs.readFileSync('fileImports/temp_key.txt', 'ascii').replace('\r', '')
var keys = key_str.split('\n')
var privKey = keys[0];
var wallet = web3.eth.accounts.privateKeyToAccount(privKey);
var ownerAddr = wallet.address;

const fileAbiPath = "fileImports/filePermAbiLatest.json";
const fileAbi = JSON.parse(fs.readFileSync(fileAbiPath).toString());

const contractAddr = "0x308f37D38DD6af6fCF22f71d4CFB0153008f2449";
const contractAPI = new web3.eth.Contract(fileAbi, contractAddr);

/*Function: add a new user to the user json*/
async function insert_user(id, identifier){
	var successful_insert = await filesyscontrol.create_user_entry(id);
	return successful_insert;
}


// This function will create the merkle tree for user, and then make the call the the end to update/add the merkle tree in metadata as well as on the blockchain.
// updateUserHash is the contract function used for updating the blockchain data.
function setUserMerkleData(userAddr,fileName,identifier)
{
var fileName_list=[]
console.log(`Testing log:  ${fileName}`)
var existing_file = filesyscontrol.check_file_existence(userAddr, fileName);
if(existing_file===null || existing_file===undefined )
{
	merkle_json=filesyscontrol.getMerkleTree(userAddr)
	if(merkle_json !== null && merkle_json!= undefined && merkle_json!== '')
	{
		console.log("loading tree",JSON.parse(JSON.stringify(merkle_json)))
		const userTree=StandardMerkleTree.StandardMerkleTree.load(JSON.parse(merkle_json))
		for (const [i, v] of userTree.entries()) 
		{
			fileName_list.push(v)	
			fileName_list.push([fileName])
		}	
	}
	fileName_list.push([fileName])
	console.log(`Merkle tree is being built using  ${fileName_list}`)
	const tree=StandardMerkleTree.StandardMerkleTree.of(fileName_list,['string'])

	const root=tree.root
	console.log("merkle root:",root)
	filesyscontrol.setMerkleTree(userAddr,tree)
	updateUserHash(userAddr,root,identifier)
	
	
}
};	

async function authenticate(addr, signatureObj){
	var authenticated = false;
	console.log(`[func] authenticate: Taking in params ${addr}, ${JSON.stringify(signatureObj)}`);
	var ret_addr = await contractAPI.methods.VerifyMessage(signatureObj["hashedMessage"], signatureObj["v"], signatureObj["r"], signatureObj["s"]).call();
	// check if the user owns this account
	console.log("This is the authentication. This message should appear BEFORE the addUser function!");
	console.log(`Attempting authentication... ${addr} === ${ret_addr} ? ${parseInt(addr, 16)===parseInt(ret_addr, 16)}`);
	if(parseInt(addr, 16)===parseInt(ret_addr, 16)){
		authenticated = true;
	}
	console.log(authenticated);

	return authenticated;
}

// function to deal with 1. updating metadata, and 2. saving the actual file
function manage_upload(id, filename, filenamehash, filecontent){
	console.log(`manage_upload called with parameters id ${id}, filename ${filename}, filecontent ${filecontent}`);
	var existing_file = filesyscontrol.check_file_existence(id, filename);
	if(existing_file===null){
		// the file is new and so a new record needs to be inserted
		console.log(`The file does not already exist, so we have to upload it as a new file!`);
		var replication_factor=2
		var diskbucket = upload_new(id, filenamehash, filename,replication_factor,filecontent);
		//fs.writeFileSync(diskpath+"/"+filename, filecontent);
	} else {
		// the file is already in the system, so only need to save the file

		// WE NEED TO UPDATE THE METADATA TOO ACTUALLY! SINCE WE ADDED FILESIZE!
		// added function upload_existing() below to handle
		// I added one auxillary function to help :) It is called update_file_metadata()
		// The existing_file variable above is actually the file, so you can modify the attributes directly
		// (refer to filesyscontrol.js) after modifying the values, use update_file_metadata() to update metatree
		upload_existing();

		// existing_file is a file metadata object, which contains filename, diskpath, and collaborators etc.
		console.log(`The file is not new, so we just need to save it again with no changes to metadata`);
		var diskbucket = existing_file["diskbucket"];
		//fs.writeFileSync(diskpath+"/"+filename, filecontent);
	}
// store the actual file (may be inside if-statement if applicable)
		// --> call the gc_upload file function here
		// --> update the blockchain?
		// TODO
		/* DON'T FORGET TO MIRROR THESE ACTIONS ON THE OTHER BRANCH IN manage_upload()*/
		
}

// This function handles the logic for downloading the file from buckets.
// If user has access, it tries to download the file from the first bucket in the list, if that bucket is not available it will go to the next bucket until it finds the file.
function manageDownload(userAddr, filename){

	var fileBuckets= filesyscontrol.getFileBuckets(userAddr,filename)
	
	for(var i=0;i<fileBuckets.length;i++)
	{
		var bucket=fileBuckets[i]
		var bucket_name=bucket['bucket']
		var bucket_key=bucket['keyfile']
		var bucket_project_id=bucket["project"]
		var bucket_provider={
  			projectId: 'bucket_project_id',
  			keyFilename: 'bucket_key'
		};
		if(googlebucket.gc_checkBucketStatus(bucket_name,bucket_provider))
		{
			data=googlebucket.gc_readFile(bucketName,userAddr,filename,bucket_provider)
			return data;
		}
		else
		{
			continue;
		}

	}
	console.log("File not available- None of the buckets had the file.")
};

// Verifies the user's access to download a file using merkle tree and root.
async function authenticateFileAccess(userAddr,filename)
{
	var userRootMap;
	var root=await getUserRootBC(userAddr)
	console.log("Inside authenticateFileAccess, print root:",root)
	var merkle_json=filesyscontrol.getMerkleTree(userAddr)
	const userTree=StandardMerkleTree.StandardMerkleTree.load(JSON.parse(merkle_json))
	for (const [i, v] of userTree.entries()) {
		if(v[0]==filename)
		{
			const proof = userTree.getProof(i);
			const isAuth=StandardMerkleTree.StandardMerkleTree.verify(root,['string'],[filename],proof)
			return isAuth
		}
	}
	return false
};


		
function upload_existing(userAddr,filename,fileContent){
        var fileBuckets= filesyscontrol.getFileBuckets(userAddr,filename)
	for(var i=0;i<fileBuckets.length;i++)
	{
		var bucket=fileBuckets[i]
		var bucket_name=bucket['bucket']
		var bucket_key=bucket['keyfile']
		var bucket_project_id=bucket["project"]
		var bucket_provider={
  			projectId: bucket_project_id,
  			keyFilename: bucket_key
		};
		gc_uploadFile(bucket_name,userAddr,filename,bucket_provider,fileContent)	
	}
}

// note: we need to modify to include file ID. also edit filesyscontrol.create_file_entry()
function upload_new(id, filename, filenamehash, replication_factor,filecontent) {
    // we now wish to store the file, we assume we are already authenticated.
    // two parts: first, generate disk. second, add the file to metatree.
    console.log(`upload_new called, checking to update metadata...`);
    var diskbuckets = [];
    if (fs.existsSync(filename_disklist)) {
        // we get a list of disks (buckets) available to us specified in disklist
        var disklist_file = fs.readFileSync(filename_disklist)
        var disklist = JSON.parse(disklist_file);
        console.log(`Reading in disklist gives a result ${disklist} with length ${disklist.length}`);

        // shuffle the disklist and pick the first n entries
        disklist = shuffleArray(disklist);
        var n = Math.min(replication_factor, disklist.length);
        disklist = disklist.slice(0, n);

        // pick n buckets to store the file in
        for (var i = 0; i < disklist.length; i++) {
            var diskbucket = disklist[i];
			var bucket_name=diskbucket['bucket']
			var bucket_key=diskbucket['keyfile']
			var bucket_project_id=diskbucket["project"]
			var bucket_provider={
  			projectId: bucket_project_id,
  			keyFilename: bucket_key
		};
			gc_uploadFile(bucket_name,userAddr,filename,bucket_provider,filecontent)
            console.log(`The bucket is ${diskbucket["project"]}, ${diskbucket["bucket"]}, ${diskbucket["keyfile"]}`);
            diskbuckets.push(diskbucket);
        }

        // update the metatree
        console.log(`\nAbout to call filesyscontrol with arguments id ${id}, filename ${filename}, hash ${filenamehash}`);
        filesyscontrol.create_file_entry(id, filename, filenamehash, diskbuckets);
    } else {
        console.log("This should not happen! Someone tampered with the environment and deleted it!");
    }

    console.log(`After processing, the disk path is ${diskpath}`);
    return diskbuckets;
}


function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

async function sendTx(privKey, unsignedTx) {
	const signedTx = await web3.eth.accounts.signTransaction(
			{	
				to: contractAddr,
				gas: await unsignedTx.estimateGas({from: ownerAddr}),
				data: unsignedTx.encodeABI()
			},
			privKey
		);
	return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

async function addUser(userAddr, merkleHash, hasFile, signatureObj) {
	console.log("addUser function called for web3 stuff... this should NOT be called before the authenticate function!");
	console.log(`These are the values being passed in: userAddr ${userAddr}, merkleHash ${merkleHash}, signatureObj ${JSON.stringify(signatureObj)}`);
	const pendingTx = contractAPI.methods.addUser(userAddr, merkleHash, hasFile, signatureObj);
	const resultTx = await sendTx(privKey, pendingTx);
	return resultTx;
}

async function removeUser(userAddr, signatureObj) {
	console.log("[func] removeUser: Attempting to remove the user...");
	const pendingTx = contractAPI.methods.removeUser(userAddr, signatureObj);
	console.log("[func] removeUser: After contract remove user is called...");
	const resultTx = await sendTx(privKey, pendingTx);
	console.log(`[func] removeUser: After grabbing the result ${JSON.stringify(resultTx)}`);
	return resultTx;
}

async function getUser(UserAddr) {
	const userVal = await contractAPI.methods.files(ownerAddr).call();
	console.log(userVal['merkleHash'], userVal['hasFile'], userVal['reg']);
	return userVal;
}

// This method gets the user merkle tree root from blockchain
async function getUserRootBC(userAddr)
{
	var addrHashMap=await contractAPI.methods.files(userAddr).call()
	return addrHashMap

};

// this is just a function i created for gupdating merkle root in my local this can be replaced.
async function updateUserHash(userAddr, merkleHash) {
	// const userAddr = userAddr;
	// const merkleHash = merkleHash;
	const pendingTx = contractAPI.methods.updateHash(userAddr, merkleHash);
	console.log("Inside updateMerkleHash:",merkleHash);
	const gasCost = await web3.eth.estimateGas({
		"value": 0x0,
		"data": pendingTx.encodeABI(),
		"from": ownerAddr,
		"to": contractAddr
	});
	const resultTx = await sendTx(privKey, pendingTx);
	return resultTx;
}

// export all the functions.
module.exports = {"insert_user":insert_user,
				  "authenticate":authenticate,
				  "manage_upload":manage_upload,
				  "setUserMerkleData":setUserMerkleData,
				  "addUser": addUser,
				  "getUser": getUser,
				  "removeUser": removeUser,
				  "getUserRootBC": getUserRootBC,
				  "authenticateFileAccess":authenticateFileAccess
				};
