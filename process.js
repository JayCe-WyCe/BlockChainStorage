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
	var successful_insert = filesyscontrol.create_user_entry(id);
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

// function to deal with 1. updating metadata, and 2. saving the actual file
function upload_internal(id, filename, filecontent){
	console.log(`upload_internal called with parameters id ${id}, filename ${filename}, filecontent ${filecontent}`);
	var diskpath = manage_upload(id, filename);
	fs.writeFileSync(diskpath+"/"+filename, filecontent);
}

// note: we need to modify to include file ID. also edit filesyscontrol.create_file_entry()
function manage_upload(id, filename){
	// we now wish to store the file, we assume we are already authenticated.
	// two parts: first, generate disk. second, add the file to metatree.
	console.log(`manage_upload called, checking to update metadata...`);
	var diskpath = "";
	if(fs.existsSync(filename_disklist)){
		// we get a list of disks available to us specified in disklist
		var disklist_file = fs.readFileSync(filename_disklist)
		var disklist = JSON.parse(disklist_file);
		var disks_total = disklist.length;
		console.log(`Reading in disklist gives a result ${disklist} with length ${disklist.length}`);

		// pick a disk to store the file in
		var targ_disk_num = Math.floor(Math.random()*(disks_total));
		console.log(`Generated target disk number ${targ_disk_num}`);
		var diskpath = disklist[targ_disk_num];
		console.log(`The disk has path ${diskpath}... creating the file entry now`);

		// update the metatree
		console.log(`\nAbout to call filesyscontrol with arguments id ${id}, filename ${filename}, diskpath ${diskpath}`);
		filesyscontrol.create_file_entry(id, filename, diskpath);

	} else {
		console.log("This should not happen! Someone tampered with the environment and deleted!");
	}

	console.log(`After processing, the disk path is ${diskpath}`);
	return diskpath;
}


// export all the functions.
module.exports = {"insert_user":insert_user,
				  "authenticate":authenticate,
				  "upload_internal":upload_internal};