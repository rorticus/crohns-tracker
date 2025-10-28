import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseAppStateRefreshOptions {
  onForeground?: () => void;
  inactivityThresholdMs?: number;
}

/**
 * Hook to detect when the app comes to the foreground after being inactive
 * for a specified period of time. Useful for refreshing data when the app
 * returns from the background.
 * 
 * @param options - Configuration options
 * @param options.onForeground - Callback to execute when app comes to foreground after threshold
 * @param options.inactivityThresholdMs - Time in milliseconds before triggering refresh (default: 1 hour)
 */
export const useAppStateRefresh = ({
  onForeground,
  inactivityThresholdMs = 60 * 60 * 1000, // 1 hour default
}: UseAppStateRefreshOptions) => {
  const appState = useRef(AppState.currentState);
  const lastActiveTime = useRef(Date.now());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // App is coming to the foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const now = Date.now();
        const timeSinceLastActive = now - lastActiveTime.current;

        // If app has been in background longer than threshold, trigger refresh
        if (timeSinceLastActive >= inactivityThresholdMs) {
          onForeground?.();
        }
      }

      // Update last active time when going to background to track when user left
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        lastActiveTime.current = Date.now();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onForeground, inactivityThresholdMs]);
};
