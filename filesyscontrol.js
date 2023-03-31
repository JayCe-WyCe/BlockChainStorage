//filesyscontrol.js
/*
	This javascript file is used to abstract the metadata management away from
	the main processing code.
*/

const fs = require('fs');

const filename_metatree = "metatree.json";

// function to load the metadata file keeping track of the filesystem
function load_tree(){
	var metatreejson = fs.readFileSync(filename_metatree)
	var metatree = JSON.parse(metatreejson);
	return metatree;
}

// This function will return all the disks on which the file is stored.
function getFileBuckets(userAddr,fileName)
{
	var metatree=load_tree()
	var userIndex=get_user_by_id(userAddr,metatree)
	if(userIndex!=null && userIndex!=-1 )
	{
		var fileIndex=get_file_index(metatree[userIndex],fileName)
		var fileBuckets=metatree[userIndex]['files'][fileIndex]['diskbuckets']
		return fileBuckets

	}

};


// Will return the merkle tree realted to a user
function getMerkleTree(userAddr)
{
	var metadata=load_tree()
	var userIndex=get_user_by_id(userAddr,metadata)
	return metadata[userIndex]['merkle']
};

// Will update the merkle tree in the metadataa file.
function setMerkleTree(userAddr,merkleTree)
{
	var metadata=load_tree()
	var userIndex=get_user_by_id(userAddr,metadata)
	metadata[userIndex]['merkle']=JSON.stringify(merkleTree.dump())
	fs.writeFileSync(filename_metatree, JSON.stringify(metadata));	
}




// function to add an entry into the metatree when a new file is being inserted
function create_file_entry(id, filename, filenamehash, size, diskbuckets){
	// we may wish to create more args after discussion...
	console.log(`Inside filesyscontrol, creating file entry using id ${id}, filename ${filename}, diskpath ${diskpath}`);
	var metatree = load_tree();
	var users_total = metatree.length;
	var file_obj = {"filename": filename,				// string
					"filenamehash": filenamehash,		// hash
					"filesize": size,					// int
					"diskbucket": diskbuckets};			// array
	var user_index = get_user_by_id(id, metatree);
	console.log(`The user index is ${user_index}`);
	if(user_index!==-1){
		console.log(`Found the user ${id}, attempting to update metatree...`);
		console.log(`Before update, Metatree takes the form ${JSON.stringify(metatree)}`);
		metatree[user_index]["files"].push(file_obj);
		console.log(`Metatree now takes the form ${JSON.stringify(metatree)}`);
		fs.writeFileSync(filename_metatree, JSON.stringify(metatree));
	}

}

// function to check if a file already exists in the system
function check_file_existence(id, filename){
	console.log(`Inside check_file_existence to see if a filename already exists with a user`);
	var metatree = load_tree();
	var user_index = get_user_by_id(id, metatree);
	console.log(`The user index is ${user_index}`);
	var user = metatree[user_index];
	var user_files = user["files"];
	var file_count = user_files.length;
	var target_file = null;
	for(let i=0; i<file_count; i++){
		if(filename===user_files[i]["filename"]){
			console.log(`Found the file! The filename is ${filename}`);
			target_file = user_files[i];
			break
		}
	}
	return target_file;
}

// reinsert a file into the user
function update_file_metadata(id, filemetadata){
	var success = true;
	var metatree = load_tree();
	var user_id = get_user_by_id(id, metatree);
	if(user_id!==-1){
		var user = metatree[user_id];
		var filename = filemetadata["filename"];
		// update the file metadata
		var file_index = get_file_index(user, filename);
		if(file_index!==-1){
			console.log("Attempting to write the new file metadata into the metatree!");
			metatree[user_id]["files"][file_index] = filemetadata;
			console.log(`The new array in the metatree is ${metatree[user_id]["files"][file_index]}`);
			console.log("Attempting to write to the metatree file now...");
			fs.writeFileSync(filename_metatree, JSON.stringify(metatree));
			console.log("Done writing to the metatree");
		}

	} else {
		console.log("This case should be impossible, did someone delete the user?");
		throw "User not found in the metatree error!";
	}
	return success;
}

// function to check if a user exists, returns the index of the user in the metatree if found
function get_user_by_id(id, metatree){
	var user = -1;
	var users_total = metatree.length;
	for(let i=0; i<users_total; i++){
		if(metatree[i]["id"]===id){
			user = i;
			break;
		}
	}

	return user;
}

// function to return the position of the current file index in the array
function get_file_index(user, filename){
	var user_files = user["files"];
	var file_count = user_files.length;
	var file_index = -1;
	for(let i=0; i<file_count; i++){
		if(user_files[i]===filename){
			file_index = i;
			break;
		}
	}

	return file_index;
}

// check if a user exists in the metadata file
function check_user_exists(id, metatree){
	var targ_user = get_user_by_id(id, metatree);
	var user_exists = true;
	if(targ_user===-1){
		user_exists = false;
	}
	return user_exists;
}

// function to create a brand new user in the system
function create_user_entry(user_id){
	var metatree = load_tree();

	// check that the user exists in the system
	var existing = check_user_exists(user_id, metatree);
	console.log(`Attempting to create a new user, does the user ${user_id} exist? ${existing}`);
	var created = true;
	if(!existing){
		// add a new user if it does not already exist
		try {
			console.log(`Attempting to add a new user and pushing into the metatree...`);
			var user_new = {"id":user_id,
							"merkle":null,
							"files": []};
			metatree.push(user_new);
			fs.writeFileSync(filename_metatree, JSON.stringify(metatree));
		} catch (err) {
			// insertion failed, so treat it as failed
			console.log(`Failed to write to ${filename_metatree}. Error: ${err}`);
			created = false;
		}
	}

	return created;

}

// export all the necessary functions.
module.exports = {"create_user_entry":create_user_entry,
				  "create_file_entry":create_file_entry,
				  "check_file_existence":check_file_existence,
				  "getMerkleTree":getMerkleTree,
				  "setMerkleTree":setMerkleTree,
				  "getFileBuckets":getFileBuckets};
