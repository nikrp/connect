export type NotificationType =
  | 'join_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'member_removed';

export interface Notification {
  id: string;
  created_at: string;
  receiver_id: string;
  sender_id: string;
  collab_id: string;
  type: NotificationType;
  message: string | null;
  read: boolean;
  read_at: string | null;
  // Joined data from profiles table
  sender?: {
    id: string;
    name: string;
    profile_photo: string | null;
  };
  collab?: {
    id: string;
    title: string;
  };
}

export interface NotificationWithDetails extends Notification {
  sender: {
    id: string;
    name: string;
    profile_photo: string | null;
  };
  collab: {
    id: string;
    title: string;
  };
}
