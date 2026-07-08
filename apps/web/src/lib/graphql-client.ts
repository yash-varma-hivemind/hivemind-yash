import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/graphql';

export async function graphQLRequest<TResult, TVariables>(
  userId: string,
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({
      query: print(document),
      variables,
    }),
  });

  const result = (await response.json()) as {
    data?: TResult;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || result.errors?.length) {
    throw new Error(
      result.errors?.[0]?.message ?? 'GraphQL request failed',
    );
  }

  if (!result.data) {
    throw new Error('No GraphQL data was returned');
  }

  return result.data;
}