/**
 * @fileoverview Footer component with site information and navigation links
 * @module components/Footer
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Smartphone, Shield, ShoppingCart, Mail, Phone, MapPin, Facebook, Youtube, Linkedin } from 'lucide-react';

/**
 * Footer component displaying company info, quick links, and social media
 * @component
 * @returns {JSX.Element} Rendered footer component
 * @example
 * <Footer />
 */
const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-all duration-300 pb-safe md:pb-0">
      <div className="max-w-7xl mx-auto py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2 text-center md:text-left">
            <div className="mb-6">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 flex items-center justify-center shadow-md">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-slate-900 dark:text-white text-xl font-bold">
                  TuneZone <span className="font-normal text-slate-600 dark:text-slate-400">Dealer</span>
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm italic mb-4">Hệ thống quản lý đại lý chuyên nghiệp</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center md:justify-start hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:support@tunezone.com">support@tunezone.com</a>
              </p>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center md:justify-start">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>1900-xxxx</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center md:justify-start">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Hà Nội, Việt Nam</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-slate-900 dark:text-slate-100 text-base font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/products')}
                  className="flex items-center gap-2 justify-center md:justify-start text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm cursor-pointer border-none bg-transparent p-0 font-normal"
                >
                  <Smartphone className="w-4 h-4" />
                  Sản phẩm
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/warranty')}
                  className="flex items-center gap-2 justify-center md:justify-start text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm cursor-pointer border-none bg-transparent p-0 font-normal"
                >
                  <Shield className="w-4 h-4" />
                  Bảo hành
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/cart')}
                  className="flex items-center gap-2 justify-center md:justify-start text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm cursor-pointer border-none bg-transparent p-0 font-normal"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Giỏ hàng
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@tunezone.com"
                  className="flex items-center gap-2 justify-center md:justify-start text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div className="text-center md:text-left">
            <h4 className="text-slate-900 dark:text-slate-100 text-base font-semibold mb-4">Theo dõi</h4>
            <div className="flex flex-col gap-2 mb-6 items-center md:items-start">
              <a
                href="#facebook"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 text-sm"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </a>
              <a
                href="#youtube"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 text-sm"
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </a>
              <a
                href="#linkedin"
                className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 text-sm"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
            <div className="flex flex-col gap-2 items-center md:items-start text-xs">
              <a href="#privacy" className="text-slate-500 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                Chính sách bảo mật
              </a>
              <a href="#terms" className="text-slate-500 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
            <p className="text-slate-500 dark:text-slate-500 text-xs">
              &copy; {currentYear} TuneZone Dealer. Tất cả quyền được bảo lưu.
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-xs opacity-70">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer has no props, so no PropTypes needed

export default Footer;