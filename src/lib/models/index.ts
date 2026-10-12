import { Schema, model, models } from "mongoose";
import {
  NAIL_SHAPES,
  CONTACT_MESSAGE_STATUSES,
  WHOLESALE_REQUEST_STATUSES,
  BLOG_POST_STATUSES,
  NEWSLETTER_STATUSES,
  COMING_SOON_STATUSES,
} from "@/types/admin";

// 1. Admin User Schema
const AdminUserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional for OAuth-only accounts; password login requires a bcrypt hash
    passwordHash: { type: String, default: "" },
    role: {
      type: String,
      enum: ["Admin", "Customer", "Wholesale"],
      default: "Customer",
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    lastLogin: { type: Date },
    avatar: { type: String, default: "" },
    accounts: [
      {
        provider: { type: String, enum: ["google", "facebook"], required: true },
        providerAccountId: { type: String, required: true },
        emailVerified: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

// 2. Product Schema
const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    thumbnail: { type: String, default: "" },
    category: { type: String, default: "Handmade Nails" },
    collectionName: { type: String, default: "" },
    productType: { type: String, default: "Handmade Press-On Nails" },
    shapes: [{ type: String, enum: [...NAIL_SHAPES] }],
    sizes: [{ type: String }],
    sizeStock: { type: Map, of: Number, default: {} },
    designThemes: [{ type: String }],
    colors: [{ type: String }],
    length: { type: String, default: "Medium" },
    lengths: [{ type: String }],
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    handmadeGripX: { type: Boolean, default: true },
    bestSeller: { type: Boolean, default: false },
    comingSoon: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
  },
  { timestamps: true }
);

// 3. Category Schema
const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 4. Order Schema
const OrderItemSnapshotSchema = new Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, default: "" },
  size: { type: String, default: "M" },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      country: { type: String, default: "USA" },
    },
    items: [OrderItemSnapshotSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "Credit Card" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    shippingAddress: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// 5. Customer Schema
const CustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrder: { type: Date },
    status: { type: String, enum: ["active", "inactive", "blocked"], default: "active" },
    address: { type: String, default: "" },
  },
  { timestamps: true }
);

// 6. Review Schema
const ReviewSchema = new Schema(
  {
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    productTitle: { type: String, default: "" },
    productId: { type: String, default: "" },
    images: [{ type: String }],
    date: { type: String, default: () => new Date().toISOString() },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

// 7. Gallery Schema
const GallerySchema = new Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    product: { type: String, default: "" },
    category: { type: String, default: "" },
    status: { type: String, enum: ["published", "unpublished"], default: "published" },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 8. Coming Soon Schema
const ComingSoonSchema = new Schema(
  {
    productName: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, default: "" },
    expectedReleaseDate: { type: String, default: "" },
    status: {
      type: String,
      enum: [...COMING_SOON_STATUSES],
      default: "coming_soon",
    },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 9. Wholesale Request Schema
const WholesaleRequestSchema = new Schema(
  {
    businessName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String, default: "" },
    taxId: { type: String, default: "" },
    businessType: { type: String, default: "" },
    location: { type: String, default: "" },
    quantity: { type: String, default: "" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: [...WHOLESALE_REQUEST_STATUSES],
      default: "new",
    },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

// 10. Blog Post Schema
const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    author: { type: String, default: "X-ON Team" },
    category: { type: String, default: "Nail Care & Trends" },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: [...BLOG_POST_STATUSES],
      default: "draft",
    },
    publishedAt: { type: Date },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

// 11. Newsletter Schema
const NewsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    status: {
      type: String,
      enum: [...NEWSLETTER_STATUSES],
      default: "subscribed",
    },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 12. Settings Schema
const SettingsSchema = new Schema(
  {
    general: {
      websiteName: { type: String, default: "X-ON Nail Shop" },
      logo: { type: String, default: "/images/x-on-logo.png" },
      favicon: { type: String, default: "/favicon.ico" },
      contactEmail: { type: String, default: "support@xonails.com" },
      phone: { type: String, default: "+1 (689) 212-8888" },
      address: { type: String, default: "123 Nail Beauty Way, Suite 400, Los Angeles, CA" },
    },
    social: {
      instagram: { type: String, default: "https://instagram.com/xon_presson" },
      tiktok: { type: String, default: "https://tiktok.com/@xon_nails" },
      facebook: { type: String, default: "https://facebook.com/xonails" },
      youtube: { type: String, default: "" },
    },
    contact: {
      hotline: { type: String, default: "+1 (689) 212-8888" },
      email: { type: String, default: "info@xonails.com" },
      address: { type: String, default: "123 Nail Beauty Way, Suite 400, Los Angeles, CA" },
      businessHours: { type: String, default: "Mon - Sat: 9:00 AM - 6:00 PM PST" },
    },
    shipping: {
      shippingFee: { type: Number, default: 4.99 },
      freeShippingThreshold: { type: Number, default: 50 },
    },
    seo: {
      metaTitle: { type: String, default: "X-ON — Press On. Slay On. Repeat." },
      metaDescription: {
        type: String,
        default:
          "Handmade press-on nails and selected nail essentials designed with quality, style, and performance in mind.",
      },
      ogImage: { type: String, default: "/images/IMG_7101.webp" },
    },
  },
  { timestamps: true }
);

// 13. Contact Message Schema
const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: [...CONTACT_MESSAGE_STATUSES],
      default: "new",
    },
  },
  { timestamps: true }
);

export const AdminUserModel = models.AdminUser || model("AdminUser", AdminUserSchema);
export const ProductModel = models.Product || model("Product", ProductSchema);
export const CategoryModel = models.Category || model("Category", CategorySchema);
export const OrderModel = models.Order || model("Order", OrderSchema);
export const CustomerModel = models.Customer || model("Customer", CustomerSchema);
export const ReviewModel = models.Review || model("Review", ReviewSchema);
export const GalleryModel = models.Gallery || model("Gallery", GallerySchema);
export const ComingSoonModel = models.ComingSoon || model("ComingSoon", ComingSoonSchema);
export const WholesaleRequestModel = models.WholesaleRequest || model("WholesaleRequest", WholesaleRequestSchema);
export const BlogPostModel = models.BlogPost || model("BlogPost", BlogPostSchema);
export const NewsletterModel = models.Newsletter || model("Newsletter", NewsletterSchema);
export const SettingsModel = models.Settings || model("Settings", SettingsSchema);
export const ContactMessageModel = models.ContactMessage || model("ContactMessage", ContactMessageSchema);
