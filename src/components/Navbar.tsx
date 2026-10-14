import React from 'react';
import { ShoppingBag, Lock, Activity, UtensilsCrossed, Compass } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export type AppNavTab = 'menu' | 'tracker' | 'tracking' | 'admin';

interface NavbarProps {
  activeTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  hasActiveOrder: boolean;
  activeOrdersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  hasActiveOrder,
  activeOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single Brand Zone */}
        <button
          type="button"
          onClick={() => onSelectTab('menu')}
          className="text-left focus:outline-none shrink-0 cursor-pointer"
        >
          <BrandLogo size="sm" showSubtitle={true} />
        </button>

        {/* Zone 2: Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onSelectTab('menu')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'menu'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-stone-400" />
            <span>Delicacies Menu</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('tracker')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tracker'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Request Board</span>
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {hasActiveOrder && (
            <button
              type="button"
              onClick={() => onSelectTab('tracking')}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tracking'
                  ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Track My Order</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectTab('admin')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-stone-500" />
            <span>Admin Portal</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Cart Drawer / Order Tray) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>Order Tray</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-stone-950 text-amber-400 font-mono font-black text-[11px]">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Top Sub-bar */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-800/80 bg-stone-900/90 px-2 py-2 text-[11px] font-semibold text-stone-300">
        <button
          type="button"
          onClick={() => onSelectTab('menu')}
          className={`px-2 py-1 rounded cursor-pointer ${
            activeTab === 'menu' ? 'text-amber-400 font-bold' : ''
          }`}
        >
          Menu
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('tracker')}
          className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer ${
            activeTab === 'tracker' ? 'text-amber-400 font-bold' : ''
          }`}
        >
          <span>Live Board</span>
          {activeOrdersCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>
        {hasActiveOrder && (
          <button
            type="button"
            onClick={() => onSelectTab('tracking')}
            className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer ${
              activeTab === 'tracking' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            <span>My Order</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelectTab('admin')}
          className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer ${
            activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Lock className="w-3 h-3" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};
