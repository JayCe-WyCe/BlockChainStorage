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
function insert_user(id, identifier){
	var successful_insert = false;
	successful_insert = filesyscontrol.create_user_entry(id);
	
	return successful_insert;
}

// daniel-external_function is a dummy function, delete it after replacing with the real one
// this one is just set to always return true
function daniel_external_function(id){
	return id;
}

function authenticate(id, identifier){
	// note: identifier takes the form of key-values for {id-hash, v, r, s}.
	// we call daniel's function to verify that the user is indeed who they claim to be
	var authenticated = false;
	var ret_id = daniel_external_function(id);
	// check if the user owns this account
	console.log(`Attempting authentication... ${id} === ${ret_id} ? ${id===ret_id}`);
	if(id===ret_id){
		authenticated = true;
	}

	return authenticated;
}

function upload_internal(filename, filecontent){
	fs.writeFileSync("./storage/"+filename, filecontent);
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


// export all the functions.
module.exports = {"insert_user":insert_user,
				  "manage_upload":manage_upload,
				  "authenticate":authenticate,
				  "upload_internal":upload_internal};