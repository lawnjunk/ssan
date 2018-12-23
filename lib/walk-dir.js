let {readdir, lstat} = require('fs')

// recursivly get filepaths pull-stream source 
module.exports = function walker(path){
  let files = []
  let dirs = [path]
  return function read(abort, cb){
    if(abort) return cb(true)
    if(files.length == 0 && dirs.length == 0) return cb(true)
    _walk()
    function _walk(){
      if(files.length) return cb(null, files.pop())
      if(dirs.length){
        let path = dirs.pop()
        readdir(path, (err, data) => {
          if(err) return cb(err)
          if(data.length == 0) return cb(null, path)
          let lstatCount = 0
          for(var i=0; i<data.length; i++){
            let next = path + (path.endsWith('/') ? '' : '/') + data[i]
            lstat(next, (err, stat) => {
              if(err) return cb(err)
              if(stat.isDirectory()){
                dirs.push(next)
              } else {
                files.push(next)
              }
              lstatCount++
              if(lstatCount == data.length){
                cb(null, path)
              }
            })
          }
        })
      }
    }
  }
}

//function sink(read){
  //read(null, function next(err, data) {
    //if(err == true) return console.log('done')
    //if(err) return console.error('err', err)
    //console.log({data})
    //read(null, next)
  //})
//}

//read = walker('./')
//sink(read)

//read(null, (err, data) => console.log(err, data))

