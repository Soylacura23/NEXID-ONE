export type Language = 'es' | 'en';
export type ThemeMode = 'dark' | 'light';
export type TemplateId = 'executive' | 'minimal' | 'creative' | 'tech';
export type IdentityType = 'professional' | 'academic' | 'business' | 'creative';
export type IdentityVisibility = 'public' | 'private';
export type IdentityStatus = 'draft' | 'published' | 'archived';
export type CoverStyle = 'obsidian' | 'editorial' | 'minimal';
export type ButtonStyle = 'solid' | 'outline';

export type CardFinish = 'obsidian' | 'graphite' | 'gold' | 'ivory';
export type CardLayoutStyle = 'monogram' | 'minimal' | 'executive';
export type CardStatus = 'unlinked' | 'active' | 'disabled';
export type CardType = 'virtual' | 'physical';

export type AnalyticsEventType =
  | 'profile_view'
  | 'link_click'
  | 'vcard_download'
  | 'card_redirect'
  | 'share_action';

export type AnalyticsSource = 'web' | 'qr' | 'nfc_redirect' | 'direct';

export interface IdentityLink {
  id: string;
  label: string;
  platform:
    | 'linkedin'
    | 'github'
    | 'instagram'
    | 'behance'
    | 'youtube'
    | 'tiktok'
    | 'website'
    | 'email'
    | 'whatsapp'
    | 'other';
  url: string;
  enabled: boolean;
  order: number;
}

export interface IdentityProject {
  id: string;
  title: string;
  category: string;
  description: string;
  imageURL?: string;
  projectURL?: string;
  technologies: string[];
  order: number;
}

export interface IdentityExperience {
  id: string;
  position: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IdentityEducation {
  id: string;
  institution: string;
  program: string;
  dates: string;
  description: string;
}

export interface IdentitySkill {
  id: string;
  name: string;
  category: string;
  order: number;
}

export interface Identity {
  id: string;
  ownerId: string;
  slug: string;
  identityType: IdentityType;
  title: string;
  profession: string;
  company?: string;
  location?: string;
  bio: string;
  photoURL?: string;
  coverURL?: string;
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
  showEmail: boolean;
  showPhone: boolean;
  templateId: TemplateId;
  accentColor: string;
  coverStyle: CoverStyle;
  buttonStyle: ButtonStyle;
  visibility: IdentityVisibility;
  status: IdentityStatus;
  links: IdentityLink[];
  projects: IdentityProject[];
  experience: IdentityExperience[];
  education: IdentityEducation[];
  skills: IdentitySkill[];
  sectionOrder: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface Card {
  id: string;
  ownerId: string;
  publicCode: string;
  identityId?: string;
  identitySlug?: string;
  displayName: string;
  roleLabel?: string;
  finish: CardFinish;
  layoutStyle: CardLayoutStyle;
  status: CardStatus;
  cardType: CardType;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  ownerId: string;
  name: string;
  organization?: string;
  role?: string;
  email?: string;
  phone?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsEvent {
  id: string;
  identityId: string;
  identityOwnerId: string;
  eventType: AnalyticsEventType;
  source: AnalyticsSource;
  targetId?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  ownerId: string;
  type: 'identity_published' | 'card_linked' | 'system_info' | 'config_warning';
  title: string;
  message: string;
  read: boolean;
  actionPath?: string;
  createdAt: string;
}

export interface UserAccount {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  onboardingCompleted: boolean;
  accountStatus: 'active' | 'suspended';
  themePreference: ThemeMode;
  languagePreference: Language;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAudit {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
}
