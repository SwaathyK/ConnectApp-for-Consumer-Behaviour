// Department list — used in onboarding Step 2
export const DEPARTMENTS = [
  'Business',
  'Economics',
  'Computer Science',
  'Sciences',
  'Arts & Humanities',
  'Other',
] as const;

export type Department = typeof DEPARTMENTS[number];

// Legacy course list kept for any existing data compatibility
export const COURSES = [
  'Computer Science',
  'Economics',
  'Engineering',
  'Law',
  'Medicine',
  'Philosophy, Politics & Economics (PPE)',
  'Psychology',
  'Business & Management',
  'Mathematics',
  'Physics',
  'History',
  'English & Comparative Literature',
  'Film & Television Studies',
  'Sociology',
  'Data Science',
  'Other',
];

export const COUNTRIES = [
  'United Kingdom',
  'China',
  'India',
  'United States',
  'Germany',
  'France',
  'Nigeria',
  'Malaysia',
  'Hong Kong',
  'Singapore',
  'South Korea',
  'Brazil',
  'Canada',
  'Australia',
  'Italy',
  'Spain',
  'Japan',
  'Pakistan',
  'Bangladesh',
  'Other',
];

export const COUNTRY_FLAGS: Record<string, string> = {
  'United Kingdom': '🇬🇧',
  'China': '🇨🇳',
  'India': '🇮🇳',
  'United States': '🇺🇸',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Nigeria': '🇳🇬',
  'Malaysia': '🇲🇾',
  'Hong Kong': '🇭🇰',
  'Singapore': '🇸🇬',
  'South Korea': '🇰🇷',
  'Brazil': '🇧🇷',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Italy': '🇮🇹',
  'Spain': '🇪🇸',
  'Japan': '🇯🇵',
  'Pakistan': '🇵🇰',
  'Bangladesh': '🇧🇩',
  'Other': '🌍',
};

// 12-tile interest grid — used in onboarding Step 4
export const INTERESTS = [
  '🎬 Film',
  '🎮 Gaming',
  '⚽ Sport',
  '🍴 Food',
  '🎵 Music',
  '✏️ Art',
  '📖 Reading',
  '✈️ Travel',
  '🏕 Outdoors',
  '📷 Photography',
  '❤️ Wellness',
  '💻 Tech',
];
