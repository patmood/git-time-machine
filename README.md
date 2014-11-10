Git Time Machine
=================

Time machine for Github files

## TODO
- Chrome app inserts button on every page (not just first load)
- Freeze timeline and nav header
- Clicking timeline commit goes to that commit
- Select the current commit on the timeline when using next/prev buttons
- Make sure the timeline doesnt zoom too far in
- Prevent dups!!! Collection#add is not being hit due to cache and/or 304 not modified response...
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
