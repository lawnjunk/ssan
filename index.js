const fs = require('fs')
const path = require('path')
const klaw = require('klaw')
const util = require('util')
const {S3} = require('aws-sdk')
const {Readable} = require('stream')
const through2 = require('through2')
const s3 = new S3()

if(!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY){
  console.error('ERROR: AWS ENV CREDENTIALS NOT SET')
  console.error('https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html')
  process.exit(1)
}

// i didnt like through2's interface :}
let transform = (cb) => {
  return through2.obj((f, _, next) => {
    cb(f, (err, data) => {
      if(err) return next(err)
      if(data) return next(null, data)
      next()
    })
  })
}

module.exports = {
  uploadStatic: (config) => {
    return klaw(config.dir)
    .pipe(transform((f, cb) => {
      if(!config.dir)
        return cb(new Error('ERROR: no dir supplied'))
      if(!config.bucket) 
        return cb(new Error('ERROR: no bucket name supplied'))

      // PASS FILES ON NO OTHER TYPES (DIR, PIPE, ECT)
      fs.lstat(f.path, (err, data) => {
        if(err) return cb(err)
        if(data.isFile()) return cb(null, f.path)
        cb()
      })
    }))
    .pipe(transform((filepath, cb) => {
      // UPLOAD TO S3
      s3.upload({
        ACL: config.acl,
        Bucket: config.bucket,
        Body: fs.createReadStream(filepath),
        Key: path.relative(config.dir, filepath),
      }, (err, data) => {
        if(err) return cb(err)
        if(data) return cb(null, {filepath, s3Object: data})
        return cb(new Error('UNKNOWN ERROR: failed to upload ' + filepath))
      })
    }))
  }, 
  deleteStale: (config) => {
    // buffer local files
    // buffer s3 objects
    // use filter to find "stale" objects on s3 that arenot in local dir
    // delete s3 obejcts
    
    function DeleteStaleStream(){
      Readable.call(this, {objectMode: true})
      this.start = true
    }
    util.inherits(DeleteStaleStream, Readable)
    DeleteStaleStream.prototype._read = function(){
      if(!config.dir)
        return this.emit('error', new Error('ERROR: no dir supplied'))
      if(!config.bucket) 
        return this.emit('error', new Error('ERROR: no bucket name supplied'))
      if(this.start){
        this.start = false
        let filepaths = {}
        // buffer the files in the local dir
        klaw(config.dir)
        .on('error', () => this.emit('error', err))
        .on('data', (f) => {
          // PASS FILES ON NO OTHER TYPES (DIR, PIPE, ECT)
          fs.lstat(f.path, (err, data) => {
            if(err) return this.emit('error', err)
            if(data.isFile()){
              filepaths[path.relative(config.dir, f.path)] = f
            }
          })
        })
        .on('end', () => {
          // buffer the s3Objects from s3
          s3.listObjectsV2({Bucket: config.bucket}, (err, data) => {
            if(err) return this.emit('error', err)
            // find and push to streram s3Objects that are not in the local dir
            data.Contents.filter(i => !filepaths[i.Key])
            .forEach(s3Object => this.push(s3Object))
            this.push(null)
          })
        })
      }
    }
    return new DeleteStaleStream()
    .pipe(transform((s3Object, cb) => {
      // DELETE FROM S3
      s3.deleteObject({
        Key: s3Object.Key,
        Bucket: config.bucket,
      }, (err, data) => {
        if(err) return cb(err)
        cb(null, data)
      })
    }))
  },
}

module.exports.uploadStatic({dir: process.env.DOT_ROOT, bucket: 'assets.slugbyte.com', acl: 'public read'})
.on('data', console.log)
.on('end', () => console.log('done'))
