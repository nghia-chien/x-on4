export type AdminRole =
  | "Admin"
  | "Customer"
  | "Wholesale";

export type NailShape =
  | "Almond"
  | "Coffin"
  | "Oval"
  | "Round"
  | "Square"
  | "Stiletto";

export const NAIL_SHAPES: readonly NailShape[] = [
  "Almond",
  "Coffin",
  "Oval",
  "Round",
  "Square",
  "Stiletto",
] as const;

export type ContactMessageStatus = "new" | "read" | "replied" | "archived";
export const CONTACT_MESSAGE_STATUSES: readonly ContactMessageStatus[] = [
  "new",
  "read",
  "replied",
  "archived",
] as const;

export type WholesaleRequestStatus = "new" | "contacted" | "approved" | "rejected" | "converted";
export const WHOLESALE_REQUEST_STATUSES: readonly WholesaleRequestStatus[] = [
  "new",
  "contacted",
  "approved",
  "rejected",
  "converted",
] as const;

export type BlogPostStatus = "draft" | "published" | "archived";
export const BLOG_POST_STATUSES: readonly BlogPostStatus[] = [
  "draft",
  "published",
  "archived",
] as const;

export type NewsletterStatus = "subscribed" | "unsubscribed";
export const NEWSLETTER_STATUSES: readonly NewsletterStatus[] = [
  "subscribed",
  "unsubscribed",
] as const;

export type ComingSoonStatus = "coming_soon" | "published" | "released" | "hidden";
export const COMING_SOON_STATUSES: readonly ComingSoonStatus[] = [
  "coming_soon",
  "published",
  "released",
  "hidden",
] as const;

export interface OAuthAccount {
  provider: "google" | "facebook";
  providerAccountId: string;
  emailVerified?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
  accounts?: OAuthAccount[];
}

export interface AdminUserWithPassword extends AdminUser {
  passwordHash?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  sizeStock?: Record<string, number>;
  images: string[];
  thumbnail: string;
  category: string;
  collection?: string;
  shapes: NailShape[];
  sizes: string[];
  designThemes?: string[];
  colors?: string[];
  colorOptions?: { name: string; hex: string; border?: boolean }[];
  length?: string;
  lengths?: string[];
  productType?: string;
  tags: string[];
  featured: boolean;
  handmadeGripX?: boolean;
  bestSeller: boolean;
  comingSoon: boolean;
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  displayOrder: number;
  createdAt: string;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  orderNumber: string;
  customer: OrderCustomerInfo;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
  status: "active" | "inactive" | "blocked";
  address?: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  review: string;
  productTitle: string;
  productId?: string;
  images: string[];
  date: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  description?: string;
  product?: string;
  category?: string;
  status: "published" | "unpublished";
  displayOrder: number;
  createdAt: string;
}

export interface ComingSoonItem {
  id: string;
  productName: string;
  image: string;
  description: string;
  expectedReleaseDate?: string;
  status: ComingSoonStatus;
  displayOrder: number;
  createdAt: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
}

export interface WholesaleRequestItem {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  taxId?: string;
  businessType?: string;
  location?: string;
  quantity?: string;
  message?: string;
  status: WholesaleRequestStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  author: string;
  category: string;
  tags: string[];
  status: BlogPostStatus;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriberItem {
  id: string;
  email: string;
  status: NewsletterStatus;
  subscribedAt: string;
}

export interface SiteSettings {
  general: {
    websiteName: string;
    logo: string;
    favicon: string;
    contactEmail: string;
    phone: string;
    address: string;
  };
  social: {
    instagram: string;
    tiktok: string;
    facebook: string;
    youtube?: string;
  };
  contact: {
    hotline: string;
    email: string;
    address: string;
    businessHours: string;
  };
  shipping: {
    shippingFee: number;
    freeShippingThreshold: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  wholesaleRequests: number;
  vipSubscribersCount?: number;
  contactMessagesCount?: number;
  salesOverview: {
    labels: string[];
    revenue: number[];
    orders: number[];
  };
  recentOrders: OrderItem[];
  recentWholesale?: WholesaleRequestItem[];
  recentSubscribers?: NewsletterSubscriberItem[];
  recentContacts?: ContactMessageItem[];
  bestSellingProducts: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantitySold: number;
    revenue: number;
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    image: string;
    sku: string;
    stock: number;
    status: string;
  }[];
}
