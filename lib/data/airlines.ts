/** Sample airline list for the demonstration form. No integration with any airline exists. */
export const AIRLINES = [
  { code: 'TC', name: 'Air Tanzania' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'EY', name: 'Etihad Airways' },
  { code: 'TK', name: 'Turkish Airlines' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines' },
  { code: 'ET', name: 'Ethiopian Airlines' },
  { code: 'KQ', name: 'Kenya Airways' },
  { code: 'FZ', name: 'flydubai' },
  { code: 'WY', name: 'Oman Air' },
  { code: 'LX', name: 'Swiss International Air Lines' },
  { code: 'DE', name: 'Condor' },
  { code: 'OTHER', name: 'Other airline' },
];
export const airlineByCode = (c: string) => AIRLINES.find((a) => a.code === c);
