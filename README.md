# ![Nogger Logo](https://raw.githubusercontent.com/paul-em/nogger/master/front/img/logo-60.png "Nogger Logo") Nogger [![Build Status](https://secure.travis-ci.org/paul-em/nogger.png?branch=master)](http://travis-ci.org/paul-em/nogger) [![NPM version](https://badge-me.herokuapp.com/api/npm/nogger.png)](http://badges.enytc.com/for/npm/nogger) [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/paul-em/nogger/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

Read your log files online from a dashboard.

## What it is

Nogger is a log reader written with nodejs that brings features like grep and tail to the web. Zero configuration is needed!

![Nogger Screenshot](https://raw.githubusercontent.com/paul-em/nogger/master/assets/screenshot-1.png "Nogger Screenshot")
![Nogger Screenshot](https://raw.githubusercontent.com/paul-em/nogger/master/assets/screenshot-2.png "Nogger Screenshot")
![Nogger Screenshot](https://raw.githubusercontent.com/paul-em/nogger/master/assets/screenshot-3.png "Nogger Screenshot")

## Getting Started
Install the module with: `npm install nogger -g`
Make sure to set -g to install it globally to have the nogger command available!
That's it! No databases or other dependencies are required. 

In order to track a logfile you have to start an instance of nogger. As soon as you connect to the dashboard the script will listen on changes of the file.

Feel free to start as many instances as you want.

## CLI

```
  $ nogger --help
  
|--HELP--------------------------------------------------------|
|                                                              |
| usage: nogger [action]                                       |
|                                                              |
|                                                              |
| actions:                                                     |
|                                                              |
|  start [path]       Starts nogger with logfile path          |
|   -w, --pw <key>)   Optional. Set password for dashboard.    |
|                       If not set a password is generated.    |
|   -i, --id <id>)    Optional. A identifier that can be used  |
|                      instead of a generated one              |
|   -p, --port <port> Optional. Port for dashboard.            |
|   -c, --cert <cert> Optional. Provide SSL certificate in     |
|                      order to avoid having to manually       |
|                      confirm the certificate in the browser  |
|   -k, --key <key>   Optional. Provide SSL key in order to    |
|                      avoid having to manually confirm the    |
|                      certificate in the browser              |
|  restart <id>       Restarts an available instance           |
|  restartall         Restarts all available instances         |
|  stop <id>          Stops the nogger daemon                  |
|  stopall            Stops all nogger daemons                 |
|  remove <id>        Removes an instance from the list        |
|  removeall          Removes all instances from the list      |
|  list               Returns list of nogger instances running |
|                                                              |
|  setpw <pw> (<id>)    Updates the password for the dashboard |
|  showblocked        Displays blocked list(s)                 |
|  block <ip>         Add ip to blocked list(s)                |
|  unblock <ip>       Unblocks an ip from blocked list(s)      |
|                                                              |
|  -v, --version      Shows current nogger version             |
|  -h, --help         Shows help menu                          |
|                                                              |
|--------------------------------------------------------------|
```
## Contributing

Please submit all issues and pull requests to the [paul-em/nogger](http://github.com/paul-em/nogger) repository!

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/paul-em/nogger/issues).

## License
Copyright (c) 2014 Paul Em

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
