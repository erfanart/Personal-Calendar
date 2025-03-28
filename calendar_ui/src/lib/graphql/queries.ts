import { gql } from '@apollo/client';

export const GET_MONTHS = gql`
  query MyQuery {
    getMonths {
      id
      name
      season
    }
  }
`;
export const GET_TAGS = gql`
  query GetTags($search: String!) {
    tags(search: $search) {
      id
      name
    }
  }
`;

export const UPDATE_TAGS = gql`
  mutation UpdateTags($objectId: ID!, $tags: [String!]!) {
    updateTags(objectId: $objectId, tags: $tags) {
      id
      tags
    }
  }
`;


export const GET_MONTH_DETAILS = gql`
  query GetMonthDetails($id: Int!) {
    getMonths(id: $id){
      id
      name
      season
      calendarDays {
        dayName
        id
        jalaliDate
        timeSlots {
          hour
          id
          note {
            id
            text
          }
          tags {
            id
            name
          }
        }
      }
    }
  }
`;
export const GET_DAY_DETAILS = gql`
query GetDayDetails($id: Int = 1) {
  getCalendarDays(id: $id) {
    id
    dayName
    jalaliDate
    timeSlots {
      hour
      id
      note {
        id
        text
      }
      tags {
        id
        name
      }
    }
  }
}`
export const GET_SLOTS_STATUS = gql`
  query MyQuery {
    getMonths {
      name
      season
      calendarDays {
        dayName
        id
        jalaliDate
        timeSlots {
          hour
          id
        }
      }
    }
  }
`;
// 'https://127.0.0.1:8000/calendar'