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

function create_file_entry(id, filename, diskpath){
	// we may wish to create more args after discussion...
	var metatree = load_tree();
	var users_total = metatree.length;
	var file_obj = {"filename": filename,
					"diskpath": diskpath,
					"collaborators": []};
	for(let i=0; i<users_total; i++){
		if(metatree[i]["id"]===id){
			console.log(`Found the user ${id}, attempting to update metatree...`);
			metatree[i]["id"]["files"].push(file_obj);
			console.log(`Metatree now takes the form ${JSON.stringify(metatree)}`);
			fs.writeFileSync(filename_metatree, JSON.stringify(metatree));
			break;
		}
	}
}

// function to check if a user exists, returns the user if found
function get_user_by_id(id, metatree){
	var user = null;
	var users_total = metatree.length;
	for(let i=0; i<users_total; i++){
		if(metatree[i]["id"]===id){
			user = metatree[i];
			break;
		}
	}

	return user;
}

// check if a user exists in the metadata file
function check_user_exists(id, metatree){
	var targ_user = get_user_by_id(id, metatree);
	var user_exists = true;
	if(targ_user==null){
		user_exists = false;
	}
	return user_exists;
}

// function to create a brand new user in the system
function create_user_entry(user){
	var metatree = load_tree();
	var user_id = user;

	// check that the user exists in the system
	var existing = check_user_exists(user_id, metatree);
	var created = true;
	if(!existing){
		// add a new user if it does not already exist
		try {
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