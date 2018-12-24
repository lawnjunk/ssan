let {readdir, lstat} = require('fs')

// recursivly get filepaths with lstats as a  pull-stream source 
module.exports = function walker(path){
  let files = []
  let dirs = [{path}]
  return function read(abort, cb){
    if(abort) return cb(true)
    if(files.length == 0 && dirs.length == 0) return cb(true)
    _walk()
    function _walk(){
      if(files.length) return cb(null, files.pop())
      if(dirs.length){
        let dir = dirs.pop()
        readdir(dir.path, (err, data) => {
          if(err) return cb(err)
          if(data.length == 0) {
            if(dir.path == path) return read(null, cb)
            return cb(null, dir)
          }
          let lstatCount = 0
          for(var i=0; i<data.length; i++){
            let next = dir.path + (dir.path.endsWith('/') ? '' : '/') + data[i]
            lstat(next, (err, stat) => {
              if(err) return cb(err)
              if(stat.isDirectory()){
                dirs.push({path: next, stat})
              } else {
                files.push({path: next, stat})
              }
              lstatCount++
              if(lstatCount == data.length){
                if(dir.path == path) return read(null, cb)
                cb(null, dir)
              }
            })
          }
        })
      }
    }
  }
}

//calls = 0
//function sink(read){
  //read(null, function next(err, data) {
    //if(err == true) return console.log('done')
    //if(err) return console.error('err', err)
    //console.log({data})
    //console.log(calls++)
    //read(null, next)
  //})
//}

//read = walker('./')
//sink(read)

//read(null, (err, data) => console.log(err, data))

