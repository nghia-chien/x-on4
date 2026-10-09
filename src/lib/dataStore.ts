import bcrypt from "bcryptjs";
import {
  AdminUser,
  AdminUserWithPassword,
  BlogPostItem,
  CategoryItem,
  ComingSoonItem,
  CustomerItem,
  DashboardStats,
  GalleryItem,
  NewsletterSubscriberItem,
  OrderItem,
  ProductItem,
  ReviewItem,
  SiteSettings,
  WholesaleRequestItem,
  ContactMessageItem,
} from "@/types/admin";
import productsJson from "@/data/products.json";
import siteContentJson from "@/data/site-content.json";
import galleryJson from "@/data/gallery-product.json";

// In-Memory fallback store singleton
interface MemoryStore {
  adminUsers: AdminUserWithPassword[];
  products: ProductItem[];
  categories: CategoryItem[];
  orders: OrderItem[];
  customers: CustomerItem[];
  reviews: ReviewItem[];
  gallery: GalleryItem[];
  comingSoon: ComingSoonItem[];
  wholesale: WholesaleRequestItem[];
  contactMessages: ContactMessageItem[];
  blogs: BlogPostItem[];
  newsletter: NewsletterSubscriberItem[];
  settings: SiteSettings;
  initialized: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __memoryStore: MemoryStore | undefined;
}

function initMemoryStore(): MemoryStore {
  const passwordHash = bcrypt.hashSync("Admin@123456", 10);

  const initialAdmins: AdminUserWithPassword[] = [
    {
      id: "admin-1",
      name: "Master Administrator",
      email: "admin@xonails.com",
      role: "Administrator",
      status: "active",
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: "admin-2",
      name: "Wholesale Partner (B2B)",
      email: "wholesale@xonails.com",
      role: "Wholesale Partner",
      status: "active",
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: "admin-3",
      name: "VIP Retail Customer",
      email: "customer@xonails.com",
      role: "Retail Customer",
      status: "active",
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
  ];

  const initialCategories: CategoryItem[] = [
    {
      id: "cat-1",
      name: "Handmade Nails",
      slug: "handmade-nails",
      description: "Handcrafted artisan press-on nails with multi-layer gel coating.",
      image: "/images/IMG_7098.webp",
      status: "active",
      displayOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-2",
      name: "Best Sellers",
      slug: "best-sellers",
      description: "Most popular nail designs chosen by thousands of beauty lovers.",
      image: "/images/IMG_7099.webp",
      status: "active",
      displayOrder: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-3",
      name: "Almond Shape",
      slug: "almond",
      description: "Feminine, elongating almond shape nail styles.",
      image: "/images/IMG_7100.webp",
      status: "active",
      displayOrder: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-4",
      name: "Coffin Shape",
      slug: "coffin",
      description: "Trendy coffin shape press-ons with sleek tapered edges.",
      image: "/images/IMG_7101.webp",
      status: "active",
      displayOrder: 4,
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-5",
      name: "Bundles & Sets",
      slug: "bundle-and-save",
      description: "Save big with multi-pack press on nail bundles.",
      image: "/images/IMG_7102.webp",
      status: "active",
      displayOrder: 5,
      createdAt: new Date().toISOString(),
    },
  ];

  const initialProducts: ProductItem[] = productsJson.map((p, idx) => ({
    id: p.id || `prod-${idx + 1}`,
    name: p.title || `X-ON Press-On Nails #${7098 + idx}`,
    slug: p.slug || `xo-${7098 + idx}`,
    sku: `XON-${7098 + idx}`,
    description:
      "Handmade luxury press-on nails crafted with ultra-durable Grip-X technology and Cold Gel Tech. Reusable up to 5x with proper care.",
    shortDescription: "Artisan handcrafted cold-gel press-on nails",
    price: 24.99,
    salePrice: idx % 2 === 0 ? 19.99 : null,
    stock: 25 - (idx % 5) * 4,
    images: [p.image || `/images/IMG_${7098 + (idx % 10)}.JPG`],
    thumbnail: p.image || `/images/IMG_${7098 + (idx % 10)}.JPG`,
    category: p.category || "Handmade Grip-X Nails",
    collection: "Spring Luxe 2026",
    shapes: ["Almond", "Coffin", "Square"],
    sizes: ["XS", "S", "M", "L", "Custom"],
    tags: ["handmade", "grip-x", "reusable", "trending"],
    featured: idx < 6,
    bestSeller: idx >= 6 && idx < 12,
    comingSoon: false,
    status: "active",
    createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const initialCustomers: CustomerItem[] = [
    {
      id: "cust-1",
      name: "Jessica Miller",
      email: "jessica.m@example.com",
      phone: "+1 (555) 234-5678",
      totalOrders: 3,
      totalSpent: 89.97,
      lastOrder: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: "active",
      address: "742 Evergreen Terrace, Springfield, OR 97477",
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: "cust-2",
      name: "Sophia Nguyen",
      email: "sophia.n@example.com",
      phone: "+1 (555) 876-5432",
      totalOrders: 5,
      totalSpent: 145.5,
      lastOrder: new Date(Date.now() - 1 * 86400000).toISOString(),
      status: "active",
      address: "10880 Wilshire Blvd, Los Angeles, CA 90024",
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
    {
      id: "cust-3",
      name: "Emma Watson",
      email: "emma.w@example.com",
      phone: "+1 (555) 432-1098",
      totalOrders: 1,
      totalSpent: 29.99,
      lastOrder: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: "active",
      address: "350 5th Ave, New York, NY 10118",
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ];

  const initialOrders: OrderItem[] = [
    {
      id: "ord-1001",
      orderNumber: "XON-1001",
      customer: {
        name: "Sophia Nguyen",
        email: "sophia.n@example.com",
        phone: "+1 (555) 876-5432",
        address: "10880 Wilshire Blvd, Los Angeles, CA 90024",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90024",
        country: "USA",
      },
      items: [
        {
          productId: "xo-7098",
          productName: "X-ON Handmade Press-On Nails #7098",
          productImage: "/images/IMG_7098.webp",
          size: "M",
          quantity: 2,
          price: 19.99,
          subtotal: 39.98,
        },
      ],
      subtotal: 39.98,
      discount: 0,
      shipping: 4.99,
      tax: 3.2,
      total: 48.17,
      paymentMethod: "Credit Card",
      paymentStatus: "paid",
      orderStatus: "processing",
      shippingAddress: "10880 Wilshire Blvd, Los Angeles, CA 90024",
      trackingNumber: "USPS9400100029384",
      notes: "Please leave package by front porch.",
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ord-1002",
      orderNumber: "XON-1002",
      customer: {
        name: "Jessica Miller",
        email: "jessica.m@example.com",
        phone: "+1 (555) 234-5678",
        address: "742 Evergreen Terrace, Springfield, OR 97477",
        city: "Springfield",
        state: "OR",
        zipCode: "97477",
        country: "USA",
      },
      items: [
        {
          productId: "xo-7100",
          productName: "X-ON Handmade Press-On Nails #7100",
          productImage: "/images/IMG_7100.webp",
          size: "S",
          quantity: 1,
          price: 19.99,
          subtotal: 19.99,
        },
        {
          productId: "xo-7101",
          productName: "X-ON Handmade Press-On Nails #7101",
          productImage: "/images/IMG_7101.webp",
          size: "S",
          quantity: 1,
          price: 24.99,
          subtotal: 24.99,
        },
      ],
      subtotal: 44.98,
      discount: 5.0,
      shipping: 0,
      tax: 3.6,
      total: 43.58,
      paymentMethod: "PayPal",
      paymentStatus: "paid",
      orderStatus: "shipped",
      shippingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
      trackingNumber: "FEDEX789012345",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ord-1003",
      orderNumber: "XON-1003",
      customer: {
        name: "Emma Watson",
        email: "emma.w@example.com",
        phone: "+1 (555) 432-1098",
        address: "350 5th Ave, New York, NY 10118",
        city: "New York",
        state: "NY",
        zipCode: "10118",
        country: "USA",
      },
      items: [
        {
          productId: "xo-7102",
          productName: "X-ON Handmade Press-On Nails #7102",
          productImage: "/images/IMG_7102.webp",
          size: "M",
          quantity: 1,
          price: 24.99,
          subtotal: 24.99,
        },
      ],
      subtotal: 24.99,
      discount: 0,
      shipping: 4.99,
      tax: 2.0,
      total: 31.98,
      paymentMethod: "Apple Pay",
      paymentStatus: "pending",
      orderStatus: "pending",
      shippingAddress: "350 5th Ave, New York, NY 10118",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Seed reviews
  const rawReviews = (siteContentJson as { reviews?: { author?: string; rating?: number; text?: string; avatar?: string }[] }).reviews || [];
  const initialReviews: ReviewItem[] = rawReviews.length
    ? rawReviews.map((r, i) => ({
        id: `rev-${i + 1}`,
        customerName: r.author || "Verified Buyer",
        rating: r.rating || 5,
        review: r.text || "Absolutely loved these nails! Perfect fit and stayed on for 3 weeks.",
        productTitle: "X-ON Handmade Press-On Nails #7098",
        productId: "xo-7098",
        images: r.avatar ? [r.avatar] : ["/images/IMG_7098.webp"],
        date: new Date(Date.now() - i * 3 * 86400000).toLocaleDateString("en-US"),
        status: "approved",
        createdAt: new Date(Date.now() - i * 3 * 86400000).toISOString(),
      }))
    : [
        {
          id: "rev-1",
          customerName: "Chloe K.",
          rating: 5,
          review: "The Cold Gel tech is unreal! These look like a $120 salon set and took 5 mins to apply.",
          productTitle: "X-ON Handmade Press-On Nails #7098",
          productId: "xo-7098",
          images: ["/images/IMG_7098.webp"],
          date: "Sep 20, 2026",
          status: "approved",
          createdAt: new Date().toISOString(),
        },
      ];

  // Seed gallery
  const rawGallery = Array.isArray(galleryJson) ? galleryJson : [];
  const initialGallery: GalleryItem[] = rawGallery.length
    ? rawGallery.map((g: { image?: string; title?: string }, i: number) => ({
        id: `gal-${i + 1}`,
        image: g.image || `/images/IMG_${7098 + (i % 8)}.JPG`,
        title: g.title || `Artisan Nail Set #${i + 1}`,
        description: "Customer real-life showcase with Grip-X press on fit.",
        product: "Handmade Grip-X",
        category: "Customer Showcase",
        status: "published",
        displayOrder: i + 1,
        createdAt: new Date().toISOString(),
      }))
    : [
        {
          id: "gal-1",
          image: "/images/IMG_7098.webp",
          title: "Golden Hour Shimmer",
          description: "Stunning gel finish under natural light.",
          product: "XO-7098",
          category: "Almond",
          status: "published",
          displayOrder: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: "gal-2",
          image: "/images/IMG_7099.webp",
          title: "Midnight Velvet Noir",
          description: "Moody velvet cat-eye design.",
          product: "XO-7099",
          category: "Coffin",
          status: "published",
          displayOrder: 2,
          createdAt: new Date().toISOString(),
        },
      ];

  const initialComingSoon: ComingSoonItem[] = [
    {
      id: "cs-1",
      productName: "Aurora Chrome Holographic Edition",
      image: "/images/IMG_7104.webp",
      description: "Prismatic color-shifting chrome press-on set launching next month.",
      expectedReleaseDate: "2026-10-15",
      status: "Coming Soon",
      displayOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "cs-2",
      productName: "Bridal Opal & Pearl Gemstones",
      image: "/images/IMG_7105.webp",
      description: "Delicate handcrafted bridal collection with genuine crystal charms.",
      expectedReleaseDate: "2026-11-01",
      status: "Coming Soon",
      displayOrder: 2,
      createdAt: new Date().toISOString(),
    },
  ];

  const initialWholesale: WholesaleRequestItem[] = [
    {
      id: "ws-1",
      businessName: "Luxe Beauty Studio & Spa",
      contactName: "Amanda Vance",
      email: "amanda@luxebeautyspa.com",
      phone: "+1 (555) 901-2345",
      businessType: "Nail Salon / Spa",
      location: "Miami, FL",
      quantity: "100-250 sets / month",
      message: "Looking to carry X-ON press-on nails for our retail display counter.",
      status: "New",
      adminNotes: "Sent introductory catalog on Sep 22.",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "ws-2",
      businessName: "Glow & Glam Boutique",
      contactName: "Sarah Jenkins",
      email: "sarah@glowglam.com",
      phone: "+1 (555) 345-6789",
      businessType: "Retail Boutique",
      location: "Austin, TX",
      quantity: "50-100 sets / month",
      message: "Interested in wholesale pricing for seasonal collections.",
      status: "New",
      adminNotes: "Waiting for resale tax certificate.",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "ws-3",
      businessName: "Velvet Polish Salon & Lounge",
      contactName: "Rachel Green",
      email: "rachel@velvetpolish.com",
      phone: "+1 (555) 678-9012",
      businessType: "Nail Salon",
      location: "New York, NY",
      quantity: "200+ sets / month",
      message: "Requesting custom salon retail pricing sheet and sample kit.",
      status: "Contacted",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  const initialBlogs: BlogPostItem[] = [
    {
      id: "blog-1",
      title: "How to Make Press-On Nails Last Up to 4 Weeks: Pro Masterclass",
      slug: "how-to-make-press-on-nails-last-4-weeks",
      excerpt: "Step-by-step masterclass on cuticle prep, dehydration, and Cold Gel bonding.",
      content:
        "Press-on nails have evolved dramatically from the flimsy plastic glue-ons of the past. With X-ON's handcrafted acrylic-grade press-ons and Cold Gel adhesive tabs, you can easily achieve salon-grade longevity...\n\n### Step 1: Prep is 90% of the Bond\nAlways gently push back cuticles and lightly buff the shine off your natural nail beds before wiping clean with an alcohol wipe.\n\n### Step 2: Choose the Exact Size\nNever force a size that is too wide or too narrow. If between sizes, size down or gently file the sidewalls.",
      thumbnail: "/images/IMG_7101.webp",
      author: "Mia Nguyen (Master Nail Artist)",
      category: "Nail Care & Tutorials",
      tags: ["tutorials", "press-on tips", "nail care", "diy nail art"],
      status: "Published",
      publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      seoTitle: "How to Make Press-On Nails Last 4 Weeks | X-ON Nails",
      seoDescription: "Learn professional tips to ensure your handmade press-on nails last weeks without lifting.",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "blog-2",
      title: "The Hottest 2026 Nail Trends: Velvet Cat Eye & Micro French",
      slug: "2026-nail-trends-velvet-cat-eye",
      excerpt: "Explore the newest runway nail aesthetics taking over social feeds this season.",
      content:
        "From ethereal shimmer to minimalist micro french lines, here are the top nail art designs everyone is requesting in 2026.",
      thumbnail: "/images/IMG_7099.webp",
      author: "X-ON Creative Team",
      category: "Trend Reports",
      tags: ["trends", "velvet nails", "french tip"],
      status: "Published",
      publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      seoTitle: "Top 2026 Nail Trends & Styles | X-ON Press-Ons",
      seoDescription: "Discover trending press-on nail shapes and colors for 2026.",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const initialNewsletter: NewsletterSubscriberItem[] = [
    {
      id: "nl-1",
      email: "sarah.beauty@example.com",
      status: "Subscribed",
      subscribedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: "nl-2",
      email: "nailart.lover@example.com",
      status: "Subscribed",
      subscribedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "nl-3",
      email: "katie.nails@example.com",
      status: "Subscribed",
      subscribedAt: new Date().toISOString(),
    },
  ];

  const initialContactMessages: ContactMessageItem[] = [
    {
      id: "msg-1",
      name: "Sophia Martinez",
      email: "sophia.m@gmail.com",
      phone: "+1 407-555-0192",
      subject: "Custom Bridal Nail Sizing Question",
      message: "Hi! I am getting married next month and would love a custom almond set with pearls. How far in advance should I order?",
      status: "New",
      createdAt: new Date().toISOString(),
    },
    {
      id: "msg-2",
      name: "Elena Rostova",
      email: "elena@salonstyle.com",
      phone: "+1 689-555-8910",
      subject: "Wholesale Sample Inquiry",
      message: "Hello, we operate 3 salons in Florida and want to test your grip-x cold gel glue samples. Please contact us with pricing.",
      status: "Replied",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const initialSettings: SiteSettings = {
    general: {
      websiteName: "X-ON Nail Shop",
      logo: "/images/IMG_7098.webp",
      favicon: "/favicon.ico",
      contactEmail: "support@xonails.com",
      phone: "+1 (689) 212-8888",
      address: "123 Nail Beauty Way, Suite 400, Los Angeles, CA 90024",
    },
    social: {
      instagram: "https://instagram.com/xon_presson",
      tiktok: "https://tiktok.com/@xon_nails",
      facebook: "https://facebook.com/xonails",
      youtube: "https://youtube.com/@xonails",
    },
    contact: {
      hotline: "+1 (689) 212-8888",
      email: "info@xonails.com",
      address: "123 Nail Beauty Way, Suite 400, Los Angeles, CA 90024",
      businessHours: "Mon - Sat: 9:00 AM - 6:00 PM PST",
    },
    shipping: {
      shippingFee: 4.99,
      freeShippingThreshold: 50.0,
    },
    seo: {
      metaTitle: "X-ON — Press On. Slay On. Repeat. | Handmade Press-on Nails",
      metaDescription:
        "Handmade luxury press-on nails and essentials designed with quality, style, and performance in mind.",
      ogImage: "/images/IMG_7101.webp",
    },
  };

  return {
    adminUsers: initialAdmins,
    products: initialProducts,
    categories: initialCategories,
    orders: initialOrders,
    customers: initialCustomers,
    reviews: initialReviews,
    gallery: initialGallery,
    comingSoon: initialComingSoon,
    wholesale: initialWholesale,
    contactMessages: initialContactMessages,
    blogs: initialBlogs,
    newsletter: initialNewsletter,
    settings: initialSettings,
    initialized: true,
  };
}

export function getStore(): MemoryStore {
  if (!global.__memoryStore) {
    global.__memoryStore = initMemoryStore();
  }
  // Defensive checks in case global.__memoryStore was cached during HMR before new collections were added
  if (!Array.isArray(global.__memoryStore.contactMessages)) global.__memoryStore.contactMessages = [];
  if (!Array.isArray(global.__memoryStore.wholesale)) global.__memoryStore.wholesale = [];
  if (!Array.isArray(global.__memoryStore.blogs)) global.__memoryStore.blogs = [];
  if (!Array.isArray(global.__memoryStore.products)) global.__memoryStore.products = [];
  if (!Array.isArray(global.__memoryStore.categories)) global.__memoryStore.categories = [];
  if (!Array.isArray(global.__memoryStore.orders)) global.__memoryStore.orders = [];
  if (!Array.isArray(global.__memoryStore.customers)) global.__memoryStore.customers = [];
  if (!Array.isArray(global.__memoryStore.reviews)) global.__memoryStore.reviews = [];
  if (!Array.isArray(global.__memoryStore.gallery)) global.__memoryStore.gallery = [];
  if (!Array.isArray(global.__memoryStore.comingSoon)) global.__memoryStore.comingSoon = [];
  if (!Array.isArray(global.__memoryStore.newsletter)) global.__memoryStore.newsletter = [];
  if (!Array.isArray(global.__memoryStore.adminUsers)) global.__memoryStore.adminUsers = [];
  return global.__memoryStore;
}

// Data Store Helpers
export const DataStore = {
  // Admin Users
  getAdmins: () => getStore().adminUsers.map(({ passwordHash: _, ...rest }) => rest),
  getAdminByEmail: (email: string) =>
    getStore().adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  getAdminById: (id: string) => {
    const user = getStore().adminUsers.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash: _, ...rest } = user;
    return rest;
  },
  createAdmin: (data: Omit<AdminUserWithPassword, "id" | "createdAt">) => {
    const store = getStore();
    const newUser: AdminUserWithPassword = {
      ...data,
      id: `admin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.adminUsers.push(newUser);
    const { passwordHash: _, ...rest } = newUser;
    return rest;
  },
  updateAdmin: (id: string, data: Partial<AdminUserWithPassword>) => {
    const store = getStore();
    const index = store.adminUsers.findIndex((u) => u.id === id);
    if (index === -1) return null;
    store.adminUsers[index] = { ...store.adminUsers[index], ...data };
    const { passwordHash: _, ...rest } = store.adminUsers[index];
    return rest;
  },
  deleteAdmin: (id: string) => {
    const store = getStore();
    const index = store.adminUsers.findIndex((u) => u.id === id);
    if (index === -1) return false;
    store.adminUsers.splice(index, 1);
    return true;
  },

  // Products
  getProducts: (params?: {
    search?: string;
    category?: string;
    status?: string;
    shape?: string;
    page?: number;
    limit?: number;
  }) => {
    const store = getStore();
    let list = [...store.products];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.collection?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q))) ||
          (Array.isArray(p.designThemes) && p.designThemes.some((t) => t.toLowerCase().includes(q))) ||
          (Array.isArray(p.shapes) && p.shapes.some((s) => s.toLowerCase().includes(q)))
      );
    }
    if (params?.category && params.category !== "all") {
      list = list.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.status && params.status !== "all") {
      list = list.filter((p) => p.status === params.status);
    }
    if (params?.shape && params.shape !== "all") {
      list = list.filter((p) =>
        p.shapes.some((s) => s.toLowerCase() === params.shape!.toLowerCase())
      );
    }

    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return { products: paginated, total, page, totalPages: Math.ceil(total / limit) };
  },
  getProductById: (id: string) => {
    const store = getStore();
    const q = decodeURIComponent(id || "").toLowerCase().trim();
    return store.products.find(
      (p) =>
        p.id?.toLowerCase() === q ||
        p.slug?.toLowerCase() === q ||
        p.id === id ||
        p.slug === id
    );
  },
  createProduct: (data: Omit<ProductItem, "id" | "createdAt" | "updatedAt">) => {
    const store = getStore();
    const newProduct: ProductItem = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.products.unshift(newProduct);
    return newProduct;
  },
  updateProduct: (id: string, data: Partial<ProductItem>) => {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    store.products[index] = {
      ...store.products[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return store.products[index];
  },
  deleteProduct: (id: string) => {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    store.products.splice(index, 1);
    return true;
  },

  // Categories
  getCategories: () => getStore().categories,
  getCategoryById: (id: string) => getStore().categories.find((c) => c.id === id || c.slug === id),
  createCategory: (data: Omit<CategoryItem, "id" | "createdAt">) => {
    const store = getStore();
    const newCat: CategoryItem = {
      ...data,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.categories.push(newCat);
    return newCat;
  },
  updateCategory: (id: string, data: Partial<CategoryItem>) => {
    const store = getStore();
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    store.categories[idx] = { ...store.categories[idx], ...data };
    return store.categories[idx];
  },
  deleteCategory: (id: string) => {
    const store = getStore();
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    store.categories.splice(idx, 1);
    return true;
  },

  // Orders
  getOrders: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const store = getStore();
    let list = [...store.orders];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== "all") {
      list = list.filter((o) => o.orderStatus === params.status);
    }

    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return { orders: paginated, total, page, totalPages: Math.ceil(total / limit) };
  },
  getOrderById: (id: string) => getStore().orders.find((o) => o.id === id || o.orderNumber === id),
  createOrder: (data: Omit<OrderItem, "id" | "orderNumber" | "createdAt" | "updatedAt">) => {
    const store = getStore();
    const orderNumber = `XON-${1000 + store.orders.length + 1}`;
    const newOrder: OrderItem = {
      ...data,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.orders.unshift(newOrder);

    // Deduct stock for ordered products
    if (Array.isArray(data.items)) {
      data.items.forEach((item) => {
        const prod = store.products.find(
          (p) =>
            p.id === item.productId ||
            p.slug === item.productId ||
            item.productId?.startsWith(`${p.id}-`) ||
            item.productId?.startsWith(`${p.slug}-`) ||
            p.name.toLowerCase() === item.productName?.toLowerCase()
        );
        if (prod) {
          prod.stock = Math.max(0, prod.stock - (item.quantity || 1));
          prod.updatedAt = new Date().toISOString();
        }
      });
    }

    // Update or create customer
    const custIdx = store.customers.findIndex(
      (c) => c.email.toLowerCase() === data.customer.email.toLowerCase()
    );
    if (custIdx !== -1) {
      store.customers[custIdx].totalOrders += 1;
      store.customers[custIdx].totalSpent += data.total;
      store.customers[custIdx].lastOrder = newOrder.createdAt;
    } else {
      store.customers.unshift({
        id: `cust-${Date.now()}`,
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        totalOrders: 1,
        totalSpent: data.total,
        lastOrder: newOrder.createdAt,
        status: "active",
        address: data.shippingAddress,
        createdAt: new Date().toISOString(),
      });
    }

    return newOrder;
  },
  updateOrder: (id: string, data: Partial<OrderItem>) => {
    const store = getStore();
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    store.orders[idx] = {
      ...store.orders[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return store.orders[idx];
  },
  deleteOrder: (id: string) => {
    const store = getStore();
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    store.orders.splice(idx, 1);
    return true;
  },

  // Customers
  getCustomers: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const store = getStore();
    let list = [...store.customers];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    if (params?.status && params.status !== "all") {
      list = list.filter((c) => c.status === params.status);
    }

    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return { customers: paginated, total, page, totalPages: Math.ceil(total / limit) };
  },
  getCustomerById: (id: string) => {
    const store = getStore();
    const customer = store.customers.find((c) => c.id === id || c.email === id);
    if (!customer) return null;
    const orders = store.orders.filter(
      (o) => o.customer.email.toLowerCase() === customer.email.toLowerCase()
    );
    return { customer, orders };
  },
  updateCustomer: (id: string, data: Partial<CustomerItem>) => {
    const store = getStore();
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    store.customers[idx] = { ...store.customers[idx], ...data };
    return store.customers[idx];
  },
  deleteCustomer: (id: string) => {
    const store = getStore();
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    store.customers.splice(idx, 1);
    return true;
  },

  // Reviews
  getReviews: (params?: { status?: string }) => {
    const store = getStore();
    let list = [...store.reviews];
    if (params?.status && params.status !== "all") {
      list = list.filter((r) => r.status === params.status);
    }
    return list;
  },
  updateReview: (id: string, data: Partial<ReviewItem>) => {
    const store = getStore();
    const idx = store.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    store.reviews[idx] = { ...store.reviews[idx], ...data };
    return store.reviews[idx];
  },
  createReview: (data: Omit<ReviewItem, "id" | "createdAt">) => {
    const store = getStore();
    const newReview: ReviewItem = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.reviews.unshift(newReview);
    return newReview;
  },
  deleteReview: (id: string) => {
    const store = getStore();
    const idx = store.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    store.reviews.splice(idx, 1);
    return true;
  },

  // Gallery
  getGallery: () => getStore().gallery,
  createGalleryItem: (data: Omit<GalleryItem, "id" | "createdAt">) => {
    const store = getStore();
    const newItem: GalleryItem = {
      ...data,
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.gallery.push(newItem);
    return newItem;
  },
  updateGalleryItem: (id: string, data: Partial<GalleryItem>) => {
    const store = getStore();
    const idx = store.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    store.gallery[idx] = { ...store.gallery[idx], ...data };
    return store.gallery[idx];
  },
  deleteGalleryItem: (id: string) => {
    const store = getStore();
    const idx = store.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    store.gallery.splice(idx, 1);
    return true;
  },

  // Coming Soon
  getComingSoon: () => getStore().comingSoon,
  createComingSoon: (data: Omit<ComingSoonItem, "id" | "createdAt">) => {
    const store = getStore();
    const newItem: ComingSoonItem = {
      ...data,
      id: `cs-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.comingSoon.push(newItem);
    return newItem;
  },
  updateComingSoon: (id: string, data: Partial<ComingSoonItem>) => {
    const store = getStore();
    const idx = store.comingSoon.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    store.comingSoon[idx] = { ...store.comingSoon[idx], ...data };
    return store.comingSoon[idx];
  },
  deleteComingSoon: (id: string) => {
    const store = getStore();
    const idx = store.comingSoon.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    store.comingSoon.splice(idx, 1);
    return true;
  },

  // Wholesale
  getWholesale: (params?: { status?: string }) => {
    const store = getStore();
    let list = [...store.wholesale];
    if (params?.status && params.status !== "all") {
      list = list.filter((w) => w.status === params.status);
    }
    return list;
  },
  createWholesale: (data: Omit<WholesaleRequestItem, "id" | "createdAt">) => {
    const store = getStore();
    const newItem: WholesaleRequestItem = {
      ...data,
      id: `ws-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.wholesale.unshift(newItem);
    return newItem;
  },
  updateWholesale: (id: string, data: Partial<WholesaleRequestItem>) => {
    const store = getStore();
    const idx = store.wholesale.findIndex((w) => w.id === id);
    if (idx === -1) return null;
    store.wholesale[idx] = { ...store.wholesale[idx], ...data };
    return store.wholesale[idx];
  },
  deleteWholesale: (id: string) => {
    const store = getStore();
    const idx = store.wholesale.findIndex((w) => w.id === id);
    if (idx === -1) return false;
    store.wholesale.splice(idx, 1);
    return true;
  },

  // Blog
  getBlogs: (params?: { status?: string; search?: string }) => {
    const store = getStore();
    let list = [...store.blogs];
    if (params?.status && params.status !== "all") {
      list = list.filter((b) => b.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q));
    }
    return list;
  },
  getBlogById: (id: string) => getStore().blogs.find((b) => b.id === id || b.slug === id),
  createBlog: (data: Omit<BlogPostItem, "id" | "createdAt" | "updatedAt">) => {
    const store = getStore();
    const newItem: BlogPostItem = {
      ...data,
      id: `blog-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.blogs.unshift(newItem);
    return newItem;
  },
  updateBlog: (id: string, data: Partial<BlogPostItem>) => {
    const store = getStore();
    const idx = store.blogs.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    store.blogs[idx] = {
      ...store.blogs[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return store.blogs[idx];
  },
  deleteBlog: (id: string) => {
    const store = getStore();
    const idx = store.blogs.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    store.blogs.splice(idx, 1);
    return true;
  },

  // Newsletter
  getNewsletter: () => getStore().newsletter,
  createNewsletter: (email: string) => {
    const store = getStore();
    const existing = store.newsletter.find((n) => n.email.toLowerCase() === email.toLowerCase());
    if (existing) return existing;
    const newItem: NewsletterSubscriberItem = {
      id: `nl-${Date.now()}`,
      email,
      status: "Subscribed",
      subscribedAt: new Date().toISOString(),
    };
    store.newsletter.unshift(newItem);
    return newItem;
  },
  deleteNewsletter: (id: string) => {
    const store = getStore();
    const idx = store.newsletter.findIndex((n) => n.id === id || n.email === id);
    if (idx === -1) return false;
    store.newsletter.splice(idx, 1);
    return true;
  },

  // Contact Messages
  getContactMessages: (params?: { status?: string; search?: string }) => {
    const store = getStore();
    let list = [...store.contactMessages];
    if (params?.status && params.status !== "all") {
      list = list.filter((m) => m.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }
    return list;
  },
  createContactMessage: (
    data: Omit<ContactMessageItem, "id" | "createdAt" | "status"> & { status?: "New" | "Replied" | "Resolved" }
  ) => {
    const store = getStore();
    const newItem: ContactMessageItem = {
      id: `msg-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      subject: data.subject || "General Inquiry",
      message: data.message,
      status: data.status || "New",
      createdAt: new Date().toISOString(),
    };
    store.contactMessages.unshift(newItem);
    return newItem;
  },
  updateContactMessageStatus: (id: string, status: "New" | "Replied" | "Resolved") => {
    const store = getStore();
    const item = store.contactMessages.find((m) => m.id === id);
    if (!item) return null;
    item.status = status;
    return item;
  },
  deleteContactMessage: (id: string) => {
    const store = getStore();
    const idx = store.contactMessages.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    store.contactMessages.splice(idx, 1);
    return true;
  },

  // Settings
  getSettings: () => getStore().settings,
  updateSettings: (data: Partial<SiteSettings>) => {
    const store = getStore();
    store.settings = {
      ...store.settings,
      ...data,
      general: { ...store.settings.general, ...(data.general || {}) },
      social: { ...store.settings.social, ...(data.social || {}) },
      contact: { ...store.settings.contact, ...(data.contact || {}) },
      shipping: { ...store.settings.shipping, ...(data.shipping || {}) },
      seo: { ...store.settings.seo, ...(data.seo || {}) },
    };
    return store.settings;
  },

  // Dashboard Statistics
  getDashboardStats: (period: "7d" | "30d" | "3m" | "12m" = "30d"): DashboardStats => {
    const store = getStore();
    const totalRevenue = store.orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((acc, o) => acc + o.total, 0);
    const totalOrders = store.orders.length;
    const totalProducts = store.products.length;
    const totalCustomers = store.customers.length;
    const pendingOrders = store.orders.filter((o) => o.orderStatus === "pending").length;
    const wholesaleRequests = store.wholesale.filter((w) => w.status === "New").length;

    // Generate chart data points based on period
    const labels: string[] = [];
    const revenue: number[] = [];
    const orders: number[] = [];

    const numPoints = period === "7d" ? 7 : period === "30d" ? 6 : period === "3m" ? 12 : 12;
    for (let i = numPoints - 1; i >= 0; i--) {
      if (period === "7d") {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
      } else if (period === "30d") {
        labels.push(`Week ${numPoints - i}`);
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push(d.toLocaleDateString("en-US", { month: "short" }));
      }
      revenue.push(Math.round(400 + Math.sin(i * 1.5) * 200 + (numPoints - i) * 80));
      orders.push(Math.round(8 + Math.cos(i) * 4 + (numPoints - i) * 2));
    }

    const recentOrders = store.orders.slice(0, 5);

    // Dynamically calculate best sellers from real order items in store
    const salesMap: Record<string, { id: string; name: string; image: string; price: number; quantitySold: number; revenue: number }> = {};
    store.orders.forEach((ord) => {
      if (Array.isArray(ord.items)) {
        ord.items.forEach((item) => {
          if (!salesMap[item.productId]) {
            salesMap[item.productId] = {
              id: item.productId,
              name: item.productName,
              image: item.productImage,
              price: item.price,
              quantitySold: 0,
              revenue: 0,
            };
          }
          salesMap[item.productId].quantitySold += item.quantity;
          salesMap[item.productId].revenue += item.subtotal || item.price * item.quantity;
        });
      }
    });

    let bestSellingProducts = Object.values(salesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // Fallback to top products if no orders exist yet
    if (bestSellingProducts.length === 0) {
      bestSellingProducts = store.products.slice(0, 4).map((p, i) => ({
        id: p.id,
        name: p.name,
        image: p.thumbnail,
        price: p.price,
        quantitySold: 12 - i * 2,
        revenue: (12 - i * 2) * p.price,
      }));
    }

    const lowStockProducts = store.products
      .filter((p) => p.stock <= 10)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        image: p.thumbnail,
        sku: p.sku,
        stock: p.stock,
        status: p.stock === 0 ? "Out of stock" : "Low stock",
      }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      wholesaleRequests,
      vipSubscribersCount: store.newsletter.length,
      contactMessagesCount: store.contactMessages.length,
      recentOrders,
      recentWholesale: store.wholesale.slice(0, 5),
      recentSubscribers: store.newsletter.slice(0, 10),
      recentContacts: store.contactMessages.slice(0, 5),
      salesOverview: { labels, revenue, orders },
      bestSellingProducts,
      lowStockProducts,
    };
  },
};
