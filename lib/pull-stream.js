module.exports.sink = function sink(read){
  read(null, function next(err, data){
    if(err == true) console.log(done)
    if(err) return console.error(err)
    //console.log({data})
    read(null, next)
  })
}

module.exports.pull = function pull(...args){
  var source = args.shift()
  while(args.length) source = args.shift()(source)
  return source
}

