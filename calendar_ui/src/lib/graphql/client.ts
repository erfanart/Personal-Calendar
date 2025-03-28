import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';


export const client = new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://calendar.rcsis.ir:8000/graphql',
      headers: {
        'Content-Type': 'application/json',
      },
      fetch: (...args) => fetch(...args),
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  });

export default client;