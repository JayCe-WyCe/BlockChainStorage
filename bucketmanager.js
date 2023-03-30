
// Import the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

//process.env.GOOGLE_APPLICATION_CREDENTIALS = 'blockchain-storage-cmpt756-9e72ef72c1b8.json';
//process.env.GOOGLE_APPLICATION_CREDENTIALS = 'cloud-project-379001-99c29648310a.json';

// Instantiate a Cloud Storage client
//const storage = new Storage({projectId:'cloud-project-379001'});

// Instantiate a Cloud Storage client
const storage = new Storage({
  projectId: 'cloud-project-379001',
  keyFilename: 'cloud-project-379001-99c29648310a.json'
});


// Define the name of the bucket and the name of the file
const bucketName = 'cloudproject_bucket-1';
const filePath = 'ping_sweep.py';
const destinationPath = 'myping.txt';

// Get a reference to the bucket
//const bucket = storage.bucket(bucketName);

// Define the name of the disk device
//const diskName = 'disk-2';
//const disk = bucket.file(filePath);
//disk.setMetadata({disk: diskName});


// Uploads a file to a bucket
async function uploadFile(bucketName, filePath, destinationPath) {
  const options = {
    destination: destinationPath,
  };

  await storage.bucket(bucketName).upload(filePath, options);
  console.log(`File ${filePath} uploaded to bucket ${bucketName} as ${destinationPath}.`);
}

uploadFile(bucketName, filePath, destinationPath);

// Define the name of the bucket and the name of the file
const rbucketName = 'cloudproject_bucket-1';
const rfileName = 'labsh.txt';

// Read the file from a bucket
async function readFile(bucketName, fileName) {
  const file = storage.bucket(bucketName).file(fileName);

  const [contents] = await file.download();
  console.log('File contents:', contents.toString());
}

readFile(rbucketName, rfileName).catch(console.error);

// Define the name of the bucket and the name of the file
const ubucketName = 'cloudproject_bucket-1';
const ufileName = 'prog.c';

//Update a file in the bucket
async function updateFile(bucketName, fileName) {
  const file = storage.bucket(bucketName).file(fileName);

  const newContents = 'No 3 times: This is the new content of the prog.c file';
  await file.save(newContents);

  console.log('File updated.');
}

updateFile(ubucketName, ufileName).catch(console.error);

// Define the name of the bucket and the name of the file
const dbucketName = 'cloudproject_bucket-1';
const dfileName = 'labsh.txt';

//Delete a file from a bucket
async function deleteFile(bucketName, fileName) {

  await storage.bucket(bucketName).file(fileName).delete();

  console.log(`${fileName} deleted from ${bucketName}.`);
}

deleteFile(dbucketName, dfileName).catch(console.error);
