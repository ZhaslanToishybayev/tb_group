import React from 'react';
import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

type QueryClientProviderProps = React.PropsWithChildren;

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

export const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children }) => {
  const [client] = React.useState(() => createQueryClient());

  return (
    <TanStackQueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </TanStackQueryClientProvider>
  );
};
