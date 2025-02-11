export type UserRole = 'admin' | 'organizer';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityOrganizer {
  id: string;
  community_id: string;
  user_id: string;
  created_at: string;
}
