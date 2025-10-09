import { useState, useEffect } from 'react';
import { subscribeToUser } from '@/lib/firestore';
import type { User } from '@shared/schema';

export const usePresence = (userId: string) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUser(userId, (user) => {
      if (user) {
        setIsOnline(user.isOnline);
        setLastSeen(user.lastSeen);
      }
    });

    return unsubscribe;
  }, [userId]);

  return { isOnline, lastSeen };
};

export const useMultiplePresence = (userIds: string[]) => {
  const [presenceMap, setPresenceMap] = useState<Record<string, { isOnline: boolean; lastSeen: Date }>>({});

  useEffect(() => {
    if (userIds.length === 0) {
      setPresenceMap({});
      return;
    }

    const unsubscribes = userIds.map(userId => 
      subscribeToUser(userId, (user) => {
        if (user) {
          setPresenceMap(prev => ({
            ...prev,
            [userId]: {
              isOnline: user.isOnline,
              lastSeen: user.lastSeen,
            }
          }));
        }
      })
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [userIds]);

  return presenceMap;
};
