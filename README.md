Git Time Machine
=================

http://time-machine.herokuapp.com/

Time machine for your files on github! An easier way to view the history of a single file.

Useful for remembering how that constantly evolving method used to work or finding that line you deleted weeks ago but did end up needing afterall.

Requests are made directly from the client to the Github API using backbone.js, and are cached in local storage for maximum speed. Only a single file node server is required for authentication (thanks [@prose](https://github.com/prose/gatekeeper)!)

## TODO

- Show author of commit (and their pic) in details
- Optional authentication (allow users to view open source projects without authorizing the app)
- Highlight changed lines
- Improve styling and aesthetic
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
