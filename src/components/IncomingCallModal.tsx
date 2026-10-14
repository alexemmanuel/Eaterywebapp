import React, { useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff, Volume2, Mic, CheckCircle2, Bike, Ticket } from 'lucide-react';
import { Order } from '../types';
import {
  startRingtoneLoop,
  stopRingtoneLoop,
  speakCallMessage,
  stopSpeaking,
  triggerSystemNotification,
} from '../utils/audio';

interface IncomingCallModalProps {
  order: Order | null;
  isOpen: boolean;
  onDismiss: () => void;
  onNavigateToTracking?: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  order,
  isOpen,
  onDismiss,
  onNavigateToTracking,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180); // 3 minutes = 180s
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const durationTimerRef = useRef<number | null>(null);

  // When call modal opens, initiate 3-minute timer and phone ringtone
  useEffect(() => {
    if (isOpen && order) {
      setCallState('ringing');
      setSecondsRemaining(180);
      setCallDuration(0);
      setIsSpeaking(false);

      // Trigger OS/Browser push notification banner
      triggerSystemNotification(
        "🍲 Your order at Onitawa is ready!",
        `Ticket #${order.id} is ready. Coupon: ${order.couponCode}`
      );

      // Start ringtone sound & physical vibration
      startRingtoneLoop();

      // Start 3-minute ring countdown
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopRingtoneLoop();
      stopSpeaking();
      if (timerRef.current) clearInterval(timerRef.current);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }

    return () => {
      stopRingtoneLoop();
      stopSpeaking();
      if (timerRef.current) clearInterval(timerRef.current);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [isOpen, order]);

  const handleTimeout = () => {
    stopRingtoneLoop();
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('ended');
    setTimeout(() => {
      onDismiss();
    }, 1500);
  };

  const handleAnswerCall = () => {
    stopRingtoneLoop();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('connected');
    setIsSpeaking(true);

    // Start in-call duration counter
    durationTimerRef.current = window.setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Speak the automated kitchen notification
    if (order) {
      speakCallMessage(order.customerName, order.couponCode, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleOffCall = () => {
    stopRingtoneLoop();
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallState('ended');
    setTimeout(() => {
      onDismiss();
    }, 400);
  };

  if (!isOpen || !order) return null;

  const minutesLeft = Math.floor(secondsRemaining / 60);
  const secsLeft = secondsRemaining % 60;
  const formattedTimeLeft = `${String(minutesLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`;

  const callMins = Math.floor(callDuration / 60);
  const callSecs = callDuration % 60;
  const formattedCallDuration = `${String(callMins).padStart(2, '0')}:${String(callSecs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl bg-stone-950 border border-stone-800 text-white shadow-2xl overflow-hidden p-6 text-center">
        {/* Top Header */}
        <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
          {callState === 'ringing'
            ? 'Incoming Online Call'
            : callState === 'connected'
            ? 'Connected • Kitchen Dispatch'
            : 'Call Ended'}
        </div>

        {/* Caller Avatar / Waves */}
        <div className="my-6 relative flex items-center justify-center">
          {callState === 'ringing' && (
            <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/40 animate-ping" />
          )}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-1 shadow-lg shadow-amber-500/20 relative z-10 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center">
              <span className="text-3xl">🍲</span>
            </div>
          </div>
        </div>

        {/* Caller Info */}
        <h3 className="text-xl font-bold font-['Outfit',sans-serif] text-stone-100 mb-1">
          Onitawa’s Kitchen Dispatch
        </h3>
        <p className="text-xs text-stone-400 mb-1">
          Calling your phone:{' '}
          <span className="text-amber-300 font-mono font-medium">{order.customerPhone}</span>
        </p>

        {/* State details */}
        {callState === 'ringing' && (
          <div className="my-4 p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-left space-y-2.5">
            <div className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5 text-center">
              <Volume2 className="w-4 h-4 animate-bounce shrink-0" />
              <span>“Your order at Onitawa is ready!”</span>
            </div>

            <div className="text-center text-xs text-stone-300">
              Auto-ringing countdown: <span className="font-mono text-amber-400 font-bold">{formattedTimeLeft}</span> (3 mins limit)
            </div>

            {/* Quick Cellular & WhatsApp Connect */}
            <div className="pt-2 border-t border-stone-800 space-y-1.5">
              <div className="text-[11px] text-stone-400 font-medium text-center">
                Want your physical device to ring directly?
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={`tel:${order.customerPhone}`}
                  className="py-2 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-center flex items-center justify-center gap-1 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>SIM Carrier Call</span>
                </a>
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `🍲 *ONITAWA KITCHEN CALL ALERT*\n\nHello ${order.customerName},\nYour food is HOT & READY!\nCoupon Code: *${order.couponCode}*\nTicket: #${order.id}\n\nPlease tap to collect or track your rider!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-center flex items-center justify-center gap-1 transition-all"
                >
                  <span>WhatsApp Ring</span>
                </a>
              </div>
            </div>

            <div className="text-[10px] text-stone-500 text-center leading-relaxed">
              🔊 In-browser ring audio & vibration active. Tap <strong>Answer Call</strong> below to listen to the automated kitchen voice announcement.
            </div>
          </div>
        )}

        {callState === 'connected' && (
          <div className="my-4 p-3 rounded-xl bg-stone-900/90 border border-emerald-900/50 text-left">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                Live Voice Synthesis
              </span>
              <span className="font-mono">{formattedCallDuration}</span>
            </div>

            {/* Audio Wave Simulation */}
            <div className="flex items-center justify-center gap-1 h-6 my-2">
              {[40, 75, 100, 60, 90, 45, 80, 65, 30].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full bg-emerald-400 transition-all duration-150 ${
                    isSpeaking ? 'opacity-90 animate-pulse' : 'opacity-30'
                  }`}
                  style={{ height: isSpeaking ? `${h}%` : '20%' }}
                />
              ))}
            </div>

            <p className="text-xs text-stone-200 italic mb-2">
              “Your order at Onitawa is ready! Please use coupon <span className="text-amber-400 font-mono font-bold">{order.couponCode}</span> to collect or book your dispatcher.”
            </p>

            <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-stone-300">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                <span>Ticket #{order.id}</span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-400">{order.couponCode}</span>
            </div>
          </div>
        )}

        {callState === 'ended' && (
          <div className="my-4 p-3 rounded-xl bg-stone-900 text-xs text-stone-400">
            Call completed. Coupon saved to your dashboard.
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-around gap-4">
          {callState === 'ringing' ? (
            <>
              {/* Off it / Intercept Button */}
              <button
                type="button"
                onClick={handleOffCall}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-600/90 hover:bg-red-500 text-white font-medium text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-lg shadow-red-900/30"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Off Call (Intercept)</span>
              </button>

              {/* Answer Call Button */}
              <button
                type="button"
                onClick={handleAnswerCall}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-lg shadow-emerald-900/30"
              >
                <Phone className="w-5 h-5 animate-bounce" />
                <span>Answer Call</span>
              </button>
            </>
          ) : callState === 'connected' ? (
            <div className="w-full flex flex-col gap-2">
              {onNavigateToTracking && (
                <button
                  type="button"
                  onClick={() => {
                    handleOffCall();
                    onNavigateToTracking();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Bike className="w-4 h-4" />
                  <span>Book Dispatcher & Track Delivery</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleOffCall}
                className="w-full py-2 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <PhoneOff className="w-4 h-4 text-red-400" />
                <span>End Call</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-stone-500">Closing...</div>
          )}
        </div>
      </div>
    </div>
  );
};
