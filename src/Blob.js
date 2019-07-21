import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { Loading } from './Loading'
import { Error } from './Error'

const textQuery = gql`
  query File($repo: String!, $owner: String!, $expression: String!) {
    repository(name: $repo, owner: $owner) {
      object(expression: $expression) {
        ... on Blob {
          text
        }
      }
    }
  }
`

function Blob(props) {
  const { owner, repo, gitRef, path } = props
  const expression = `${gitRef}:${path}`

  return (
    <div>
      <h1>Blob</h1>
      <Query query={textQuery} variables={{ owner, repo, expression }}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />
          if (error) return <Error error={error} />

          return <pre>{data.repository.object.text}</pre>
        }}
      </Query>
    </div>
  )
}

export { Blob }
