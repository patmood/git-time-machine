import React from 'react'
import { Switch, Route } from 'react-router-dom'
import './App.css'

import Footer from './Footer'
import { Contents } from './Contents'
import { BlobPage } from './BlobPage'

function App() {
  return (
    <div>
      <Switch>
        <Route exact path="/" component={Contents} />
        <Route path="/:owner/:repo/blob/:branch/:path*" component={BlobPage} />
        <Route component={NoMatch} />
      </Switch>
      <Footer />
    </div>
  )
}

function NoMatch({ location }) {
  return (
    <div>
      <h3>
        No match for <code>{location.pathname}</code>
      </h3>
    </div>
  )
}

export { App }
