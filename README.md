Git Time Machine
=================

http://time-machine.herokuapp.com/

Time machine for your files on github! An easier way to view the history of a single file.

Useful for remembering "how that method used to work" or finding "that line you deleted weeks ago but did end up needing afterall"

## TODO

- Show author in details
- Highlight changed lines
- Track file renames (dynamically update path)
- Browserify vis.js
- Compress js
- Extensions for other browsers


## ENV

```
OAUTH_CLIENT_ID=XXXXXXXXXXXXXXXXX
OAUTH_CLIENT_SECRET=XXXXXXXXXXXXX
OAUTH_HOST=github.com
OAUTH_PORT=443
OAUTH_PATH=/login/oauth/access_token
OAUTH_METHOD=POST
```
