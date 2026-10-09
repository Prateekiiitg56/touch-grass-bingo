// Bingo item pools. `prompt` is the text CLIP compares the photo against,
// so it describes what the camera sees, not what the player reads.

export const CENTER = {
  id: 'touch-grass',
  label: 'Touch grass',
 
  prompt: 'a photo of a hand touching green grass',
};

const ANYTIME = [
  { id: 'bird', label: 'A bird', prompt: 'a photo of a bird' },
  { id: 'dog', label: 'A dog on a walk', prompt: 'a photo of a dog outdoors' },
  { id: 'clouds', label: 'Big clouds', prompt: 'a photo of clouds in the sky' },
  { id: 'bark', label: 'Tree bark up close', prompt: 'a close-up photo of tree bark' },
  { id: 'rock', label: 'An interesting rock', prompt: 'a photo of a rock on the ground' },
  { id: 'water', label: 'Running water', prompt: 'a photo of a stream or river' },
  { id: 'bench', label: 'A park bench', prompt: 'a photo of a park bench' },
  { id: 'sign', label: 'A trail sign', prompt: 'a photo of a trail sign or wooden signpost' },
  { id: 'insect', label: 'A bug', prompt: 'a close-up photo of an insect' },
  { id: 'path', label: 'A dirt path', prompt: 'a photo of a dirt trail through nature' },
  { id: 'lichen', label: 'Lichen', prompt: 'a close-up photo of lichen on a rock or branch' },
  { id: 'spiderweb', label: 'A spider web', prompt: 'a photo of a spider web' },
  { id: 'squirrel', label: 'A squirrel', prompt: 'a photo of a squirrel' },
  { id: 'moss', label: 'Moss', prompt: 'a close-up photo of green moss' },
];

const SEASONS = {
  autumn: [
    { id: 'red-leaf', label: 'A red leaf', prompt: 'a photo of a red autumn leaf' },
    { id: 'yellow-leaf', label: 'A yellow leaf', prompt: 'a photo of a yellow autumn leaf' },
    { id: 'acorn', label: 'An acorn', prompt: 'a photo of an acorn' },
    { id: 'pinecone', label: 'A pinecone', prompt: 'a photo of a pinecone' },
    { id: 'mushroom', label: 'A mushroom', prompt: 'a photo of a wild mushroom' },
    { id: 'pumpkin', label: 'A pumpkin', prompt: 'a photo of a pumpkin' },
    { id: 'leaf-pile', label: 'A pile of leaves', prompt: 'a photo of a pile of fallen leaves' },
    { id: 'berries', label: 'Wild berries', prompt: 'a photo of wild berries on a bush' },
    { id: 'feather', label: 'A feather', prompt: 'a photo of a feather' },
    { id: 'foliage', label: 'A tree in full color', prompt: 'a photo of a tree with orange and red autumn foliage' },
    { id: 'sunset', label: 'Golden hour', prompt: 'a photo of a sunset' },
  ],
  winter: [
    { id: 'snow', label: 'Fresh snow', prompt: 'a photo of snow on the ground' },
    { id: 'icicle', label: 'An icicle', prompt: 'a photo of icicles' },
    { id: 'evergreen', label: 'An evergreen', prompt: 'a photo of an evergreen pine tree' },
    { id: 'bare-tree', label: 'Bare branches', prompt: 'a photo of bare tree branches in winter' },
    { id: 'frost', label: 'Frost', prompt: 'a close-up photo of frost on leaves' },
    { id: 'tracks', label: 'Animal tracks', prompt: 'a photo of animal footprints in snow or mud' },
    { id: 'snowman', label: 'A snowman', prompt: 'a photo of a snowman' },
    { id: 'holly', label: 'Red winter berries', prompt: 'a photo of red holly berries' },
    { id: 'pinecone', label: 'A pinecone', prompt: 'a photo of a pinecone' },
    { id: 'frozen', label: 'Frozen water', prompt: 'a photo of a frozen puddle or pond' },
    { id: 'sunset', label: 'Winter sunset', prompt: 'a photo of a sunset' },
  ],
  spring: [
    { id: 'blossom', label: 'Tree blossom', prompt: 'a photo of pink or white tree blossoms' },
    { id: 'tulip', label: 'A tulip', prompt: 'a photo of a tulip' },
    { id: 'daffodil', label: 'A daffodil', prompt: 'a photo of a yellow daffodil' },
    { id: 'bud', label: 'A new leaf bud', prompt: 'a close-up photo of a new green leaf bud on a branch' },
    { id: 'bee', label: 'A bee', prompt: 'a photo of a bee' },
    { id: 'butterfly', label: 'A butterfly', prompt: 'a photo of a butterfly' },
    { id: 'puddle', label: 'A rain puddle', prompt: 'a photo of a rain puddle' },
    { id: 'ladybug', label: 'A ladybug', prompt: 'a photo of a ladybug' },
    { id: 'nest', label: 'A bird nest', prompt: 'a photo of a bird nest' },
    { id: 'clover', label: 'Clover', prompt: 'a close-up photo of clover leaves' },
    { id: 'dandelion', label: 'A dandelion', prompt: 'a photo of a dandelion' },
  ],
  summer: [
    { id: 'sunflower', label: 'A sunflower', prompt: 'a photo of a sunflower' },
    { id: 'butterfly', label: 'A butterfly', prompt: 'a photo of a butterfly' },
    { id: 'bee', label: 'A bee', prompt: 'a photo of a bee' },
    { id: 'dragonfly', label: 'A dragonfly', prompt: 'a photo of a dragonfly' },
    { id: 'lake', label: 'A lake', prompt: 'a photo of a lake' },
    { id: 'wildflowers', label: 'Wildflowers', prompt: 'a photo of colorful wildflowers in a meadow' },
    { id: 'clover', label: 'Clover', prompt: 'a close-up photo of clover leaves' },
    { id: 'berries', label: 'Wild berries', prompt: 'a photo of wild berries on a bush' },
    { id: 'shade-tree', label: 'A big shade tree', prompt: 'a photo of a large leafy green tree' },
    { id: 'dandelion', label: 'A dandelion', prompt: 'a photo of a dandelion' },
    { id: 'sunset', label: 'Golden hour', prompt: 'a photo of a sunset' },
  ],
};

// Distractor labels. A photo that matches one of these never counts.
// `screen` is special-cased in the UI: you cannot touch grass through a monitor.
export const NEGATIVES = [
  { id: 'screen', prompt: 'a photo of a computer monitor, laptop or phone screen' },
  { id: 'indoors', prompt: 'a photo of an indoor room' },
  { id: 'selfie', prompt: 'a selfie of a person\'s face' },
  { id: 'text', prompt: 'a photo of a page of text or a document' },
  { id: 'street', prompt: 'a photo of a city street with cars' },
];

export function poolFor(season) {
  const seen = new Set();
  return [...SEASONS[season], ...ANYTIME].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function seasonFor(date, hemisphere) {
  const m = date.getMonth(); // 0 = Jan
  const north = m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
  if (hemisphere === 'north') return north;
  return { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' }[north];
}
