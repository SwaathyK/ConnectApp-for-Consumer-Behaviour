import { ImageSourcePropType } from 'react-native';

// Static require map — React Native bundles images at build time, so each path
// must be a literal require(). Keyed by event id (matches mockEvents.ts).
// Images are optimised JPGs (1200px, ~80% quality) for fast decode.
const EVENT_IMAGES: Record<string, ImageSourcePropType> = {
  '1':  require('../../assets/events/1.jpg'),
  '2':  require('../../assets/events/2.jpg'),
  '3':  require('../../assets/events/3.jpg'),
  '4':  require('../../assets/events/4.jpg'),
  '5':  require('../../assets/events/5.jpg'),
  '6':  require('../../assets/events/6.jpg'),
  '7':  require('../../assets/events/7.jpg'),
  '8':  require('../../assets/events/8.jpg'),
  '9':  require('../../assets/events/9.jpg'),
  '10': require('../../assets/events/10.jpg'),
  '11': require('../../assets/events/11.jpg'),
  '12': require('../../assets/events/12.jpg'),
  '13': require('../../assets/events/13.jpg'),
  '14': require('../../assets/events/14.jpg'),
  '15': require('../../assets/events/15.jpg'),
  '16': require('../../assets/events/16.jpg'),
  '17': require('../../assets/events/17.jpg'),
  '18': require('../../assets/events/18.jpg'),
  '19': require('../../assets/events/19.jpg'),
  '20': require('../../assets/events/20.jpg'),
  '21': require('../../assets/events/21.jpg'),
  '22': require('../../assets/events/22.jpg'),
};

export function getEventImage(id: string): ImageSourcePropType | undefined {
  return EVENT_IMAGES[id];
}
