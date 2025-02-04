import { useState, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import registerForPushNotificationsAsync from '../lib/notifications';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const saveUserPushNotificationToken = async (token: string) => {
    if (!token.length) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return;

    await supabase
      .from('users')
      .update({
        expo_notification_token: token,
      })
      .eq('id', session.user.id);
  };

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => {
        setExpoPushToken(token ?? '');
        saveUserPushNotificationToken(token ?? '');
      })
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return <>{children}</>;
};

export default NotificationProvider;
