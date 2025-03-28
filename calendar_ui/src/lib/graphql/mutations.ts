import { gql } from '@apollo/client';

export const UPSERT_NOTE = gql`
  mutation UpsertNote($text: String!, $timeSlotId: Int!) {
    upsertNote(text: $text, timeSlotId: $timeSlotId) {
      id
      text
    }
  }
`;




export const UPSERT_TAGS = gql`
  mutation UpsertTags($timeSlotId: Int!, $tagNames: [String!]!) {
    upsertTags(timeSlotId: $timeSlotId, tagNames: $tagNames) {
      id
      name
    }
  }
`;