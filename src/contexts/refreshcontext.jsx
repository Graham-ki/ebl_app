// contexts/RefreshContext.js
import React, { createContext, useContext, useState } from 'react';

const RefreshContext = createContext();

export const useRefresh = () => {
  return useContext(RefreshContext);
};

export const RefreshProvider = ({ children }) => {
  const [refreshing, setRefreshing] = useState(false);

  const startRefreshing = () => setRefreshing(true);
  const stopRefreshing = () => setRefreshing(false);

  return (
    <RefreshContext.Provider
      value={{
        refreshing,
        startRefreshing,
        stopRefreshing,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};
