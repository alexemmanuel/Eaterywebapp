import React from 'react';
import { Utensils, Activity, ShoppingBag, Compass, Lock } from 'lucide-react';
import { AppNavTab } from './Navbar';

interface MobileBottomNavProps {
  activeTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  hasActiveOrder: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  hasActiveOrder,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-stone-800 md:hidden safe-area-bottom pb-env">
      <nav className="grid grid-cols-5 h-16 items-center px-1">
        {/* Tab 1: Menu */}
        <button
          type="button"
          onClick={() => onSelectTab('menu')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            activeTab === 'menu' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>

        {/* Tab 2: Live Request Board */}
        <button
          type="button"
          onClick={() => onSelectTab('tracker')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            activeTab === 'tracker' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Live Board</span>
        </button>

        {/* Tab 3: Order Tray (Center Highlight) */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative -top-2 flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 shadow-lg shadow-amber-500/30 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-black border border-stone-950">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold text-amber-300 mt-0.5">Tray</span>
        </button>

        {/* Tab 4: My Order Tracker */}
        <button
          type="button"
          onClick={() => onSelectTab('tracking')}
          className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            activeTab === 'tracking' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5" />
            {hasActiveOrder && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">My Order</span>
        </button>

        {/* Tab 5: Admin Portal */}
        <button
          type="button"
          onClick={() => onSelectTab('admin')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Admin</span>
        </button>
      </nav>
    </div>
  );
};
