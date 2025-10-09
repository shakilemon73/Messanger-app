import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User, Conversation, Message, InsertMessage, InsertConversation } from "@shared/schema";

// Users
export const subscribeToUser = (userId: string, callback: (user: User | null) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastSeen: data.lastSeen?.toDate() || new Date(),
      } as User);
    } else {
      callback(null);
    }
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: userDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastSeen: data.lastSeen?.toDate() || new Date(),
    } as User;
  }
  
  return null;
};

// Conversations
export const createConversation = async (participantIds: string[]): Promise<string> => {
  const conversationData: InsertConversation = {
    participants: participantIds,
    unreadCount: Object.fromEntries(participantIds.map(id => [id, 0])),
  };
  
  const docRef = await addDoc(collection(db, 'conversations'), {
    ...conversationData,
    createdAt: serverTimestamp(),
  });
  
  return docRef.id;
};

export const subscribeToUserConversations = (
  userId: string, 
  callback: (conversations: Conversation[]) => void
) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastMessageTime: data.lastMessageTime?.toDate() || undefined,
      } as Conversation;
    });
    callback(conversations);
  });
};

export const findExistingConversation = async (participantIds: string[]): Promise<string | null> => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', '==', participantIds)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].id;
};

// Messages
export const sendMessage = async (messageData: InsertMessage): Promise<string> => {
  const docRef = await addDoc(collection(db, 'messages'), {
    ...messageData,
    timestamp: serverTimestamp(),
  });
  
  // Update conversation with last message
  const conversationRef = doc(db, 'conversations', messageData.conversationId);
  await updateDoc(conversationRef, {
    lastMessage: messageData.text || 'File',
    lastMessageTime: serverTimestamp(),
  });
  
  return docRef.id;
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void,
  limitCount = 50
) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        editedAt: data.editedAt?.toDate() || undefined,
      } as Message;
    }).reverse(); // Reverse to show oldest first
    
    callback(messages);
  });
};

export const updateMessageStatus = async (messageId: string, status: 'sent' | 'delivered' | 'read') => {
  const messageRef = doc(db, 'messages', messageId);
  await updateDoc(messageRef, { status });
};

export const addMessageReaction = async (messageId: string, userId: string, emoji: string) => {
  const messageRef = doc(db, 'messages', messageId);
  await updateDoc(messageRef, {
    [`reactions.${userId}`]: emoji,
  });
};

export const removeMessageReaction = async (messageId: string, userId: string) => {
  const messageRef = doc(db, 'messages', messageId);
  await updateDoc(messageRef, {
    [`reactions.${userId}`]: null,
  });
};

export const deleteMessage = async (messageId: string) => {
  const messageRef = doc(db, 'messages', messageId);
  await deleteDoc(messageRef);
};

// Typing indicators
export const setTypingIndicator = async (conversationId: string, userId: string, isTyping: boolean) => {
  const typingRef = doc(db, 'typing', `${conversationId}_${userId}`);
  
  if (isTyping) {
    await updateDoc(typingRef, {
      userId,
      conversationId,
      timestamp: serverTimestamp(),
    }).catch(() => {
      // Document doesn't exist, create it
      return addDoc(collection(db, 'typing'), {
        userId,
        conversationId,
        timestamp: serverTimestamp(),
      });
    });
  } else {
    await deleteDoc(typingRef).catch(() => {
      // Document might not exist, ignore error
    });
  }
};

export const subscribeToTypingIndicators = (
  conversationId: string,
  callback: (typingUsers: string[]) => void
) => {
  const q = query(
    collection(db, 'typing'),
    where('conversationId', '==', conversationId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const now = new Date();
    const typingUsers = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate() || new Date(0);
        return (now.getTime() - timestamp.getTime()) < 5000; // 5 seconds timeout
      })
      .map(doc => doc.data().userId);
    
    callback(typingUsers);
  });
};

// User search
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  const q = query(
    collection(db, 'users'),
    orderBy('displayName'),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  const users = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastSeen: data.lastSeen?.toDate() || new Date(),
    } as User;
  });
  
  // Filter client-side for now (could be improved with search indexing)
  return users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Pagination for messages
export const loadMoreMessages = async (
  conversationId: string,
  lastMessage: Message,
  limitCount = 50
): Promise<Message[]> => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'desc'),
    startAfter(Timestamp.fromDate(lastMessage.timestamp)),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate() || new Date(),
      editedAt: data.editedAt?.toDate() || undefined,
    } as Message;
  }).reverse();
};
