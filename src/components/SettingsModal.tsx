import React, { useState } from 'react';
import { Settings, X, Save, Building2, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { AdminSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdminSettings;
  onSaveSettings: (newSettings: AdminSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [bankName, setBankName] = useState(settings.bankAccount.bankName);
  const [accountName, setAccountName] = useState(settings.bankAccount.accountName);
  const [accountNumber, setAccountNumber] = useState(settings.bankAccount.accountNumber);
  const [kitchenAddress, setKitchenAddress] = useState(settings.kitchenAddress);
  const [adminWhatsApp, setAdminWhatsApp] = useState(settings.adminWhatsAppNumber);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      adminWhatsAppNumber: adminWhatsApp.trim(),
      kitchenAddress: kitchenAddress.trim(),
      bankAccount: {
        ...settings.bankAccount,
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
      },
    });

    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-stone-950 border border-stone-800 text-stone-100 shadow-2xl p-6">
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                Eatery & Bank Account Configuration
              </h3>
              <p className="text-xs text-stone-400">
                Configure your real company bank account for customer payments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedNotice ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div className="text-base font-bold text-white">Settings Saved Successfully!</div>
            <p className="text-xs text-stone-400">All payment references and tickets will reflect your updated bank details.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* Bank Info */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Company Bank Account
              </span>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. Palmpay, OPay, GTBank"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Company Account Name</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. Muideen Akolade"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Account Number (NUBAN)</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="e.g. 8162128815"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Admin WhatsApp & Kitchen */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Phone className="w-4 h-4" /> Admin WhatsApp & Location
              </span>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Administrative WhatsApp Number</label>
                <input
                  type="text"
                  required
                  value={adminWhatsApp}
                  onChange={e => setAdminWhatsApp(e.target.value)}
                  placeholder="+14849961808"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Kitchen Physical Address</label>
                <input
                  type="text"
                  required
                  value={kitchenAddress}
                  onChange={e => setKitchenAddress(e.target.value)}
                  placeholder="Plot 12 Commercial Avenue, Onitawa Hub, Lagos"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
