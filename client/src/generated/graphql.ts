import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type User = {
   __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  documents: Array<Maybe<Document>>;
  tweets: Array<Maybe<Tweet>>;
};

export type Document = {
   __typename?: 'Document';
  id: Scalars['ID'];
  title: Scalars['String'];
  content: Scalars['String'];
  images: Array<Maybe<Image>>;
};

export type Tweet = {
   __typename?: 'Tweet';
  id: Scalars['ID'];
  content: Scalars['String'];
  image?: Maybe<Image>;
};

export type Image = {
   __typename?: 'Image';
  id: Scalars['ID'];
  url: Scalars['String'];
};

export type Query = {
   __typename?: 'Query';
  users: Array<Maybe<User>>;
  documents: Array<Maybe<Document>>;
  tweets: Array<Maybe<Tweet>>;
  images: Array<Maybe<Image>>;
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}


export type GetUsersQueryVariables = {};


export type GetUsersQuery = (
  { __typename?: 'Query' }
  & { users: Array<Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'name'>
    & { tweets: Array<Maybe<(
      { __typename?: 'Tweet' }
      & Pick<Tweet, 'content'>
    )>> }
  )>> }
);


export const GetUsersDocument = gql`
    query getUsers {
  users {
    name
    tweets {
      content
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getUsers(variables?: GetUsersQueryVariables): Promise<GetUsersQuery> {
      return withWrapper(() => client.request<GetUsersQuery>(print(GetUsersDocument), variables));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;