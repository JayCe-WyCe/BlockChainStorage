//process.js
/*
	This javascript file is used as utility for the main server script to abstract
	away the code clutter. Note that this is simply for auxillary functions.
*/
const fs = require('fs');
const Web3 = require('web3');
const filesyscontrol = require("./filesyscontrol");

const filename_accounts = "accounts.json";
const filename_disklist = "bucketlist.json"; 

const providerAddr = "https://eth-sepolia.g.alchemy.com/v2/m5xr5zKeM3WLGQL2l_pbLYkWwIhdAXl-";
const web3 = new Web3(providerAddr);
let key_str = fs.readFileSync('fileImports/temp_key.txt', 'ascii').replace('\r', '')
var keys = key_str.split('\n')
var privKey = keys[0];
var wallet = web3.eth.accounts.privateKeyToAccount(privKey);
var ownerAddr = wallet.address;

const fileAbiPath = "fileImports/filePermAbi.json";
const fileAbi = JSON.parse(fs.readFileSync(fileAbiPath).toString());

const contractAddr = "0x858b8D0C5C87c1b77a66B21e7aB54Fc51F5e16A6";
const contractAPI = new web3.eth.Contract(fileAbi, contractAddr);

/*Function: add a new user to the user json*/
function insert_user(id, identifier){
	var successful_insert = filesyscontrol.create_user_entry(id);
	return successful_insert;
}

async function authenticate(addr, signatureObj){
	var authenticated = false;
	const ret_addr = await contractAPI.methods.VerifyMessage(signatureObj["hashedMessage"], signatureObj["v"], signatureObj["r"], signatureObj["s"]).call();
	// check if the user owns this account
	console.log(`Attempting authentication... ${addr} === ${ret_addr} ? ${addr===ret_addr}`);
	if(addr===ret_addr){
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
		var diskbucket = upload_new(id, filenamehash, filename);
		//fs.writeFileSync(diskpath+"/"+filename, filecontent);
	} else {
		// the file is already in the system, so only need to save the file
		// existing_file is a file metadata object, which contains filename, diskpath, and collaborators etc.
		console.log(`The file is not new, so we just need to save it again with no changes to metadata`);
		var diskbucket = existing_file["diskbucket"];
		//fs.writeFileSync(diskpath+"/"+filename, filecontent);
	}
}

// note: we need to modify to include file ID. also edit filesyscontrol.create_file_entry()
function upload_new(id, filename, filenamehash){
	// we now wish to store the file, we assume we are already authenticated.
	// two parts: first, generate disk. second, add the file to metatree.
	console.log(`upload_new called, checking to update metadata...`);
	var diskbucket = null; 
	if(fs.existsSync(filename_disklist)){
		// we get a list of disks (buckets) available to us specified in disklist
		var disklist_file = fs.readFileSync(filename_disklist)
		var disklist = JSON.parse(disklist_file);
		var disks_total = disklist.length;
		console.log(`Reading in disklist gives a result ${disklist} with length ${disklist.length}`);

		// pick a bucket to store the file in
		var targ_disk_num = Math.floor(Math.random()*(disks_total));
		var back_up_disk_num = (targ_disk_num + 1) % disks_total;
		console.log(`Generated target disk number ${targ_disk_num}`);
		console.log(`CURRENTLY UNUSED: Extra variable generated for backup: ${back_up_disk_num}`);
		var diskbucket = disklist[targ_disk_num];
		console.log(`The bucket is ${diskbucket["project"]}, ${diskbucket["bucket"]}, ${diskbucket["keyfile"]}... creating the file entry now`);

		// update the metatree
		console.log(`\nAbout to call filesyscontrol with arguments id ${id}, filename ${filename}, hash ${filenamehash}`);
		filesyscontrol.create_file_entry(id, filename, diskbucket);

	} else {
		console.log("This should not happen! Someone tampered with the environment and deleted it!");
	}

	console.log(`After processing, the disk path is ${diskpath}`);
	return diskbucket;
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

async function addUser(userAddr, merkleHash, signatureObj) {
	const pendingTx = contractAPI.methods.addUser(userAddr, merkleHash, signatureObj);
	const resultTx = await sendTx(privKey, pendingTx);
	return resultTx;
}

// export all the functions.
module.exports = {"insert_user":insert_user,
				  "authenticate":authenticate,
				  "manage_upload":manage_upload};