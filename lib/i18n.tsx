'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'sw';

/** Kiswahili strings are drafts for native-speaker review before any public use. */
const en = {
  brand: 'Tanzania Green Journey',
  tagline: 'Every journey can help protect Tanzania.',
  demoBanner: 'Demonstration prototype · no real payments · illustrative data',
  karibu: 'Karibu Tanzania.',
  welcomeIntro: 'A proposed national initiative inviting visitors to support the forests, coasts and wildlife that make Tanzania extraordinary.',
  voluntary: 'Participation is entirely voluntary. You can explore without contributing.',
  begin: 'Begin your journey',
  exploreFirst: 'Explore Tanzania first',
  language: 'Language',
  steps: ['Welcome', 'Flight', 'Footprint', 'Discover', 'Support', 'Thank you'],
  back: 'Back',
  continue: 'Continue',
  flightTitle: 'Your flight',
  flightIntro: 'Tell us about the flight that brought you to Tanzania. We use it only to show an estimate.',
  airline: 'Airline',
  flightNumber: 'Flight number',
  from: 'Departure airport',
  to: 'Arrival airport in Tanzania',
  date: 'Travel date',
  cabin: 'Cabin class',
  passengers: 'Passengers',
  searchAirport: 'Search by city, airport or code',
  confirmTitle: 'Check your flight details',
  confirmCalc: 'Calculate estimate',
  edit: 'Edit',
  footprintTitle: 'Your journey to Tanzania',
  estEmissions: 'Estimated flight emissions',
  perPassenger: 'per passenger, one way',
  distance: 'Distance',
  howCalculated: 'How this estimate is calculated',
  notOffset: 'A contribution is a voluntary gift to conservation. It does not offset your flight or make it carbon neutral.',
  discoverTitle: 'Discover Tanzania',
  discoverIntro: 'The places your journey can help protect.',
  supportTitle: 'Choose an initiative',
  supportIntro: 'Select one conservation initiative. All five are demonstration projects.',
  amountTitle: 'Your contribution',
  customAmount: 'Other amount (US$)',
  detailsTitle: 'Your details',
  detailsIntro: 'Optional. Only used to personalise your acknowledgement.',
  name: 'Name on acknowledgement',
  email: 'Email for a copy',
  country: 'Country of residence',
  consent: 'I understand this is a voluntary contribution and that this demonstration does not collect any money.',
  review: 'Review',
  reviewTitle: 'Review your contribution',
  confirmSim: 'Confirm simulated contribution',
  processing: 'Recording your demonstration contribution…',
  thankYou: 'Asante sana.',
  ackSub: 'Thank you for helping to protect Tanzania.',
  download: 'Download PDF',
  print: 'Print',
  share: 'Share',
  again: 'Start another journey',
  privacy: 'Privacy',
  optional: 'Optional',
  required: 'Required',
};

type Dict = typeof en;

const sw: Dict = {
  brand: 'Tanzania Green Journey',
  tagline: 'Kila safari inaweza kusaidia kuilinda Tanzania.',
  demoBanner: 'Mfano wa maonyesho · hakuna malipo halisi · takwimu za mfano',
  karibu: 'Karibu Tanzania.',
  welcomeIntro: 'Mpango wa kitaifa unaopendekezwa unaowakaribisha wageni kusaidia misitu, pwani na wanyamapori wanaoifanya Tanzania kuwa ya kipekee.',
  voluntary: 'Kushiriki ni kwa hiari kabisa. Unaweza kuchunguza bila kuchangia.',
  begin: 'Anza safari yako',
  exploreFirst: 'Gundua Tanzania kwanza',
  language: 'Lugha',
  steps: ['Karibu', 'Ndege', 'Athari', 'Gundua', 'Saidia', 'Asante'],
  back: 'Rudi',
  continue: 'Endelea',
  flightTitle: 'Safari yako ya ndege',
  flightIntro: 'Tueleze kuhusu ndege iliyokuleta Tanzania. Tunaitumia kuonyesha makadirio tu.',
  airline: 'Shirika la ndege',
  flightNumber: 'Namba ya ndege',
  from: 'Uwanja wa kuondokea',
  to: 'Uwanja wa kuwasili Tanzania',
  date: 'Tarehe ya safari',
  cabin: 'Daraja',
  passengers: 'Wasafiri',
  searchAirport: 'Tafuta kwa mji, uwanja au msimbo',
  confirmTitle: 'Hakiki taarifa za ndege',
  confirmCalc: 'Kokotoa makadirio',
  edit: 'Badilisha',
  footprintTitle: 'Safari yako kuja Tanzania',
  estEmissions: 'Makadirio ya hewa ukaa ya ndege',
  perPassenger: 'kwa msafiri, safari moja',
  distance: 'Umbali',
  howCalculated: 'Jinsi makadirio haya yanavyokokotolewa',
  notOffset: 'Mchango ni zawadi ya hiari kwa uhifadhi. Haufuti athari za ndege yako.',
  discoverTitle: 'Gundua Tanzania',
  discoverIntro: 'Maeneo ambayo safari yako inaweza kusaidia kulinda.',
  supportTitle: 'Chagua mradi',
  supportIntro: 'Chagua mradi mmoja wa uhifadhi. Miradi yote mitano ni ya maonyesho.',
  amountTitle: 'Mchango wako',
  customAmount: 'Kiasi kingine (US$)',
  detailsTitle: 'Taarifa zako',
  detailsIntro: 'Si lazima. Hutumika tu kwenye shukrani yako.',
  name: 'Jina kwenye shukrani',
  email: 'Barua pepe kwa nakala',
  country: 'Nchi unayoishi',
  consent: 'Ninaelewa kuwa huu ni mchango wa hiari na kwamba maonyesho haya hayakusanyi pesa yoyote.',
  review: 'Hakiki',
  reviewTitle: 'Hakiki mchango wako',
  confirmSim: 'Thibitisha mchango wa mfano',
  processing: 'Tunarekodi mchango wako wa maonyesho…',
  thankYou: 'Asante sana.',
  ackSub: 'Asante kwa kusaidia kuilinda Tanzania.',
  download: 'Pakua PDF',
  print: 'Chapisha',
  share: 'Shiriki',
  again: 'Anza safari nyingine',
  privacy: 'Faragha',
  optional: 'Si lazima',
  required: 'Lazima',
};

const DICTS: Record<Lang, Dict> = { en, sw };
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({ lang: 'en', setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tgj-lang') as Lang | null;
      if (saved === 'en' || saved === 'sw') setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('tgj-lang', l); } catch {}
  }, []);
  return <Ctx.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
