Git Time Machine
=================

Time machine for Github files

## TODO

- Authentication
  - login https://github.com/login/oauth/authorize?client_id=3dbe9b15a57c1f2ae62d&scope=repo
  - get code from above and send to http://localhost:9999/authenticate/:code
  - Use that token in all the requests
  - force login if no token exists
  - save token in cookie, destroy cookie on logout

- Prevent dups!!! Collection#add is not being hit due to cache and/or 304 not modified response...
- Render list of commits in a timeline at the top of the page https://github.com/almende/vis/blob/master/examples/timeline/01_basic.html
- Chrome app to link directly from GH
- Check how it works with branches

## NOTES

- The github 'sha' can also be a branch
