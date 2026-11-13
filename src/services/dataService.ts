import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  ALEX_RIVERA_PROFILE,
  DEMO_ACADEMIC_PROFILE,
  DEMO_INITIAL_CARDS,
  DEMO_INITIAL_CONTACTS,
  DEMO_INITIAL_NOTIFICATIONS,
} from '@/data/demoData';
import {
  AdminAudit,
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsSource,
  AppNotification,
  Card,
  Contact,
  Identity,
  UserAccount,
} from '@/types/nexid';
import { OperationType, db, handleFirestoreError, isFirebaseConfigured } from './firebase/client';

const LOCAL_PREFIX = 'nexid_one_v1_';

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LOCAL_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues safely
  }
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export function generateId(prefix = 'nx'): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function generateCardPublicCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NX-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function ensureDemoSeeded(): void {
  if (!localStorage.getItem(LOCAL_PREFIX + 'seeded_demo')) {
    writeLocal('identities_demo-user', [ALEX_RIVERA_PROFILE, DEMO_ACADEMIC_PROFILE]);
    writeLocal('cards_demo-user', DEMO_INITIAL_CARDS);
    writeLocal('contacts_demo-user', DEMO_INITIAL_CONTACTS);
    writeLocal('notifications_demo-user', DEMO_INITIAL_NOTIFICATIONS);
    writeLocal('events_demo-user', []);
    localStorage.setItem(LOCAL_PREFIX + 'seeded_demo', 'true');
  }
}

function sanitizeIdentityPayload(identity: Identity) {
  return {
    id: identity.id,
    ownerId: identity.ownerId,
    slug: identity.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80) || 'perfil',
    identityType: identity.identityType,
    title: identity.title.slice(0, 120),
    profession: identity.profession.slice(0, 140),
    company: (identity.company || '').slice(0, 120),
    location: (identity.location || '').slice(0, 120),
    bio: (identity.bio || '').slice(0, 1200),
    photoURL: (identity.photoURL || '').slice(0, 600),
    coverURL: (identity.coverURL || '').slice(0, 600),
    publicEmail: (identity.publicEmail || '').slice(0, 180),
    publicPhone: (identity.publicPhone || '').slice(0, 40),
    website: (identity.website || '').slice(0, 300),
    showEmail: Boolean(identity.showEmail),
    showPhone: Boolean(identity.showPhone),
    templateId: identity.templateId,
    accentColor: (identity.accentColor || '#D5B47A').slice(0, 20),
    coverStyle: identity.coverStyle || 'editorial',
    buttonStyle: identity.buttonStyle || 'solid',
    visibility: identity.visibility,
    status: identity.status,
    links: (identity.links || []).slice(0, 20),
    projects: (identity.projects || []).slice(0, 12),
    experience: (identity.experience || []).slice(0, 15),
    education: (identity.education || []).slice(0, 10),
    skills: (identity.skills || []).slice(0, 30),
    sectionOrder: (identity.sectionOrder || ['projects', 'experience', 'skills', 'education', 'links']).slice(0, 8),
  };
}

// --- User Account Service ---
export const userService = {
  async getOrCreateUser(uid: string, profile: { displayName: string; email: string; photoURL?: string }): Promise<UserAccount> {
    if (uid === 'demo-user' || !isFirebaseConfigured || !db) {
      const existing = readLocal<UserAccount | null>(`user_${uid}`, null);
      if (existing) return existing;
      const created: UserAccount = {
        uid,
        displayName: profile.displayName || 'Alex Rivera (Demo)',
        email: profile.email || 'demo@nexid-one.ejemplo',
        photoURL: profile.photoURL || '',
        onboardingCompleted: uid === 'demo-user',
        accountStatus: 'active',
        themePreference: 'dark',
        languagePreference: 'es',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      writeLocal(`user_${uid}`, created);
      return created;
    }

    const ref = doc(db, 'users', uid);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        return {
          uid: data.uid,
          displayName: data.displayName,
          email: data.email,
          photoURL: data.photoURL || '',
          onboardingCompleted: Boolean(data.onboardingCompleted),
          accountStatus: data.accountStatus || 'active',
          themePreference: data.themePreference || 'dark',
          languagePreference: data.languagePreference || 'es',
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
        };
      }

      const payload = {
        uid,
        displayName: (profile.displayName || 'Usuario NEXID ONE').slice(0, 120),
        email: (profile.email || '').slice(0, 180),
        photoURL: (profile.photoURL || '').slice(0, 500),
        onboardingCompleted: false,
        accountStatus: 'active',
        themePreference: 'dark',
        languagePreference: 'es',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
      return {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as UserAccount;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  },

  async updateUser(uid: string, patch: Partial<Pick<UserAccount, 'displayName' | 'photoURL' | 'onboardingCompleted' | 'themePreference' | 'languagePreference'>>): Promise<void> {
    if (uid === 'demo-user' || !isFirebaseConfigured || !db) {
      const existing = readLocal<UserAccount | null>(`user_${uid}`, null);
      if (existing) {
        writeLocal(`user_${uid}`, { ...existing, ...patch, updatedAt: new Date().toISOString() });
      }
      return;
    }

    const ref = doc(db, 'users', uid);
    try {
      await updateDoc(ref, {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async deleteAccountData(uid: string): Promise<void> {
    if (uid === 'demo-user' || !isFirebaseConfigured || !db) {
      localStorage.removeItem(LOCAL_PREFIX + `user_${uid}`);
      localStorage.removeItem(LOCAL_PREFIX + `identities_${uid}`);
      localStorage.removeItem(LOCAL_PREFIX + `cards_${uid}`);
      localStorage.removeItem(LOCAL_PREFIX + `contacts_${uid}`);
      localStorage.removeItem(LOCAL_PREFIX + `notifications_${uid}`);
      localStorage.removeItem(LOCAL_PREFIX + `events_${uid}`);
      return;
    }

    try {
      const collections = [
        { name: 'identities', ownerField: 'ownerId' },
        { name: 'cards', ownerField: 'ownerId' },
        { name: 'contacts', ownerField: 'ownerId' },
        { name: 'notifications', ownerField: 'ownerId' },
      ];
      for (const col of collections) {
        const q = query(collection(db, col.name), where(col.ownerField, '==', uid));
        const snap = await getDocs(q);
        await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      }
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  },
};

// --- Identity Service ---
export const identityService = {
  async listByOwner(ownerId: string, useCloud: boolean): Promise<Identity[]> {
    if (ownerId === 'demo-user') {
      ensureDemoSeeded();
      return readLocal<Identity[]>('identities_demo-user', [ALEX_RIVERA_PROFILE, DEMO_ACADEMIC_PROFILE]);
    }
    if (!useCloud || !isFirebaseConfigured || !db) {
      return readLocal<Identity[]>(`identities_${ownerId}`, []);
    }

    try {
      const q = query(collection(db, 'identities'), where('ownerId', '==', ownerId), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as Omit<Identity, 'createdAt' | 'updatedAt' | 'publishedAt'>),
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
          publishedAt: data.publishedAt ? toIso(data.publishedAt) : null,
        };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'identities');
    }
  },

  async getById(id: string, ownerId: string, useCloud: boolean): Promise<Identity | null> {
    if (ownerId === 'demo-user') {
      ensureDemoSeeded();
      const list = readLocal<Identity[]>('identities_demo-user', [ALEX_RIVERA_PROFILE, DEMO_ACADEMIC_PROFILE]);
      return list.find((item) => item.id === id) || null;
    }
    if (!useCloud || !isFirebaseConfigured || !db) {
      const list = readLocal<Identity[]>(`identities_${ownerId}`, []);
      return list.find((item) => item.id === id) || null;
    }

    try {
      const snap = await getDoc(doc(db, 'identities', id));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        ...(data as Omit<Identity, 'createdAt' | 'updatedAt' | 'publishedAt'>),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
        publishedAt: data.publishedAt ? toIso(data.publishedAt) : null,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `identities/${id}`);
    }
  },

  async getPublicBySlug(slug: string): Promise<Identity | null> {
    if (slug === 'alex-rivera') {
      ensureDemoSeeded();
      const demoList = readLocal<Identity[]>('identities_demo-user', [ALEX_RIVERA_PROFILE, DEMO_ACADEMIC_PROFILE]);
      return demoList.find((i) => i.slug === 'alex-rivera') || ALEX_RIVERA_PROFILE;
    }

    // Check demo local identities too for local presentations
    const demoList = readLocal<Identity[]>('identities_demo-user', []);
    const localDemoMatch = demoList.find(
      (i) => i.slug === slug && i.status === 'published' && i.visibility === 'public',
    );
    if (localDemoMatch) return localDemoMatch;

    if (!isFirebaseConfigured || !db) {
      return null;
    }

    try {
      const q = query(
        collection(db, 'identities'),
        where('slug', '==', slug),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        limit(1),
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const data = snap.docs[0].data();
      return {
        ...(data as Omit<Identity, 'createdAt' | 'updatedAt' | 'publishedAt'>),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
        publishedAt: data.publishedAt ? toIso(data.publishedAt) : null,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `identities?slug=${slug}`);
    }
  },

  async save(identity: Identity, isNew: boolean, useCloud: boolean): Promise<Identity> {
    const clean = sanitizeIdentityPayload(identity);
    const nowIso = new Date().toISOString();

    if (identity.ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      const key = `identities_${identity.ownerId}`;
      const list = readLocal<Identity[]>(key, []);
      const saved: Identity = {
        ...clean,
        createdAt: isNew ? nowIso : identity.createdAt || nowIso,
        updatedAt: nowIso,
        publishedAt: clean.status === 'published' ? identity.publishedAt || nowIso : identity.publishedAt || null,
      };
      const updatedList = isNew ? [saved, ...list] : list.map((item) => (item.id === saved.id ? saved : item));
      writeLocal(key, updatedList);
      return saved;
    }

    const ref = doc(db, 'identities', clean.id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...clean,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          publishedAt: clean.status === 'published' ? serverTimestamp() : null,
        });
      } else {
        await updateDoc(ref, {
          ...clean,
          updatedAt: serverTimestamp(),
          publishedAt: clean.status === 'published' ? identity.publishedAt ? Timestamp.fromDate(new Date(identity.publishedAt)) : serverTimestamp() : null,
        });
      }
      return {
        ...clean,
        createdAt: isNew ? nowIso : identity.createdAt,
        updatedAt: nowIso,
        publishedAt: clean.status === 'published' ? identity.publishedAt || nowIso : null,
      };
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `identities/${clean.id}`);
    }
  },

  async remove(id: string, ownerId: string, useCloud: boolean): Promise<void> {
    if (ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      const key = `identities_${ownerId}`;
      const list = readLocal<Identity[]>(key, []);
      writeLocal(
        key,
        list.filter((item) => item.id !== id),
      );
      return;
    }

    try {
      await deleteDoc(doc(db, 'identities', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `identities/${id}`);
    }
  },
};

// --- Card Service ---
export const cardService = {
  async listByOwner(ownerId: string, useCloud: boolean): Promise<Card[]> {
    if (ownerId === 'demo-user') {
      ensureDemoSeeded();
      return readLocal<Card[]>('cards_demo-user', DEMO_INITIAL_CARDS);
    }
    if (!useCloud || !isFirebaseConfigured || !db) {
      return readLocal<Card[]>(`cards_${ownerId}`, []);
    }

    try {
      const q = query(collection(db, 'cards'), where('ownerId', '==', ownerId), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as Omit<Card, 'createdAt' | 'updatedAt'>),
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
        };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'cards');
    }
  },

  async resolvePublicCode(publicCode: string): Promise<Card | null> {
    ensureDemoSeeded();
    const demoCards = readLocal<Card[]>('cards_demo-user', DEMO_INITIAL_CARDS);
    const localCard = demoCards.find((c) => c.publicCode === publicCode);
    if (localCard) return localCard;

    if (!isFirebaseConfigured || !db) return null;

    try {
      const q = query(
        collection(db, 'cards'),
        where('publicCode', '==', publicCode),
        where('status', '==', 'active'),
        limit(1),
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const data = snap.docs[0].data();
      return {
        ...(data as Omit<Card, 'createdAt' | 'updatedAt'>),
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `cards?publicCode=${publicCode}`);
    }
  },

  async save(card: Card, isNew: boolean, useCloud: boolean): Promise<Card> {
    const nowIso = new Date().toISOString();
    const payload = {
      id: card.id,
      ownerId: card.ownerId,
      publicCode: card.publicCode,
      identityId: card.identityId || '',
      identitySlug: card.identitySlug || '',
      displayName: card.displayName.slice(0, 80),
      roleLabel: (card.roleLabel || '').slice(0, 80),
      finish: card.finish,
      layoutStyle: card.layoutStyle,
      status: card.status,
      cardType: card.cardType,
    };

    if (card.ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      const key = `cards_${card.ownerId}`;
      const list = readLocal<Card[]>(key, []);
      const saved: Card = {
        ...payload,
        createdAt: isNew ? nowIso : card.createdAt || nowIso,
        updatedAt: nowIso,
      };
      writeLocal(key, isNew ? [saved, ...list] : list.map((c) => (c.id === saved.id ? saved : c)));
      return saved;
    }

    const ref = doc(db, 'cards', payload.id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          identityId: payload.identityId,
          identitySlug: payload.identitySlug,
          displayName: payload.displayName,
          roleLabel: payload.roleLabel,
          finish: payload.finish,
          layoutStyle: payload.layoutStyle,
          status: payload.status,
          updatedAt: serverTimestamp(),
        });
      }
      return {
        ...payload,
        createdAt: isNew ? nowIso : card.createdAt,
        updatedAt: nowIso,
      };
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `cards/${payload.id}`);
    }
  },

  async remove(id: string, ownerId: string, useCloud: boolean): Promise<void> {
    if (ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      const key = `cards_${ownerId}`;
      const list = readLocal<Card[]>(key, []);
      writeLocal(
        key,
        list.filter((c) => c.id !== id),
      );
      return;
    }

    try {
      await deleteDoc(doc(db, 'cards', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cards/${id}`);
    }
  },
};

// --- Contact Service ---
export const contactService = {
  async listByOwner(ownerId: string, useCloud: boolean): Promise<Contact[]> {
    if (ownerId === 'demo-user') {
      ensureDemoSeeded();
      return readLocal<Contact[]>('contacts_demo-user', DEMO_INITIAL_CONTACTS);
    }
    if (!useCloud || !isFirebaseConfigured || !db) {
      return readLocal<Contact[]>(`contacts_${ownerId}`, []);
    }

    try {
      const q = query(collection(db, 'contacts'), where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as Omit<Contact, 'createdAt' | 'updatedAt'>),
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
        };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'contacts');
    }
  },

  async save(contact: Contact, isNew: boolean, useCloud: boolean): Promise<Contact> {
    const nowIso = new Date().toISOString();
    const payload = {
      id: contact.id,
      ownerId: contact.ownerId,
      name: contact.name.slice(0, 120),
      organization: (contact.organization || '').slice(0, 120),
      role: (contact.role || '').slice(0, 120),
      email: (contact.email || '').slice(0, 180),
      phone: (contact.phone || '').slice(0, 40),
      tags: (contact.tags || []).slice(0, 10),
      notes: (contact.notes || '').slice(0, 1000),
    };

    if (contact.ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      const key = `contacts_${contact.ownerId}`;
      const list = readLocal<Contact[]>(key, []);
      const saved: Contact = {
        ...payload,
        createdAt: isNew ? nowIso : contact.createdAt || nowIso,
        updatedAt: nowIso,
      };
      writeLocal(key, isNew ? [saved, ...list] : list.map((c) => (c.id === saved.id ? saved : c)));
      return saved;
    }

    const ref = doc(db, 'contacts', payload.id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          name: payload.name,
          organization: payload.organization,
          role: payload.role,
          email: payload.email,
          phone: payload.phone,
          tags: payload.tags,
          notes: payload.notes,
          updatedAt: serverTimestamp(),
        });
      }
      return {
        ...payload,
        createdAt: isNew ? nowIso : contact.createdAt,
        updatedAt: nowIso,
      };
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `contacts/${payload.id}`);
    }
  },

  async remove(id: string, ownerId: string, useCloud: boolean): Promise<void> {
    if (ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      const key = `contacts_${ownerId}`;
      const list = readLocal<Contact[]>(key, []);
      writeLocal(
        key,
        list.filter((c) => c.id !== id),
      );
      return;
    }

    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contacts/${id}`);
    }
  },
};

// --- Analytics Service (Real observable events only) ---
export const analyticsService = {
  async recordEvent(params: {
    identityId: string;
    identityOwnerId: string;
    eventType: AnalyticsEventType;
    source: AnalyticsSource;
    targetId?: string;
  }): Promise<void> {
    // Session-level deduplication for profile_view to limit duplicate refresh noise
    if (params.eventType === 'profile_view' && typeof sessionStorage !== 'undefined') {
      const dedupeKey = `nx_viewed_${params.identityId}`;
      if (sessionStorage.getItem(dedupeKey)) return;
      sessionStorage.setItem(dedupeKey, '1');
    }

    const event: AnalyticsEvent = {
      id: generateId('evt'),
      identityId: params.identityId,
      identityOwnerId: params.identityOwnerId,
      eventType: params.eventType,
      source: params.source,
      targetId: params.targetId ? params.targetId.slice(0, 120) : '',
      timestamp: new Date().toISOString(),
    };

    if (params.identityOwnerId === 'demo-user' || !isFirebaseConfigured || !db) {
      const key = `events_${params.identityOwnerId}`;
      const existing = readLocal<AnalyticsEvent[]>(key, []);
      writeLocal(key, [event, ...existing].slice(0, 500));
      return;
    }

    try {
      await setDoc(doc(db, 'analyticsEvents', event.id), {
        id: event.id,
        identityId: event.identityId,
        identityOwnerId: event.identityOwnerId,
        eventType: event.eventType,
        source: event.source,
        targetId: event.targetId,
        timestamp: serverTimestamp(),
      });
    } catch {
      // Do not interrupt public profile rendering if analytics logging fails
    }
  },

  async listByOwner(ownerId: string, useCloud: boolean): Promise<AnalyticsEvent[]> {
    if (ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      return readLocal<AnalyticsEvent[]>(`events_${ownerId}`, []);
    }

    try {
      const q = query(
        collection(db, 'analyticsEvents'),
        where('identityOwnerId', '==', ownerId),
        orderBy('timestamp', 'desc'),
        limit(300),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as Omit<AnalyticsEvent, 'timestamp'>),
          timestamp: toIso(data.timestamp),
        };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'analyticsEvents');
    }
  },
};

// --- Notification Service ---
export const notificationService = {
  async listByOwner(ownerId: string, useCloud: boolean): Promise<AppNotification[]> {
    if (ownerId === 'demo-user') {
      ensureDemoSeeded();
      return readLocal<AppNotification[]>('notifications_demo-user', DEMO_INITIAL_NOTIFICATIONS);
    }
    if (!useCloud || !isFirebaseConfigured || !db) {
      return readLocal<AppNotification[]>(`notifications_${ownerId}`, []);
    }

    try {
      const q = query(collection(db, 'notifications'), where('ownerId', '==', ownerId), limit(40));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => {
          const data = d.data();
          return {
            ...(data as Omit<AppNotification, 'createdAt'>),
            createdAt: toIso(data.createdAt),
          };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    }
  },

  async create(notification: Omit<AppNotification, 'id' | 'createdAt'>, useCloud: boolean): Promise<AppNotification> {
    const item: AppNotification = {
      ...notification,
      id: generateId('ntf'),
      createdAt: new Date().toISOString(),
    };

    if (notification.ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      const key = `notifications_${notification.ownerId}`;
      const list = readLocal<AppNotification[]>(key, []);
      writeLocal(key, [item, ...list].slice(0, 40));
      return item;
    }

    try {
      await setDoc(doc(db, 'notifications', item.id), {
        id: item.id,
        ownerId: item.ownerId,
        type: item.type,
        title: item.title.slice(0, 140),
        message: item.message.slice(0, 400),
        read: false,
        actionPath: (item.actionPath || '').slice(0, 200),
        createdAt: serverTimestamp(),
      });
      return item;
    } catch {
      return item;
    }
  },

  async markRead(id: string, ownerId: string, useCloud: boolean): Promise<void> {
    if (ownerId === 'demo-user' || !useCloud || !isFirebaseConfigured || !db) {
      const key = `notifications_${ownerId}`;
      const list = readLocal<AppNotification[]>(key, []);
      writeLocal(
        key,
        list.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return;
    }

    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  },
};

// --- Admin Service (Protected by rules & server/admin email claim) ---
export const adminService = {
  async listAuditLogs(): Promise<AdminAudit[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const q = query(collection(db, 'adminAudit'), orderBy('timestamp', 'desc'), limit(30));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as Omit<AdminAudit, 'timestamp'>),
          timestamp: toIso(data.timestamp),
        };
      });
    } catch {
      return [];
    }
  },
};
