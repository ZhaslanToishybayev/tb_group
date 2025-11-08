import React from 'react';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './providers/auth-provider';
import { QueryClientProvider } from './providers/query-client-provider';
import { createAppRouter } from './router';

const App: React.FC = () => {
  const router = React.useMemo(() => createAppRouter(), []);

  return (
    <AuthProvider>
      <QueryClientProvider>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
