import React from 'react'

import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const CONTENT_QUERY = gql`
  {
    repository(name: "hugegif", owner: "patmood") {
      object(expression: "master:js/main.js") {
        ... on Blob {
          text
        }
      }
    }
  }
`

function Contents() {
  return (
    <div>
      <Query query={CONTENT_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>

          return <pre>{data.repository.object.text}</pre>
        }}
      </Query>
    </div>
  )
}

export { Contents }
