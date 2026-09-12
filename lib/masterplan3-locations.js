import { masterplan2Locations } from './masterplan2-locations';

// Reference pin positions registered from MAP HOVER (20).png to final-masterplan.png.
const anchors = [[.216172, .638479], [.319655, .496276], [.417992, .5487], [.323282, .709229], [.6389, .567125], [.580242, .637957], [.666453, .689711], [.789257, .52747], [.903964, .430349], [.870143, .648434]];
export const sceneLocations = masterplan2Locations.map((location, index) => ({
  ...location, anchor: anchors[index],
}));
