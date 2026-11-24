export type Destination = {
  id: string;
  name: string;
  sw: string;
  kicker: string;
  region: string;
  lat: number;
  lon: number;
  image: string;
  credit: string;
  summary: string;
  facts: string[];
  story: string;
  projectId?: string;
};

export const DESTINATIONS: Destination[] = [
  {
    id: 'serengeti', name: 'Serengeti National Park', sw: 'Hifadhi ya Taifa ya Serengeti', kicker: 'Savannah', region: 'Mara · Simiyu',
    lat: -2.33, lon: 34.83, image: '/images/serengeti.jpg', credit: 'Bjørn Christian Tørrissen · CC BY-SA 3.0',
    summary: 'Endless plains that carry one of the largest wildlife migrations on Earth.',
    facts: ['About 14,750 km² of protected savannah', 'UNESCO World Heritage Site since 1981', 'Part of the wildebeest migration shared with Kenya’s Maasai Mara'],
    story: 'Protecting the Serengeti depends on the land around it as well: corridors, water and the communities that live alongside wildlife.',
    projectId: 'wildlife',
  },
  {
    id: 'kilimanjaro', name: 'Mount Kilimanjaro', sw: 'Mlima Kilimanjaro', kicker: 'Mountain', region: 'Kilimanjaro',
    lat: -3.07, lon: 37.35, image: '/images/kili.jpg', credit: 'Erasmus Kamugisha · CC BY-SA 4.0',
    summary: 'Africa’s highest mountain, rising above farms and forest on its southern slopes.',
    facts: ['5,895 m, the highest point in Africa', 'Three volcanic cones: Kibo, Mawenzi and Shira', 'Kilimanjaro National Park, UNESCO World Heritage Site since 1987'],
    story: 'The forest belt on the mountain’s slopes feeds the springs and rivers that farms and towns below depend on.',
    projectId: 'community',
  },
  {
    id: 'ngorongoro', name: 'Ngorongoro Conservation Area', sw: 'Eneo la Hifadhi la Ngorongoro', kicker: 'Crater', region: 'Arusha',
    lat: -3.2, lon: 35.5, image: '/images/crater.jpg', credit: 'Thomas Fuhrmann · CC BY-SA 4.0',
    summary: 'A vast volcanic caldera seen from its forested rim.',
    facts: ['Crater floor of roughly 260 km²', 'UNESCO World Heritage Site since 1979', 'A multiple land-use area where people and wildlife share the landscape'],
    story: 'Ngorongoro shows how conservation and livelihoods are connected, and why community voices matter in every decision.',
  },
  {
    id: 'tarangire', name: 'Tarangire National Park', sw: 'Hifadhi ya Taifa ya Tarangire', kicker: 'Baobab country', region: 'Manyara',
    lat: -4.0, lon: 36.05, image: '/images/baobab.jpg', credit: 'Diego Delso · CC BY-SA 4.0',
    summary: 'Ancient baobabs and some of Tanzania’s largest elephant herds.',
    facts: ['Roughly 2,850 km²', 'Known for baobab trees and large elephant herds', 'The Tarangire River is a dry-season lifeline'],
    story: 'Elephants and other wildlife move between Tarangire and Lake Manyara through corridors that cross village land.',
    projectId: 'wildlife',
  },
  {
    id: 'zanzibar', name: 'Zanzibar Stone Town', sw: 'Mji Mkongwe, Zanzibar', kicker: 'Swahili coast', region: 'Zanzibar',
    lat: -6.16, lon: 39.19, image: '/images/stonetown.jpg', credit: 'Diego Delso · CC BY-SA 4.0',
    summary: 'A historic Swahili trading town of coral stone, carved doors and balconies.',
    facts: ['UNESCO World Heritage Site since 2000', 'A centre of Swahili culture and Indian Ocean trade', 'Coral-stone architecture and carved wooden doors'],
    story: 'The reefs and seagrass around Zanzibar sustain fishing families and the islands’ tourism.',
    projectId: 'biodiversity',
  },
  {
    id: 'usambara', name: 'East Usambara forests', sw: 'Misitu ya Usambara Mashariki', kicker: 'Rainforest', region: 'Tanga',
    lat: -5.05, lon: 38.62, image: '/images/forest.jpg', credit: 'Nina R · CC BY 2.0',
    summary: 'Misty submontane rainforest in the Eastern Arc Mountains.',
    facts: ['Part of the Eastern Arc Mountains', 'Includes the Amani Nature Reserve', 'Many plants and animals here live nowhere else'],
    story: 'Restoring forest edges reconnects fragments, so species and water flows can move through the landscape again.',
    projectId: 'forest',
  },
  {
    id: 'rufiji', name: 'Rufiji Delta mangroves', sw: 'Mikoko ya Delta ya Rufiji', kicker: 'Mangroves', region: 'Pwani',
    lat: -7.85, lon: 39.25, image: '/images/mangrove.jpg', credit: 'Fanny Schertzer · CC BY 2.5 (pictured: Zanzibar coast)',
    summary: 'East Africa’s largest mangrove forest, where the Rufiji River meets the ocean.',
    facts: ['The largest mangrove forest in East Africa', 'A nursery for fish and prawns', 'Protects the shoreline from erosion and storms'],
    story: 'Mangroves store large amounts of carbon and protect coastal villages. Community nurseries help them grow back.',
    projectId: 'mangrove',
  },
  {
    id: 'coast', name: 'Coastal communities', sw: 'Jamii za pwani', kicker: 'Community-led', region: 'Zanzibar · Tanga · Pwani',
    lat: -5.5, lon: 39.6, image: '/images/zanzibar.jpg', credit: 'Harvey Barrison · CC BY-SA 2.0',
    summary: 'Fishing families who sail traditional dhows and look after the reefs.',
    facts: ['More than 1,400 km of Indian Ocean coastline', 'Seagrass and coral reefs support local fisheries', 'Community-managed marine areas'],
    story: 'Conservation lasts when local communities lead it and benefit from it.',
    projectId: 'biodiversity',
  },
];
