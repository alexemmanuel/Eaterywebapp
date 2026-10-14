import React, { useState } from 'react';
import { Search, ChevronRight, PhoneCall, Bike, Sparkles, ShieldCheck } from 'lucide-react';
import { DISPLAY_ADMIN_WHATSAPP } from '../data/menu';

interface HeroProps {
  onSearchCoupon: (code: string) => void;
  onOrderNow: () => void;
  onViewLiveBoard?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSearchCoupon,
  onOrderNow,
  onViewLiveBoard,
}) => {
  const [couponInput, setCouponInput] = useState<string>('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      onSearchCoupon(couponInput.trim());
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden astro-glass astro-glow-amber border border-white/10 shadow-2xl">
      {/* Background Hero Feast Photography with Ambient Vignette */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[480px] overflow-hidden">
        <img
          src="/src/assets/images/onitawas_hero_feast_1791846460688.jpg"
          alt="Onitawa's Catering Service Gourmet Feast"
          className="w-full h-full object-cover scale-105 filter brightness-[0.72] contrast-105 transition-transform duration-700 hover:scale-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/65 to-black/35" />

        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-end">
          <div className="max-w-2xl space-y-4">
            {/* Lead Live Beacon Kicker */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Onitawa’s Catering Service</span>
              </span>
              <span className="text-stone-400 font-mono text-[11px] hidden sm:inline">
                Live Dispatch & Automated Ringer System
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-['Outfit',sans-serif] tracking-tight leading-[1.1] drop-shadow-lg">
              Authentic Native Catering, Cooked Hot & Tracked Live.
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed drop-shadow max-w-xl">
              Order gourmet Amala, Smoky Party Jollof, and Sizzling Peppered Meats. When the kitchen marks Ready, an online call rings on your device with your dispatch coupon code for 3 minutes.
            </p>

            {/* Actions & Coupon Tracker */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onOrderNow}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
              >
                <span>Browse Delicacies & Order</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Modern Glass Coupon Lookup */}
              <form
                onSubmit={handleLookup}
                className="flex items-center rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-1 flex-1 max-w-sm shadow-lg focus-within:border-amber-400/80 transition-colors"
              >
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="Coupon / Ticket # (e.g. ONI-8492)"
                  className="w-full px-3.5 py-2 bg-transparent text-white text-xs placeholder:text-stone-400 focus:outline-none font-mono uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-100 text-xs font-bold shrink-0 transition-colors cursor-pointer border border-white/5"
                  title="Search Coupon"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Astro-style Trust Strip */}
      <div className="p-4 sm:p-5 bg-stone-950/90 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Automated 3-Min Voice Call</span>
            <span className="text-[11px] text-stone-400">Rings with coupon when cooked</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Multi-Courier Dispatch</span>
            <span className="text-[11px] text-stone-400">Chowdeck, Gokada, Kwik & Bolt</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">WhatsApp Duplicate Record</span>
            <span className="text-[11px] text-stone-400 font-mono">{DISPLAY_ADMIN_WHATSAPP}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
