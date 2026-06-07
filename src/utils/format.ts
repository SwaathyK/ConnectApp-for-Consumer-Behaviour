export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// 'YYYY-MM-DD' → 'Tonight', 'Tomorrow', or 'Mon'/'Tue' etc.
export function getRelativeDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const event = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((event.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Tonight';
  if (diff === 1) return 'Tomorrow';
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][event.getDay()];
}

// '6:00 PM' → '6pm',  '7:30 AM' → '7:30am'
export function formatShortTime(time: string): string {
  const [t, period] = time.split(' ');
  const [h, m] = t.split(':');
  const suffix = period.toLowerCase();
  return m === '00' ? `${h}${suffix}` : `${h}:${m}${suffix}`;
}

export function todayISOString(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}
