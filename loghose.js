#! /usr/bin/env node

var minimist = require('minimist')
var loghose = require('./lib/loghose')
var through = require('through2')

module.exports = loghose

function cli () {
  var argv = minimist(process.argv.slice(2), {
    boolean: ['json'],
    alias: {
      'help': 'h',
      'json': 'j',
      'newline': 'n'
    },
    default: {
      json: false,
      newline: false
    }
  })

  if (argv.help) {
    console.log('Usage: docker-loghose [--json] [--newline] [--help]\n' +
                '                      [--nameLabel label]\n' +
                '                      [--matchByImage REGEXP] [--matchByName REGEXP]\n' +
                '                      [--skipByImage REGEXP] [--skipByName REGEXP]\n' +
                '                      [--addLabels] [--labelsKey keyname] [--labelsMatch REGEXP]')
    process.exit(1)
  }

  loghose({
    includeCurrentContainer: false,
    nameLabel: argv.nameLabel,
    matchByName: argv.matchByName,
    matchByImage: argv.matchByImage,
    skipByName: argv.skipByName,
    skipByImage: argv.skipByImage,
    addLabels: argv.addLabels,
    labelsKey: argv.labelsKey,
    labelsMatch: argv.labelsMatch,
    newline: argv.newline,
    json: argv.json
  }).pipe(through.obj(function (chunk, enc, cb) {
    this.push(JSON.stringify(chunk))
    this.push('\n')
    cb()
  })).pipe(process.stdout)
}

if (require.main === module) {
  cli()
}
