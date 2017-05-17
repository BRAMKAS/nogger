# ![Nogger Logo](https://github.com/paul-em/nogger/raw/master/assets/logo-flipped.png "Nogger Logo") Nogger 3.0

Read your log files online from a dashboard.

## What it is

Nogger is a log reader written with nodejs that brings features like grep and tail to the web. Zero configuration is needed!

To see a detailed explaination have a look at this blog entry: [http://blog.paulem.eu/nogger/](http://blog.paulem.eu/nogger/)

![Nogger Screenshot](https://github.com/paul-em/nogger/raw/master/assets/screenshot_login.png "Nogger Screenshot")
![Nogger Screenshot](https://github.com/paul-em/nogger/raw/master/assets/screenshot_folder.png "Nogger Screenshot")
![Nogger Screenshot](https://github.com/paul-em/nogger/raw/master/assets/screenshot_file.png "Nogger Screenshot")
![Nogger Screenshot](https://github.com/paul-em/nogger/raw/master/assets/screenshot_highlight.png "Nogger Screenshot")
![Nogger Screenshot](https://github.com/paul-em/nogger/raw/master/assets/screenshot_before_after.png "Nogger Screenshot")

## Getting Started
Install the module with: `npm install nogger -g`
Make sure to set -g to install it globally to have the nogger command available!
That's it! No databases or other dependencies are required. 

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
|  start                Starts nogger on port 1337 in cwd      |
|   -p, --port <port>      Optional. Port for dashboard.       |
|   -f, --folder <folder>  Optional. Absolute LogFiles folder. |
|                                                              |
|  adduser <user> <pw>  Adds a user for dashboard login        |
|  listusers            Lists all users in db                  |
|  removeuser <user>    Removes an existing user               |
|  changepw <user> <pw> Changes password of existing user      |
|                                                              |
|  -v, --version        Shows current nogger version           |
|  -h, --help           Shows help menu                        |
|                                                              |
|--------------------------------------------------------------|
```
A sample command to start watching a folder would be:
```
nogger start /var/log/nginx/
```
Just make sure you have added a user like so (you can also do this after you started the server)
```
nogger adduser paul supersecretpw
```
## Contributing

Please submit all issues and pull requests to the [paul-em/nogger](http://github.com/paul-em/nogger) repository!

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/paul-em/nogger/issues).

## License
Copyright (c) 2017 Paul Em

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
