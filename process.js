//process.js
/*
	This javascript file is used as utility for the main server script to abstract
	away the code clutter. Note that this is simply for auxillary functions.
*/
const fs = require('fs');
const filesyscontrol = require("./filesyscontrol");

const filename_accounts = "accounts.json";
const filename_disklist = "disklist.json"; 


/*Function: add a new user to the user json*/
function insert_user(user){
	var successful_insert = filesyscontrol.create_user_entry(user);
	return successful_insert;
}

// note: we need to modify to include file ID. also edit filesyscontrol.create_file_entry()
function manage_upload(filedata){
	// we now wish to store the file, we assume we are already authenticated.
	// two parts: first, generate disk. second, add the file to metatree.
	var diskpath = "";
	if(fs.existsSync(filename_disklist)){
		// we get a list of disks available to us specified in disklist
		var disklist_file = fs.readFileSync(filename_disklist)
		var disklist = JSON.parse(disklist_file);
		var disks_total = disklist.length;

		// pick a disk to store the file in
		var targ_disk_num = Math.floor(Math.random()*(disks_total))+1;
		console.log(`Generated target disk ${targ_disk}`);
		var targ_disk = disklist[targ_disk_num];

		// update the metatree
		var id = filedata["id"];
		var filename = filedata["filename"];
		filesyscontrol.create_file_entry(id, filename, targ_disk);

	} else {
		console.log("This should not happen! Someone tampered with the environment and deleted!");
	}


	return diskpath;
}

/*
function authenticate(id, signature){
	var authenticated = true;
	try {
		var account_file = fs.readFileSync(filename_accounts)
		var accounts = JSON.parse(account_file);
		var accounts_total = accounts.length;
		var stored_pubkey;

		console.log(`We are looking to authenticate ${id}`);
		for(let i=0; i<accounts_total; i++){
			if(accounts[i]["id"]==id){
				stored_pubkey = accounts[i]["pubkey"];
				console.log(`Retrieved the public key ${stored_pubkey}`);
			}
		}

*/
		/* TODO: code below this section to interact with blockchain for authentication */
		// deal with merkle trees
		// do not forget to false the authenticated variable if fail
		// it may be cleaner to offload the code to another script for abstraction
/*
	} catch (err) {
		console.log(err);
		authenticated = false;
	}

	return authenticated;
}
*/

function authenticate(){
	return true;
}



// export all the functions.
module.exports = {"insert_user":insert_user,
				  "manage_upload":manage_upload,
				  "authenticate":authenticate};