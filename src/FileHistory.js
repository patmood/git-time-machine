import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { formatDistance } from 'date-fns'
import { Link } from 'react-router-dom'

import { Loading } from './Loading'
import { Error } from './Error'

const historyQuery = gql`
  query HistoryForFile($repo: String!, $owner: String!, $path: String!) {
    repository(name: $repo, owner: $owner) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 10, path: $path) {
              edges {
                node {
                  ... on Commit {
                    oid
                    commitResourcePath
                    message
                    changedFiles
                    committedDate
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

function FileHistory(props) {
  const { owner, repo, gitRef, path } = props

  return (
    <div>
      <h1>FileHistory</h1>
      <Query query={historyQuery} variables={{ owner, repo, path }}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />
          if (error) return <Error error={error} />

          return (
            <ul>
              {data.repository.defaultBranchRef.target.history.edges.map(
                ({ node }) => {
                  const timeAgo = formatDistance(
                    new Date(node.committedDate),
                    new Date()
                  )
                  return (
                    <li key={node.oid}>
                      <Link to={`/${owner}/${repo}/blob/${node.oid}/${path}`}>
                        {node.message} - {timeAgo}
                      </Link>
                    </li>
                  )
                }
              )}
            </ul>
          )
        }}
      </Query>
    </div>
  )
}

export { FileHistory }
