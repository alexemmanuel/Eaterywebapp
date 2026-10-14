// Web Audio API Ringtone & Web Speech Synthesis Call Engine

let audioCtx: AudioContext | null = null;
let ringtoneInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Global unlock listener for mobile iOS/Android browsers
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (_) {}
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

/**
 * Realistic dual-frequency phone ringtone burst (North American / GSM classic ring tone)
 */
export function playRingtoneBurst() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First tone (440Hz -> 480Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.linearRampToValueAtTime(480, now + 0.8);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    // Harmonic companion tone (880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    gain2.gain.setValueAtTime(0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 1.2);

    // Second chime burst after 1.4s
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(480, now + 1.4);
    osc3.frequency.linearRampToValueAtTime(520, now + 2.2);
    gain3.gain.setValueAtTime(0.22, now + 1.4);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 2.6);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 1.4);
    osc3.stop(now + 2.6);
  } catch (err) {
    console.warn('Audio ringtone context error:', err);
  }
}

/**
 * Loops the phone ringtone continuously and triggers physical mobile device vibration
 */
export function startRingtoneLoop() {
  stopRingtoneLoop();
  playRingtoneBurst();
  triggerDeviceVibration();
  ringtoneInterval = window.setInterval(() => {
    playRingtoneBurst();
    triggerDeviceVibration();
  }, 3500);
}

/**
 * Stops the ringtone loop and ceases physical vibration
 */
export function stopRingtoneLoop() {
  if (ringtoneInterval !== null) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  stopDeviceVibration();
}

/**
 * Physical mobile device vibration (works on mobile web browsers & installed PWAs)
 */
export function triggerDeviceVibration() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([400, 200, 400, 200, 800]);
    } catch (e) {
      // Ignore vibration unsupported error
    }
  }
}

export function stopDeviceVibration() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * Trigger real browser/device OS push notification banner
 */
export function triggerSystemNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/src/assets/images/onitawas_hero_feast_1791846460688.jpg',
        });
      } catch (e) {
        // Fallback
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/src/assets/images/onitawas_hero_feast_1791846460688.jpg',
          });
        }
      });
    }
  }
}

/**
 * Plays kitchen order bell / chime
 */
export function playKitchenChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.1); // A5
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  } catch (err) {
    console.warn('Kitchen chime error:', err);
  }
}

/**
 * Speaks the online automated call message:
 * "Your order at Onitawa is ready!" with coupon instructions
 */
export function speakCallMessage(
  customerName: string,
  couponCode: string,
  onEnd?: () => void
): boolean {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  window.speechSynthesis.cancel();

  const phrase = `Attention ${customerName || 'esteemed customer'}, your order at Onitawa is ready! Repeat: your order at Onitawa is hot and ready. Your pickup and dispatch coupon ticket code is: ${couponCode.split('').join(' ')}. Please use this coupon number to collect your food or book a courier dispatcher for live delivery tracking. Thank you for choosing Onitawa's Catering Service!`;

  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.rate = 0.96;
  utterance.pitch = 1.05;
  utterance.lang = 'en-US';

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    v => v.lang.includes('NG') || v.lang.includes('GB') || v.lang.includes('en')
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
