import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://127.0.0.1:8000/calendar', // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

export default client;
