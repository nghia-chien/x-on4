"use client";


import { apiFetch } from "@/lib/apiClient";
import React, { useEffect, useState } from "react";
import { SiteSettings } from "@/types/admin";
import { useToast } from "@/context/ToastContext";
import {
  Settings as SettingsIcon,
  Globe,
  Share2,
  Phone,
  Truck,
  Search,
  Save
} from "lucide-react";

export default function AdminSettingsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<
    "general" | "social" | "contact" | "shipping" | "seo"
  >("general");

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiFetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSettings(json.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
const res = await apiFetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success("Store settings updated successfully");
        setSettings(json.data);
      } else {
        error(json.message || "Failed to update settings");
      }
    } catch {
      error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <span className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin inline-block" />
        <p className="text-xs text-neutral-500 mt-2">Loading store configuration...</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Store Settings & Configuration
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure branding, social media channels, shipping thresholds, and SEO meta.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1 h-fit">
          {[
            { id: "general", label: "General & Branding", icon: Globe },
            { id: "social", label: "Social Media Links", icon: Share2 },
            { id: "contact", label: "Contact & Hours", icon: Phone },
            { id: "shipping", label: "Shipping Rates", icon: Truck },
            { id: "seo", label: "SEO & Search Meta", icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.id as "general" | "social" | "contact" | "shipping" | "seo"
                  )
                }
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                  active
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-5">
          {/* 1. General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                General Store Identity
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Website Brand Name
                </label>
                <input
                  type="text"
                  value={settings.general.websiteName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, websiteName: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Store Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, contactEmail: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Public Hotline
                  </label>
                  <input
                    type="text"
                    value={settings.general.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, phone: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Registered Business Address
                </label>
                <input
                  type="text"
                  value={settings.general.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, address: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* 2. Social Tab */}
          {activeTab === "social" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Social Media Channels
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Instagram URL
                </label>
                <input
                  type="text"
                  value={settings.social.instagram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      social: { ...settings.social, instagram: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  TikTok URL
                </label>
                <input
                  type="text"
                  value={settings.social.tiktok}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      social: { ...settings.social, tiktok: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={settings.social.facebook}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      social: { ...settings.social, facebook: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* 3. Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Contact & Support Information
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Customer Support Hotline
                </label>
                <input
                  type="text"
                  value={settings.contact.hotline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: { ...settings.contact, hotline: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Business & Studio Hours
                </label>
                <input
                  type="text"
                  value={settings.contact.businessHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: { ...settings.contact, businessHours: e.target.value }
                    })
                  }
                  placeholder="Mon - Sat: 9:00 AM - 6:00 PM PST"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* 4. Shipping Tab */}
          {activeTab === "shipping" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Shipping Configuration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Standard Shipping Fee ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.shipping.shippingFee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shipping: {
                          ...settings.shipping,
                          shippingFee: Number(e.target.value)
                        }
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Free Shipping Minimum Threshold ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={settings.shipping.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shipping: {
                          ...settings.shipping,
                          freeShippingThreshold: Number(e.target.value)
                        }
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-emerald-600 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Carts above this amount will automatically receive free shipping.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Search Engine Optimization (SEO)
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Global Meta Title
                </label>
                <input
                  type="text"
                  value={settings.seo.metaTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, metaTitle: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Global Meta Description
                </label>
                <textarea
                  rows={3}
                  value={settings.seo.metaDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, metaDescription: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  OpenGraph Share Image URL
                </label>
                <input
                  type="text"
                  value={settings.seo.ogImage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, ogImage: e.target.value }
                    })
                  }
                  placeholder="/images/IMG_7101.webp"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
