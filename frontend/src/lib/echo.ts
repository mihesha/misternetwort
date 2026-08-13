import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Setup pusher globally so Echo can find it
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

const echo = typeof window !== 'undefined' ? new Echo({
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'reverbkey',
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || (typeof window !== 'undefined' ? window.location.hostname : 'localhost'),
  wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080),
  wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080),
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
}) : null;

export default echo;
