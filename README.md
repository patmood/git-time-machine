Git Time Machine
=================

http://time-machine.herokuapp.com/

Time machine for your files on github! An easier way to view the history of a single file.

Useful for remembering how that constantly evolving method used to work or finding that line you deleted weeks ago but did end up needing afterall.

Requests are made directly from the client to the Github API using backbone.js, and are cached in local storage for maximum speed. Only a single file node server is required for authentication (thanks [@prose](https://github.com/prose/gatekeeper)!)

## TODO

- Highlight changed lines
- Browserify vis.js
- Compress js
- Extensions for other browsers

## Running locally

- Clone this repo
- Run `gulp build`
- Set environment variables below
- Start server and watch files by running `gulp`
- Change chrome extension URL at the bottom of `time_machine_button.js` to your url
- Enable dev mode for chrome extensions and load the folder
- Go to github file view and enjoy your new Time Machine button!

## ENV

You'll need these environment variables to run the node server. Create an application on github to get `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET`. Create an application on github [here](https://github.com/settings/applications/new)

```
OAUTH_CLIENT_ID=XXXXXXXXXXXXXXXXX
OAUTH_CLIENT_SECRET=XXXXXXXXXXXXX
OAUTH_HOST=github.com
OAUTH_PORT=443
OAUTH_PATH=/login/oauth/access_token
OAUTH_METHOD=POST
```
