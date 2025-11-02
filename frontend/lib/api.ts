import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Popup {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggerType: 'exit_intent' | 'mobile_scroll' | 'time_delay' | 'scroll_percentage';
  design: {
    backgroundColor: string;
    textColor: string;
    heading: string;
    subheading: string;
    buttonText: string;
    buttonColor: string;
    imageUrl?: string;
    layout: 'centered' | 'left' | 'right';
    width: number;
    borderRadius: number;
    padding: number;
  };
  targeting?: {
    showOnPages: string[];
    excludePages: string[];
    deviceTypes: ('desktop' | 'mobile' | 'tablet')[];
    timeDelay?: number;
    scrollPercentage?: number;
  };
  offer?: {
    type: 'discount' | 'email_capture' | 'newsletter' | 'free_shipping';
    discountCodeId?: string;
    discountAmount?: number;
    discountType?: 'percentage' | 'fixed';
    emailListId?: string;
  };
  viewLimit: number;
  viewCount: number;
  isActive: boolean;
  abTestGroupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCode {
  id: string;
  shopId: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  isActive: boolean;
  expiresAt?: string;
  usageCount: number;
  usageLimit?: number;
  popupId?: string;
}

export interface EmailSubscriber {
  id: string;
  shopId: string;
  email: string;
  name?: string;
  popupId?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PopupStats {
  popupId: string;
  views: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  conversionsByType: Record<string, number>;
}

export const popupsApi = {
  getAll: (shopId: string) => api.get<Popup[]>(`/popups?shopId=${shopId}`),
  getActive: (shopId: string) => api.get<Popup[]>(`/popups/active?shopId=${shopId}`),
  getById: (id: string, shopId: string) => api.get<Popup>(`/popups/${id}?shopId=${shopId}`),
  create: (data: Partial<Popup>) => api.post<Popup>('/popups', data),
  update: (id: string, shopId: string, data: Partial<Popup>) =>
    api.patch<Popup>(`/popups/${id}?shopId=${shopId}`, data),
  delete: (id: string, shopId: string) => api.delete(`/popups/${id}?shopId=${shopId}`),
};

export const discountCodesApi = {
  getAll: (shopId: string) => api.get<DiscountCode[]>(`/discount-codes?shopId=${shopId}`),
  getById: (id: string, shopId: string) =>
    api.get<DiscountCode>(`/discount-codes/${id}?shopId=${shopId}`),
  getByCode: (code: string, shopId: string) =>
    api.get<DiscountCode>(`/discount-codes/code/${code}?shopId=${shopId}`),
  create: (data: Partial<DiscountCode>) => api.post<DiscountCode>('/discount-codes', data),
};

export const emailSubscribersApi = {
  getAll: (shopId: string) =>
    api.get<EmailSubscriber[]>(`/email-subscribers?shopId=${shopId}`),
  getCount: (shopId: string) => api.get<number>(`/email-subscribers/count?shopId=${shopId}`),
  getByPopup: (popupId: string) =>
    api.get<EmailSubscriber[]>(`/email-subscribers/popup/${popupId}`),
  create: (data: Partial<EmailSubscriber>) =>
    api.post<EmailSubscriber>('/email-subscribers', data),
  unsubscribe: (email: string, shopId: string) =>
    api.post(`/email-subscribers/unsubscribe?shopId=${shopId}`, { email }),
};

export const analyticsApi = {
  trackView: (data: {
    popupId: string;
    sessionId?: string;
    visitorId?: string;
    deviceType?: string;
    browser?: string;
    pageUrl?: string;
    referrer?: string;
  }) => api.post('/analytics/views', data),
  trackConversion: (data: {
    popupId: string;
    type: 'email_capture' | 'discount_code_used' | 'click' | 'purchase';
    sessionId?: string;
    visitorId?: string;
    revenue?: number;
    discountCodeId?: string;
    emailSubscriberId?: string;
    metadata?: Record<string, any>;
  }) => api.post('/analytics/conversions', data),
  getPopupStats: (popupId: string) => api.get<PopupStats>(`/analytics/popup/${popupId}`),
  getShopStats: (shopId: string) => api.get(`/analytics/shop/${shopId}`),
};

export interface RevenueStats {
  atRisk: number;
  recovered: number;
  recoveryRate: number;
  abandonedCount: number;
  recoveredCount: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'abandonment' | 'recovery';
  value: number;
  items: any[];
  location?: string;
  deviceType?: string;
  trafficSource?: string;
  timestamp: string;
  recoveredVia?: string;
  popupName?: string;
  timeAgo: string;
}

export interface HourlyDataPoint {
  hour: number;
  atRisk: number;
  recovered: number;
}

export interface TopPopup {
  popupId: string;
  popupName: string;
  recoveryCount: number;
  totalRecovered: number;
}

export interface ConversionBreakdown {
  method: string;
  count: number;
  percentage: number;
  totalValue: number;
}

export const revenueApi = {
  trackAbandonment: (data: {
    shopId: string;
    sessionId: string;
    cartValue: number;
    cartItems: any[];
    deviceType?: string;
    trafficSource?: string;
    userLocation?: string;
    userIp?: string;
    userAgent?: string;
    pageUrl?: string;
  }) => api.post('/revenue/track-abandonment', data),

  trackRecovery: (data: {
    cartAbandonmentId: string;
    shopId: string;
    popupId?: string;
    recoveryValue: number;
    recoveryMethod: string;
    offerUsed?: string;
  }) => api.post('/revenue/track-recovery', data),

  getStats: (shopId: string, period: 'today' | 'week' | 'month' = 'today') =>
    api.get<RevenueStats>(`/revenue/stats?shopId=${shopId}&period=${period}`),

  getActivityFeed: (shopId: string, limit = 20) =>
    api.get<ActivityFeedItem[]>(`/revenue/activity-feed?shopId=${shopId}&limit=${limit}`),

  getHourlyBreakdown: (shopId: string, date?: string) =>
    api.get<HourlyDataPoint[]>(
      `/revenue/hourly-breakdown?shopId=${shopId}${date ? `&date=${date}` : ''}`
    ),

  getTopPopups: (shopId: string, limit = 5) =>
    api.get<TopPopup[]>(`/revenue/top-popups?shopId=${shopId}&limit=${limit}`),

  getConversionBreakdown: (shopId: string) =>
    api.get<ConversionBreakdown[]>(`/revenue/conversion-breakdown?shopId=${shopId}`),
};

export default api;


