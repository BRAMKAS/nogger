# Nogger [![Build Status](https://secure.travis-ci.org/paul-em/nogger.png?branch=master)](http://travis-ci.org/paul-em/nogger) [![NPM version](https://badge-me.herokuapp.com/api/npm/nogger.png)](http://badges.enytc.com/for/npm/nogger) [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/paul-em/nogger/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

node logger and monitoring tool - this is under active development!

![Nogger Logo](https://raw.githubusercontent.com/paul-em/nogger/master/front/img/logo-256.png "Nogger Logo")

![Nogger Screenshot](https://raw.githubusercontent.com/paul-em/nogger/master/assets/Screenshot-1.png "Nogger Screenshot")

## Getting Started
Install the module with: `npm install nogger -g`
Make sure to set -g to install it globally to have the nogger command available! You don't need to install nogger separately for your project. In order to get it in your project you have to install an adapter. 
Right now there is only an adapter for node.js available:

https://github.com/paul-em/nogger-node-adapter

## CLI

```
  $ nogger help
  
  usage: nogger [action]


   actions:

     start            Starts nogger as a daemon
     stop             Stops the nogger daemon
     status           Returns if nogger is running or not
     config           Lists all nogger configurations
     set <key> <val>  Sets the key of the config
     clear <key>      Clears the key from the config
     setpw <password> Updates the password for the dashboard
     block <ip>       Adds ip to blocked list
     unblock <ip>     Unblocks a ip from blocked list
     version          Shows current nogger version

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
