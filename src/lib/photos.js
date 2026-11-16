// Photographs are NOT stored in this repository. They are displayed directly
// from NEST Architects' own website galleries, so the studio stays in control
// of them. See ASSETS.md — written permission is needed before production use.
const ROOT = 'https://nestarchitects.in/wp-content/uploads/photo-gallery/';
const V = 'LUXURY_BUNGALOW_NAGPUR/';
const p = (file, w, h, alt) => ({ src: `${ROOT}${file}`, w, h, alt });

export const photos = {
  heroLiving: p(`${V}PRA02460.jpg`, 424, 600, 'Living room with a crystal chandelier, a marble-topped centre table and a wall of glazed cabinets.'),
  livingWide: p(`${V}PRA02462.jpg`, 810, 546, 'The living room seen from the seating, with the television wall and chandelier.'),
  livingAlt: p(`${V}PRA02448.jpg`, 810, 540, 'Living room looking towards the windows, green sofas either side of a centre table.'),
  dining: p(`${V}PRA02494.jpg`, 810, 540, 'Dining table set below the staircase, with paintings on the wall behind.'),
  lobbyTall: p(`${V}PRA02599.jpg`, 383, 600, 'Double-height lobby with a large painting, pendant lights and a mirrored ceiling.'),
  lobbyWide: p(`${V}PRA02596.jpg`, 810, 544, 'Looking across the upper level of the lobby under the mirrored ceiling.'),
  kitchen: p(`${V}PRA02515.jpg`, 810, 554, 'White kitchen with an island and bar stools.'),
  master: p(`${V}PRA02574.jpg`, 446, 657, 'Bedroom with a tall carved panel behind the bed and a wall light beside it.'),
  eldersTall: p(`${V}PRA02632.jpg`, 439, 600, 'Bedroom with an exposed concrete wall, timber louvers and a floral bedspread.'),
  eldersWide: p(`${V}PRA02630.jpg`, 810, 540, 'The same bedroom seen straight on, concrete wall behind the bed.'),
  sonYounger: p(`${V}PRA02555.jpg`, 400, 600, 'Bedroom with an ochre upholstered bed against a pale green wall with brass inlay lines.'),
  sonElder: p(`${V}PRA02648.jpg`, 404, 600, 'Bedroom with a blue upholstered wall, a timber panel above and a patterned timber floor.'),
  terraceSwing: p(`${V}112.jpg`, 810, 507, 'Terrace with a timber swing in front of a carved jali screen and an arched niche.'),
  terraceWide: p(`${V}PRA02437.jpg`, 810, 535, 'Terrace seating beside a strip of lawn, jali screens along the wall.'),
  chandrapur: p('CHANDRAPUR_RESIDENTIAL/12.jpg', 400, 600, 'Double-height dining space with a long table and tall curtains.'),
  store: p('ETHNIC_CLOTH_STORE_DESIGN/DSC09001.jpg', 400, 600, 'Clothing store interior with dark carved columns and a white display counter.'),
};
