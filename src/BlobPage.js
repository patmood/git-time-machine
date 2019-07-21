import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

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

function BlobPage(props) {
  const { owner, repo, ref, path } = props.match.params
  const expression = `${ref}:${path}`
  console.log({ expression })
  return (
    <div>
      <h1>BlobPage</h1>
      <Query query={textQuery} variables={{ owner, repo, expression }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching...</div>
          if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>

          return <pre>{data.repository.object.text}</pre>
        }}
      </Query>
    </div>
  )
}

export { BlobPage }
