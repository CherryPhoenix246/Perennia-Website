import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

const defaultSettings = {
  business_name: "Perennia",
  tagline: "Handcrafted Luxury from Barbados",
  logo_url: "https://customer-assets.emergentagent.com/job_8aaf14c8-9661-4336-8e9d-83cf935f1bb7/artifacts/f1ti0xuj_Screenshot_20260120_173740_Canva.jpg",
  social_links: {
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    whatsapp: "",
    youtube: "",
    pinterest: ""
  },
  contact_info: {
    address: "Bridgetown, Barbados",
    phone: "+1 (246) 123-4567",
    email: "info@perennia.bb"
  },
  hero_section: {
    tagline: "Handcrafted in Barbados",
    title: "Luxury Artisan",
    subtitle: "Gifts & Décor",
    description: "Discover our collection of handcrafted resin art, natural body care, and artisan candles. Each piece crafted with love and Caribbean spirit.",
    image_url: ""
  },
  about_section: {
    title: "Crafted with Love, Inspired by the Caribbean",
    content: "Perennia was born from a deep passion for artistry and the enchanting beauty of Barbados.",
    quote: "Every piece tells a story of Caribbean beauty and timeless elegance.",
    image_url: ""
  },
  footer_text: "Handcrafted luxury from Barbados. Each piece tells a story of Caribbean artistry and timeless elegance."
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings({ ...defaultSettings, ...response.data });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings, token) => {
    try {
      const response = await axios.put(`${API}/admin/settings`, newSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings({ ...defaultSettings, ...response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        refreshSettings
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};
