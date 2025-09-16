export interface Gift {
  id: string;
  sender_id: string;
  recipient_email: string;
  recipient_name?: string;
  title: string;
  message?: string;
  video_url?: string;
  gift_image_url?: string;
  qr_code_url?: string;
  reservation_details?: ReservationDetails;
  scheduled_for?: string;
  is_opened: boolean;
  opened_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationDetails {
  type: 'restaurant' | 'event' | 'activity' | 'other';
  venue?: string;
  date?: string;
  details?: string;
}

export interface GiftOpen {
  id: string;
  gift_id: string;
  opened_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface GiftFormData {
  recipientEmail: string;
  recipientName: string;
  title: string;
  message?: string;
  videoFile?: File;
  giftImages: File[];
  qrCodeImage?: File;
  reservationDetails: ReservationDetails;
  scheduledFor?: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}
