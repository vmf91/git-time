#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var os = require('os');

// If help or bad usage
if (typeof argv.help == 'boolean' || typeof argv.h == 'boolean') {
  console.log('\nUsage: git-time <path>\n\nWhere <path> is the path of your Git repository.\n')
  console.log('Options:\n')
  console.log('  -h, --help\toutput usage information')
  console.log('  --max\t\tmaximum time in minutes between two consecultive commits. Default: 90')
  console.log('  --min\t\tminimum time in minutes for the start commit. Default: 25')
  console.log('  --author\t\tfilter out authors. Value(s) are passed to the git log command.')
  
  return;
}

const { exec } = require('child_process');
const _cliProgress = require('cli-progress');

var dir = argv._[0];
if (!dir || dir == '.') {
  dir = process.cwd()
}

var min = 25
if (typeof argv.min === 'number') {
  min = argv.min
}
min *= 60

var max = 90
if (typeof argv.max === 'number') {
  max = argv.max
}
max *= 60

var authors = [];
if (argv.author) {
  if(typeof argv.author.map === 'function') {
    authors = argv.author;
  } else {
    authors = [argv.author];
  }
}

// Wrap in quotes to escape spaces
dir = '"' + dir + '"'

var lsCommand = `ls ${dir}/.git`;

if(os.platform() === 'win32'){
	lsCommand = `dir ${dir}\\.git`;
}

exec(lsCommand, function (err, data) {
  if (err) {
    console.log(`${dir} is not a valid Git directory`)
    return
  }

  exec(`cd ${dir} && git log ${authors.map(author => `--author="${author}"`).join(" ")} --pretty="%an <%ae> %ct"`, function (err, data) {
    if (err) {
      console.log(err)
      return
    }

    var log = data.split('\n')
    log.sort();
    var byAuthor = log.reduce((acc, val) => {
      var logParts = val.split(" ");
      var time = logParts.pop();
      var author = logParts.join(" ");
      acc[author] = acc[author] || [];
      acc[author].push(time);
      return acc;
    }, {});

    Object.keys(byAuthor).forEach(author => {
      var authorLogTimes = byAuthor[author];
      console.log(`${author}`)
      console.log(`${authorLogTimes.length} commits found`)

      // create a new progress bar instance and use shades_classic theme
      const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
      bar1.clearOnComplete = true
  
      // start the progress bar with a total value of 200 and start value of 0
      bar1.start(authorLogTimes.length, 0);
  
      // Initialize variables
      var barValue = 0;
      var lastCommit = 0;
      var total = 0;
      for(var i = 0; i < authorLogTimes.length; i++){
        var c = authorLogTimes[i]
  
        if(lastCommit == 0){
          total += min
        }else{
          var diff = c - lastCommit;
  
          if(diff < max && diff > 0){
            total += diff
          }else{
            total += min
          }
        }
  
        lastCommit = c
        barValue++;
        bar1.update(barValue);
      }
  
      bar1.stop();
  
      var totalHours = total/3600
      console.log(`Total time spent: ${totalHours.toFixed(2)} hours\n`)
    })
  })
})



