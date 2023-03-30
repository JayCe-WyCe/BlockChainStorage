
// Import the Google Cloud client library
const {Storage} = require('@google-cloud/storage');


// Uploads a file to a bucket
async function uploadFile(bucketName, fileName, fileData, bucket_provider) {

  var storage = new Storage(bucket_provider);

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);


  const stream = file.createWriteStream({
    resumable: false,
    contentType: 'application/octet-stream',
  });

  // Pass the file data to the stream
  stream.write(fileData);

  stream.on('error', (err) => {
    console.error(err);
  });

  stream.on('finish', () => {
    console.log(`File ${fileName} uploaded to ${bucketName}.`);
  });

  // Close the stream to ensure that all data is flushed to the file
  stream.end();

  storage = null;
}


// Read the file from a bucket
async function readFile(bucketName, fileName, bucket_provider) {
  var storage = new Storage(bucket_provider);

  const file = storage.bucket(bucketName).file(fileName);

  const [contents] = await file.download();
  console.log('File contents:', contents.toString());

  storage = null;
  return contents.toString();
}


//Update a file in the bucket
async function updateFile(bucketName, fileName, bucket_provider) {
  var storage = new Storage(bucket_provider);

  const file = storage.bucket(bucketName).file(fileName);

  const newContents = 'No 4 times: This is the new content of the prog.c file';
  await file.save(newContents);

  console.log('File updated.');

  storage = null;
}


//Delete a file from a bucket
async function deleteFile(bucketName, fileName, bucket_provider) {
  var storage = new Storage(bucket_provider);

  await storage.bucket(bucketName).file(fileName).delete();

  console.log(`${fileName} deleted from ${bucketName}.`);

  storage = null;
}

// Check if a bucket exists or not
async function checkBucketStatus(bucketName, bucket_provider) {
  var storage = new Storage();

  const bucket = storage.bucket(bucketName);
  var result;

  try {
    result = await bucket.getMetadata();
    console.log(`Bucket ${bucketName} exists and is accessible.`);
  } catch (err) {
    console.log(`Bucket ${bucketName} does not exist or is not accessible:`);
    result = null;
  }

  storage = null;
  return result;
}
