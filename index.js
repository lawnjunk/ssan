const {flatten, drain, values, pull, collect, sink, onEnd, log} = require('pull-stream')
const many = require('pull-many')
var { read, write } = require('pull-files') 

function bufferToArray(){
  let done = false
  return function(read){
    return function (abort, cb){
      collect((err, data) => {
        if(err || abort || done) return cb(err || abort || done)
        cb(null, data)
        done = true
      })(read)
    }
  }
}

function toS3Many(){

}

pull(
  read(`${process.env.DOT_ROOT}/**/*`),
  
  bufferToArray(),
  drain((all) => console.log({all}))
)

