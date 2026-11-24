export type ProjectId = 'forest' | 'mangrove' | 'wildlife' | 'community' | 'biodiversity';

export type Project = {
  id: ProjectId;
  name: string;
  sw: string;
  place: string;
  region: string;
  lat: number;
  lon: number;
  image: string;
  imageCredit: string;
  imageNote?: string;
  summary: string;
  summarySw: string;
  objective: string;
  impact: string;
  /** Illustrative unit used by the demo dashboard: units per US$ */
  unitLabel: string;
  unitsPerUsd: number;
  color: string;
};

/**
 * DEMONSTRATION CONTENT. These are proposed initiative areas for a design prototype.
 * No project partner, budget or outcome has been agreed. Impact statements are illustrative.
 */
export const PROJECTS: Project[] = [
  {
    id: 'forest', name: 'Forest restoration', sw: 'Urejeshaji wa misitu', place: 'East Usambara Mountains', region: 'Tanga',
    lat: -5.05, lon: 38.62, image: '/images/forest.jpg', imageCredit: 'Amani forest, East Usambara · Nina R · CC BY 2.0',
    summary: 'Native trees replanted along the edges of the Eastern Arc forests.',
    summarySw: 'Miti ya asili hupandwa kando ya misitu ya Milima ya Tao la Mashariki.',
    objective: 'Restore native forest on degraded reserve edges and reconnect isolated forest fragments.',
    impact: 'Illustrative: about one native seedling planted and cared for for every US$3.',
    unitLabel: 'native seedlings', unitsPerUsd: 1 / 3, color: '#0F4D32',
  },
  {
    id: 'mangrove', name: 'Mangrove restoration', sw: 'Urejeshaji wa mikoko', place: 'Rufiji Delta', region: 'Pwani',
    lat: -7.85, lon: 39.25, image: '/images/mangrove.jpg', imageCredit: 'Mangroves · Fanny Schertzer · CC BY 2.5',
    imageNote: 'Photograph taken on the Zanzibar coast; used as a sample for the Rufiji Delta.',
    summary: 'Replanting mangroves in East Africa’s largest mangrove delta.',
    summarySw: 'Kupanda upya mikoko katika delta kubwa zaidi ya mikoko Afrika Mashariki.',
    objective: 'Replant degraded mangrove areas from community nurseries and protect natural regeneration.',
    impact: 'Illustrative: about three mangrove propagules planted for every US$2.',
    unitLabel: 'mangrove propagules', unitsPerUsd: 1.5, color: '#0B6E99',
  },
  {
    id: 'wildlife', name: 'Wildlife conservation', sw: 'Uhifadhi wa wanyamapori', place: 'Tarangire–Manyara corridor', region: 'Manyara',
    lat: -3.75, lon: 35.95, image: '/images/baobab.jpg', imageCredit: 'Baobab, Tarangire National Park · Diego Delso · CC BY-SA 4.0',
    summary: 'Keeping seasonal wildlife routes open between Tarangire and Lake Manyara.',
    summarySw: 'Kuweka wazi njia za wanyamapori kati ya Tarangire na Ziwa Manyara.',
    objective: 'Keep migration corridors open through community land-use planning and wildlife monitoring.',
    impact: 'Illustrative: every US$50 helps fund one day of community wildlife monitoring.',
    unitLabel: 'monitoring days', unitsPerUsd: 1 / 50, color: '#B7791F',
  },
  {
    id: 'community', name: 'Community conservation', sw: 'Uhifadhi wa kijamii', place: 'Kilimanjaro foothills', region: 'Kilimanjaro',
    lat: -3.3, lon: 37.4, image: '/images/kili.jpg', imageCredit: 'Mount Kilimanjaro from Moshi · Erasmus Kamugisha · CC BY-SA 4.0',
    summary: 'Village tree nurseries and agroforestry that protect water sources below the mountain.',
    summarySw: 'Vitalu vya miche vya vijiji na kilimo mseto vinavyolinda vyanzo vya maji.',
    objective: 'Support village nurseries and agroforestry that keep springs and streams flowing.',
    impact: 'Illustrative: about five fruit or shade seedlings for a farming household for every US$10.',
    unitLabel: 'household seedlings', unitsPerUsd: 0.5, color: '#8C2F39',
  },
  {
    id: 'biodiversity', name: 'Biodiversity protection', sw: 'Ulinzi wa bioanuwai', place: 'Zanzibar coast', region: 'Zanzibar',
    lat: -6.25, lon: 39.5, image: '/images/zanzibar.jpg', imageCredit: 'Dhow off Zanzibar · Harvey Barrison · CC BY-SA 2.0',
    summary: 'Protecting seagrass and reef habitats that coastal fishing communities rely on.',
    summarySw: 'Kulinda nyasi bahari na matumbawe ambayo jamii za wavuvi hutegemea.',
    objective: 'Protect seagrass and coral habitats through community-managed marine areas.',
    impact: 'Illustrative: every US$25 contributes to one day of community reef and seagrass monitoring.',
    unitLabel: 'monitoring days', unitsPerUsd: 1 / 25, color: '#4FB6E0',
  },
];

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);
export const SUGGESTED_AMOUNTS = [10, 25, 50, 100];
