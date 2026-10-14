import React, { useState } from 'react';
import { Bike, Shield, Clock, Check, ChevronRight } from 'lucide-react';
import { CourierProvider, RiderDetails } from '../types';
import { COURIER_PROVIDERS, DEMO_RIDERS } from '../data/menu';

interface CourierSelectorProps {
  couponCode: string;
  onCourierSelected: (courier: CourierProvider, rider: RiderDetails) => void;
  isLoading?: boolean;
}

export const CourierSelector: React.FC<CourierSelectorProps> = ({
  couponCode,
  onCourierSelected,
  isLoading = false,
}) => {
  const [selectedCourierId, setSelectedCourierId] = useState<string>('chowdeck');

  const selectedProvider = COURIER_PROVIDERS.find(c => c.id === selectedCourierId) || COURIER_PROVIDERS[0];

  const handleConfirmDispatch = () => {
    // Pick rider matching or round-robin
    const riderSeed = DEMO_RIDERS[Math.floor(Math.random() * DEMO_RIDERS.length)];
    const assignedRider: RiderDetails = {
      id: `RD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: riderSeed.name,
      courierName: selectedProvider.name,
      phone: riderSeed.phone,
      bikeModel: riderSeed.bikeModel,
      plateNumber: riderSeed.plateNumber,
      rating: riderSeed.rating,
    };

    onCourierSelected(selectedProvider, assignedRider);
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div>
          <h3 className="text-base font-bold text-white font-['Outfit',sans-serif] flex items-center gap-2">
            <Bike className="w-5 h-5 text-amber-400" />
            <span>Select Courier Service For Dispatch</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            You initiate and authorize your delivery rider. Present coupon{' '}
            <span className="font-mono text-amber-300 font-bold">{couponCode}</span> at pickup.
          </p>
        </div>
      </div>

      {/* Available Integrated Couriers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
        {COURIER_PROVIDERS.map(courier => {
          const isSelected = courier.id === selectedCourierId;
          return (
            <button
              key={courier.id}
              type="button"
              onClick={() => setSelectedCourierId(courier.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/10 shadow-md ring-1 ring-amber-400/30'
                  : 'border-stone-800 bg-stone-950/70 hover:border-stone-700 hover:bg-stone-950'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{courier.logo}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{courier.name}</h4>
                    <span className="text-[11px] text-stone-400">{courier.vehicleType}</span>
                  </div>
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-stone-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pickup in ~{courier.estimatedPickupMins}m</span>
                </div>
                <div className="font-mono font-bold text-emerald-400">
                  ₦{courier.baseDeliveryFee.toLocaleString()}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Partner Highlight & Dispatch Trigger */}
      <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-xl shrink-0">
            {selectedProvider.logo}
          </div>
          <div>
            <div className="text-xs font-semibold text-white">
              Dispatching via {selectedProvider.name}
            </div>
            <div className="text-[11px] text-stone-400 flex items-center gap-2">
              <span>{selectedProvider.description}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-amber-300">
                <Shield className="w-3 h-3" /> {selectedProvider.rating} ★
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirmDispatch}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Pairing Rider...' : 'Confirm & Dispatch Rider'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
