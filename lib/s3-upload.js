const fs = require('fs')
const path = require('path')
const {S3} = require('aws-sdk')
const s3 = new S3()

// s3 upload mapper 
module.exports = function s3Upload(config) {
  return function sink(read){
    return function source(abort, cb) {
      if(!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)
        return cb(new Error('ERROR: AWS CREDENTIALS ARE REQUIRED'))
      if(abort) return cb(abort)
      read(null, (err, file) => {
        if(err) return cb(err)
        // skip non files (filter out)
        if(!file.stat.isFile()) return read(abort, cb)
        s3.upload({
          ACL: config.acl,
          Bucket: config.bucket,
          Body: fs.createReadStream(file.path),
          Key: path.relative(config.dir, file.path),
        }, (err, data) => {
          if(err) return cb(err)
          //process.stdout.write('.')
          //if(data) return cb(null, {file, s3Object: data})
          //return cb(new Error('UNKNOWN ERROR: failed to upload ' + file.path))
       })
      }) 
    }
  }
}




