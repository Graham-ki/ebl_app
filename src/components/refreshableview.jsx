// components/RefreshableView.js
import React, { useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useRefresh } from '../contexts/refreshcontext';

const RefreshableView = ({ children, onRefresh, style }) => {
  const { refreshing, startRefreshing, stopRefreshing } = useRefresh();

  const handleRefresh = useCallback(() => {
    startRefreshing();
    onRefresh()
      .then(() => stopRefreshing())
      .catch(() => stopRefreshing());
  }, [onRefresh, startRefreshing, stopRefreshing]);

  return (
    <ScrollView
      contentContainerStyle={style}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableView;
