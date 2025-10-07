import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Smartphone, Shield, ShoppingCart, Mail, Phone, MapPin, Facebook, Youtube, Linkedin } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-auto transition-all duration-300 pb-safe md:pb-0">
      <div className="max-w-screen-5xl mx-auto py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 2xl:py-16 3xl:py-18 4xl:py-22 5xl:py-26 px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-4 5xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-14 4xl:gap-16 5xl:gap-20 mb-6 sm:mb-7 md:mb-8 lg:mb-10 xl:mb-12 2xl:mb-14 3xl:mb-16 4xl:mb-18 5xl:mb-20">
          {/* Company Info */}
          <div className="lg:col-span-2 text-center md:text-left">
            <div className="mb-4 sm:mb-5">
              <h3 className="text-primary-500 flex items-center gap-2 justify-center md:justify-start text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl 5xl:text-6xl font-semibold mb-2 sm:mb-2.5 md:mb-3 lg:mb-3.5 xl:mb-4 2xl:mb-4.5 3xl:mb-5 4xl:mb-6 5xl:mb-7">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 3xl:w-12 3xl:h-12 4xl:w-14 4xl:h-14 5xl:w-16 5xl:h-16" />
                TuneZone Dealer
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-7 2xl:mb-8 3xl:mb-9 4xl:mb-10 5xl:mb-12 italic text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">Hệ thống quản lý đại lý chuyên nghiệp</p>
            </div>
            <div className="space-y-2 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                support@tunezone.com
              </p>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center md:justify-start">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                1900-xxxx
              </p>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 justify-center md:justify-start">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                Hà Nội, Việt Nam
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-slate-900 dark:text-slate-100 text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl 5xl:text-5xl font-semibold mb-3 sm:mb-4 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-7 3xl:mb-8 4xl:mb-10 5xl:mb-12">Liên kết nhanh</h4>
            <ul className="space-y-1.5 sm:space-y-2 md:space-y-2 lg:space-y-2.5 xl:space-y-3 2xl:space-y-3.5 3xl:space-y-4 4xl:space-y-5 5xl:space-y-6">
              <li>
                <button onClick={() => navigate('/products')} className="flex items-center gap-2 justify-center md:justify-start text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl cursor-pointer border-none bg-transparent p-0 font-normal">
                  <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                  Sản phẩm
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/warranty')} className="flex items-center gap-2 justify-center md:justify-start text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl cursor-pointer border-none bg-transparent p-0 font-normal">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                  Bảo hành
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/cart')} className="flex items-center gap-2 justify-center md:justify-start text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl cursor-pointer border-none bg-transparent p-0 font-normal">
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                  Giỏ hàng
                </button>
              </li>
              <li>
                <a href="mailto:support@tunezone.com" className="flex items-center gap-2 justify-center md:justify-start text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="text-center md:text-left">
            <h4 className="text-slate-900 dark:text-slate-100 text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl 5xl:text-5xl font-semibold mb-3 sm:mb-4 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-7 3xl:mb-8 4xl:mb-10 5xl:mb-12">Dịch vụ</h4>
            <ul className="space-y-1.5 sm:space-y-2 md:space-y-2 lg:space-y-2.5 xl:space-y-3 2xl:space-y-3.5 3xl:space-y-4 4xl:space-y-5 5xl:space-y-6">
              <li><a href="#dealer-management" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">Quản lý đại lý</a></li>
              <li><a href="#inventory" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">Quản lý kho</a></li>
              <li><a href="#sales" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">Báo cáo bán hàng</a></li>
              <li><a href="#training" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">Đào tạo</a></li>
            </ul>
          </div>

          {/* Social & Legal */}
          <div className="text-center md:text-left">
            <h4 className="text-slate-900 dark:text-slate-100 text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl 5xl:text-5xl font-semibold mb-3 sm:mb-4 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-7 3xl:mb-8 4xl:mb-10 5xl:mb-12">Theo dõi chúng tôi</h4>
            <div className="flex flex-col gap-2 mb-4 sm:mb-5 md:mb-5 lg:mb-6 xl:mb-7 2xl:mb-8 3xl:mb-9 4xl:mb-10 5xl:mb-12 items-center md:items-start">
              <a href="#facebook" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">
                <Facebook className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                Facebook
              </a>
              <a href="#youtube" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">
                <Youtube className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                YouTube
              </a>
              <a href="#linkedin" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">
                <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
                LinkedIn
              </a>
            </div>
            <div className="flex flex-col gap-2 items-center md:items-start">
              <a href="#privacy" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl">Chính sách bảo mật</a>
              <a href="#terms" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-300 text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl">Điều khoản sử dụng</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 sm:pt-5 md:pt-5 lg:pt-6 xl:pt-7 2xl:pt-8 3xl:pt-9 4xl:pt-10 5xl:pt-12 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl">&copy; {currentYear} TuneZone Dealer. Tất cả quyền được bảo lưu.</p>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl opacity-70">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;