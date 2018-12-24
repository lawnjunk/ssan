const {pull, sink} = require('./lib/pull-stream.js')
const walkdir = require('./lib/walkdir.js')
const upload = require('./lib/s3-upload.js')

pull(
  walkdir('./'), 
  upload({bucket: 'assets.slugbyte.com', dir: process.env.DOT_ROOT, acl: 'public-read'}),
  sink
)
