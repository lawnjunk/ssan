# S三
A two function lib for uploading static websites and removing stale files for AWS S3.

## uploadStatic
`uploadStatic` will recursivly upload a directorys contents to an AWS S3 Bucket.
* it has the function signature `uploadStatic(configObject) -> readableStream`
* the `config` has the following options
  * `bucket` - the name of the S3 Bucket (Required)
  * `dir` - the path to the directory of static files to be uploaed
  * `acl` - the ACL String for all of the s3 objects
    * Values Include "private" "public-read" "public-read-write" "authenticated-read" "aws-exec-read" "bucket-owner-read" "bucket-owner-full-control"
``` js
uploadStatic({acl: 'public-read', bucket: 'example.bucket', dir: `${__dirname}/public`})
.on('error', console.error)
.on('data', => {
  console.log('UPLOADED', data)
})
.on('end', => {
  console.log('SUCCESS')
})
```

## deleteStale
`deleteStale` will diff a directory with and S3 bucket and delete files from the s3 bucket that dont exist localy. It can be used to to remove stale files with hashed names.
* it has the function signature `deleteStatic(configObject) -> readableStream`
* the `config` has the following options
  * `bucket` - the name of the S3 Bucket (Required)
  * `dir` - the path to the directory of static files to be diffed
* **KNOWN LIMITATION** for now only suports first 1000 objects in s3 bucket
``` js
deleteStale({bucket: 'example.bucket', dir: `${__dirname}/public`})
.on('error', console.error)
.on('data', => {
  console.log('DELETED', data)
})
.on('end', => {
  console.log('SUCCESS')
})
```
