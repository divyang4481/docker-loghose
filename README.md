# docker-loghose

[![Build Status](https://travis-ci.org/mcollina/docker-loghose.svg?branch=master)](https://travis-ci.org/mcollina/docker-loghose)

Collect all the logs from all docker containers

## Install

As a command line tool:

```bash
npm install docker-loghose -g
```

Embedded usage

```bash
npm install docker-loghose --save
```

## Embedded Usage

```js
var loghose = require('docker-loghose')
var through = require('through2')
var opts = {
  json: false, // parse the lines that are coming as JSON
  docker: null, // here goes options for Dockerode
  events: null, // an instance of docker-allcontainers
  newline: false, // Break stream in newlines

  // Logs from the container, running docker-loghose are excluded by default.
  // It could create endless loops, when the same logs are written to stdout...
  // To get all logs set includeCurrentContainer to 'true'
  includeCurrentContainer: false, // default value: false
  
  // In a managed environment, container names may be obfuscated. 
  // If there is a label that provides a better name for logging,
  // provide the key here.
  nameLabel: 'com.amazonaws.ecs.container-name',

  // the following options limit the containers being matched
  // so we can avoid catching logs for unwanted containers
  matchByName: /hello/, // optional
  matchByImage: /matteocollina/, //optional
  skipByName: /.*pasteur.*/, //optional
  skipByImage: /.*dockerfile.*/, //optional
  attachFilter: function (id, dockerInspectInfo) {
    // Optional filter function to decide if the log stream should 
    // be attached to a container or not 
    // e.g. return /LOGGING_ENABLED=true/i.test(dockerInspectInfo.Config.Env.toString())
    return true
  }

  // Enrich all log events with the labels that are set on the container
  // Using a regular expression it's possible to limit which labels are set
  // Labels are added into the root of JSON structure, unless 'labelsKey' is defined
  addLabels: false // default
  labelsMatch: /^ecs-.*/ // defaults to .*
  labelsKey: labels // defaults to 'none'
}
var lh = loghose(opts)
lh.pipe(through.obj(function(chunk, enc, cb) {
  this.push(JSON.stringify(chunk))
  this.push('\n')
  // stop listening to specific container logs
  if (/top secret logs/.test(chunk.line)) { 
    lh.detachContainer(chunk.long_id)
    // we should not get more logs for the container with chunk.long_id
  }
  cb()
})).pipe(process.stdout)


```

## Command Line Usage

```bash
docker-loghose [--json] [--help]
               [--newline]
               [--nameLabel STRING]
               [--matchByImage REGEXP] [--matchByName REGEXP]
               [--skipByImage REGEXP] [--skipByName REGEXP]
```

## Docker Usage

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock matteocollina/docker-loghose
```

## Data format

```js
{
  v: 0,
  id: "3324acd73ad5",
  long_id: "3324acd73ad573773b901d93e932be65f2bb55b8e6c03167a24c17ab3f172249"
  image: "myimage:latest",
  name: "mycontainer-name"
  time: 1454928524601,
  line: "This is a log line", // this will be an object if opts.jon is true
  labels: {
            com.amazonaws.ecs.cluster: "my-ecs-cluster"
          } // labels placed in 'labels' when "--labelsKey labels"
}
```

Acknowledgements
----------------

This project was kindly sponsored by [nearForm](http://nearform.com).


## License

MIT
