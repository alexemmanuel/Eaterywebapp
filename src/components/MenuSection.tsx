import React, { useState } from 'react';
import { Plus, Check, Flame, UtensilsCrossed, Clock } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { MENU_ITEMS } from '../data/menu';

interface MenuSectionProps {
  onAddToCart: (item: MenuItem, spicy?: string, swallow?: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSpicyByItem, setSelectedSpicyByItem] = useState<Record<string, string>>({});
  const [selectedSwallowByItem, setSelectedSwallowByItem] = useState<Record<string, string>>({});
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Delicacies' },
    { id: 'combos', label: 'House Combos' },
    { id: 'swallows', label: 'Native Swallows' },
    { id: 'rice', label: 'Party Rice' },
    { id: 'grills', label: 'Peppered Grills & Asun' },
    { id: 'sides_drinks', label: 'Drinks & Sides' },
  ];

  const filteredItems = MENU_ITEMS.filter(
    item => activeCategory === 'all' || item.category === activeCategory
  );

  const handleAddItem = (item: MenuItem) => {
    const spicy = selectedSpicyByItem[item.id] || (item.spicyLevels ? item.spicyLevels[0] : undefined);
    const swallow = selectedSwallowByItem[item.id] || (item.swallowOptions ? item.swallowOptions[0] : undefined);
    onAddToCart(item, spicy, swallow);

    setAddedItemNotice(item.id);
    setTimeout(() => {
      setAddedItemNotice(null);
    }, 1200);
  };

  return (
    <section id="menu-section" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Freshly Prepared For Every Ticket
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif] tracking-tight mt-1">
            Authentic Nigerian Catering Menu
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Order authentic delicacies from Onitawa’s Catering Service. When ready, your phone receives an automated 3-minute online call with your dispatch coupon code.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10'
                  : 'bg-stone-900/80 text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const isAdded = addedItemNotice === item.id;
          const currentSpicy = selectedSpicyByItem[item.id] || (item.spicyLevels ? item.spicyLevels[0] : '');
          const currentSwallow = selectedSwallowByItem[item.id] || (item.swallowOptions ? item.swallowOptions[0] : '');

          return (
            <div
              key={item.id}
              className="rounded-3xl astro-glass astro-glass-hover overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with 4:3 Aspect Ratio */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-black/20" />

                  {item.isPopular && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                      Featured Delicacy
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="font-mono text-lg font-bold text-amber-400 drop-shadow">
                      ₦{item.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-stone-300 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-amber-400" /> ~{item.prepTimeMinutes}m
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Spicy Selection */}
                  {item.spicyLevels && item.spicyLevels.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" /> Pepper Level:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.spicyLevels.map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() =>
                              setSelectedSpicyByItem(prev => ({ ...prev, [item.id]: lvl }))
                            }
                            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                              currentSpicy === lvl
                                ? 'bg-amber-500 text-stone-950 font-bold'
                                : 'bg-stone-950 text-stone-400 hover:text-white'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Swallow Selection */}
                  {item.swallowOptions && item.swallowOptions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                        <UtensilsCrossed className="w-3 h-3 text-amber-400" /> Choice of Swallow:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.swallowOptions.map(sw => (
                          <button
                            key={sw}
                            type="button"
                            onClick={() =>
                              setSelectedSwallowByItem(prev => ({ ...prev, [item.id]: sw }))
                            }
                            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                              currentSwallow === sw
                                ? 'bg-amber-500 text-stone-950 font-bold'
                                : 'bg-stone-950 text-stone-400 hover:text-white'
                            }`}
                          >
                            {sw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => handleAddItem(item)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-500 text-stone-950'
                      : 'bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added to Tray</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Order Tray</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
