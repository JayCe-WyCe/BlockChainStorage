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

// function to add an entry into the metatree when a new file is being inserted
function create_file_entry(id, filename, diskpath){
	// we may wish to create more args after discussion...
	console.log(`Inside filesyscontrol, creating file entry using id ${id}, filename ${filename}, diskpath ${diskpath}`);
	var metatree = load_tree();
	var users_total = metatree.length;
	var file_obj = {"filename": filename,
					"diskpath": diskpath,
					"collaborators": []};
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
				  "create_file_entry":create_file_entry};