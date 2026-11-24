export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  /** One of Tanzania's international arrival airports */
  tanzania?: boolean;
  /** Domestic airport or airstrip inside Tanzania */
  domestic?: boolean;
  note?: string;
};

/** Sample airport list for the demonstration. Coordinates are published airport reference points (rounded). */
export const AIRPORTS: Airport[] = [
  { code: 'DAR', name: 'Julius Nyerere International Airport', city: 'Dar es Salaam', country: 'Tanzania', lat: -6.8781, lon: 39.2026, tanzania: true, note: 'Tanzania’s largest airport, serving the commercial capital and the coast.' },
  { code: 'JRO', name: 'Kilimanjaro International Airport', city: 'Kilimanjaro', country: 'Tanzania', lat: -3.4294, lon: 37.0745, tanzania: true, note: 'Gateway to Mount Kilimanjaro, Arusha and the northern safari circuit.' },
  { code: 'ZNZ', name: 'Abeid Amani Karume International Airport', city: 'Zanzibar', country: 'Tanzania', lat: -6.222, lon: 39.2249, tanzania: true, note: 'Serves Unguja island and Stone Town, a UNESCO World Heritage Site.' },
  { code: 'ARK', name: 'Arusha Airport', city: 'Arusha', country: 'Tanzania', lat: -3.3678, lon: 36.6333, tanzania: true, domestic: true },
  { code: 'MWZ', name: 'Mwanza Airport', city: 'Mwanza', country: 'Tanzania', lat: -2.4445, lon: 32.9327, tanzania: true, domestic: true },
  { code: 'DOD', name: 'Dodoma Airport', city: 'Dodoma', country: 'Tanzania', lat: -6.1704, lon: 35.7526, tanzania: true, domestic: true },
  { code: 'SEU', name: 'Seronera Airstrip', city: 'Serengeti', country: 'Tanzania', lat: -2.458, lon: 34.8225, tanzania: true, domestic: true },
  { code: 'MFA', name: 'Mafia Airport', city: 'Mafia Island', country: 'Tanzania', lat: -7.9178, lon: 39.6683, tanzania: true, domestic: true },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.47, lon: -0.4543 },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom', lat: 51.1537, lon: -0.1821 },
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', lat: 53.3537, lon: -2.275 },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479 },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683 },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622 },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', lat: 48.3538, lon: 11.7861 },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.4582, lon: 8.5555 },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy', lat: 41.8003, lon: 12.2389 },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', lat: 45.6306, lon: 8.7281 },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', lat: 40.4983, lon: -3.5676 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Türkiye', lat: 41.2753, lon: 28.7519 },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lon: 55.3657 },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.433, lon: 54.6511 },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', lat: 25.2731, lon: 51.6081 },
  { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', lat: 23.5933, lon: 58.2844 },
  { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', lat: 8.9779, lon: 38.7993 },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', lat: -1.3192, lon: 36.9278 },
  { code: 'EBB', name: 'Entebbe International Airport', city: 'Entebbe', country: 'Uganda', lat: 0.0424, lon: 32.4435 },
  { code: 'KGL', name: 'Kigali International Airport', city: 'Kigali', country: 'Rwanda', lat: -1.9686, lon: 30.1395 },
  { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', lat: -26.1337, lon: 28.242 },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', lat: -33.9715, lon: 18.6021 },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656 },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', lat: 28.5562, lon: 77.1 },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', lat: 40.0799, lon: 116.6031 },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', lat: 40.6413, lon: -73.7781 },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington, D.C.', country: 'United States', lat: 38.9531, lon: -77.4565 },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', lat: 43.6777, lon: -79.6248 },
];

export const TZ_AIRPORTS = AIRPORTS.filter((a) => a.tanzania && !a.domestic);
export const ORIGIN_AIRPORTS = AIRPORTS.filter((a) => !a.tanzania);
export const airportByCode = (code: string) => AIRPORTS.find((a) => a.code === code);
