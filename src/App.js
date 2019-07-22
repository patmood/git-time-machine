import React from 'react'
import { Switch, Route } from 'react-router-dom'
import './App.css'

import { Footer } from './Footer'
import { Home } from './Home'
import { NoMatch } from './NoMatch'
import { BlobPage } from './BlobPage'

function App() {
  return (
    <div>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/:owner/:repo/blob/:gitRef/:path*" component={BlobPage} />
        <Route component={NoMatch} />
      </Switch>
      <Footer />
    </div>
  )
}

export { App }
