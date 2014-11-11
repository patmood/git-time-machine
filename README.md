Git Time Machine
=================

Time machine for Github files

## TODO
- Match github's url structure exactly so it can link to 'mydomain.com' + window.location.pathname
- Prevent dups!!! Collection#add is not being hit due to cache and/or 304 not modified response...
- Highlight changed lines
- Browserify vis.js
- Extensions for other browsers

## NOTES

- The github 'sha' can also be a branch

http://visjs.org/docs/timeline.html#Events


## ENV

```
OAUTH_CLIENT_ID=XXXXXXXXXXXXXXXXX
OAUTH_CLIENT_SECRET=XXXXXXXXXXXXX
OAUTH_HOST=github.com
OAUTH_PORT=443
OAUTH_PATH=/login/oauth/access_token
OAUTH_METHOD=POST
```
