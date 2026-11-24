'use client';
import QRCode from 'qrcode';
import type { JourneyRecord } from './demoStore';
import { projectById } from './data/projects';
import { airportByCode } from './data/airports';
import { fmtDate, fmtUsd } from './format';

const RIBBON: [number, [number, number, number]][] = [[0.42, [30, 181, 58]], [0.03, [252, 209, 22]], [0.1, [17, 17, 17]], [0.03, [252, 209, 22]], [0.42, [0, 163, 221]]];

function ribbon(doc: import('jspdf').jsPDF, x: number, y: number, w: number, h: number) {
  let cx = x;
  for (const [f, c] of RIBBON) { doc.setFillColor(...c); doc.rect(cx, y, w * f, h, 'F'); cx += w * f; }
}

export async function acknowledgementPdf(r: JourneyRecord, verifyUrl: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const W = 148, H = 210;
  const p = projectById(r.projectId)!;
  doc.setFillColor(15, 77, 50); doc.rect(0, 0, W, 78, 'F');
  ribbon(doc, 0, 0, W, 4);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text('TANZANIA GREEN JOURNEY', 14, 16, { charSpace: 0.6 });
  doc.setFont('times', 'bold'); doc.setFontSize(30); doc.text('Asante sana.', 14, 38);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(doc.splitTextToSize(`${r.name ? r.name + ', thank' : 'Thank'} you for helping to protect Tanzania.`, W - 28), 14, 48);
  doc.setFontSize(8); doc.text('DEMONSTRATION ACKNOWLEDGEMENT  ·  SIMULATED CONTRIBUTION', 14, 70);
  doc.setTextColor(17, 17, 17);
  const rows: [string, string][] = [
    ['Initiative', `${p.name}`], ['Location', `${p.place}, ${p.region}`], ['Contribution (simulated)', fmtUsd(r.amountUsd, r.amountUsd % 1 ? 2 : 0)],
    ['Journey', `${airportByCode(r.from)?.city ?? r.from} (${r.from}) to ${airportByCode(r.to)?.city ?? r.to} (${r.to})`],
    ['Flight estimate', `${(r.kgPerPassenger / 1000).toFixed(2)} t CO2e per passenger (estimate)`], ['Date', fmtDate(r.createdAt)], ['Reference', r.ref],
  ];
  let y = 92;
  for (const [k, v] of rows) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(85, 86, 90); doc.text(k.toUpperCase(), 14, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(17, 17, 17); doc.text(doc.splitTextToSize(v, 80), 14, y + 5);
    doc.setDrawColor(222, 219, 210); doc.line(14, y + 9, 96, y + 9);
    y += 14;
  }
  const qr = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 300 });
  doc.addImage(qr, 'PNG', 104, 90, 32, 32);
  doc.setFillColor(252, 209, 22); doc.rect(104, 124, 32, 6, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.text('DEMO ONLY', 120, 128.2, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(85, 86, 90);
  doc.text(doc.splitTextToSize('Verification-style code for demonstration. It is not an official record.', 32), 104, 135);
  doc.setFontSize(7);
  doc.text(doc.splitTextToSize('This acknowledgement records a simulated, voluntary contribution made in a design prototype. No money was collected. It is not a receipt, a carbon offset certificate or evidence of a verified environmental outcome. Impact statements are illustrative. No government endorsement is implied.', W - 28), 14, H - 22);
  ribbon(doc, 0, H - 4, W, 4);
  doc.save(`${r.ref}.pdf`);
}

export async function dashboardPdf(input: {
  rangeLabel: string; filters: string; kpis: [string, string][]; byProject: [string, string, string][]; origins: [string, string][]; airports: [string, string][];
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const W = 297;
  ribbon(doc, 0, 0, W, 4);
  doc.setFont('times', 'bold'); doc.setFontSize(22); doc.text('Tanzania Green Journey · National overview', 14, 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(85, 86, 90);
  doc.text(`Demonstration report · ${input.rangeLabel} · ${input.filters} · generated ${new Date().toLocaleString('en-GB')}`, 14, 27);
  doc.setFillColor(255, 246, 207); doc.rect(14, 31, W - 28, 8, 'F'); doc.setTextColor(79, 65, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  doc.text('ILLUSTRATIVE DEMONSTRATION DATA. Figures are simulated and are not government statistics, real visitor activity or verified conservation outcomes.', 17, 36.3);
  doc.setTextColor(17, 17, 17);
  const kw = (W - 28) / input.kpis.length;
  input.kpis.forEach(([k, v], i) => {
    const x = 14 + i * kw;
    doc.setDrawColor(222, 219, 210); doc.rect(x, 44, kw - 3, 22);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(85, 86, 90); doc.text(k, x + 3, 50);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(17, 17, 17); doc.text(v, x + 3, 60);
  });
  const table = (title: string, head: string[], rows: string[][], x: number, y: number, widths: number[]) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.text(title, x, y);
    y += 6; doc.setFontSize(7.5); doc.setTextColor(85, 86, 90);
    let cx = x; head.forEach((h, i) => { doc.text(h.toUpperCase(), cx, y); cx += widths[i]; });
    doc.setTextColor(17, 17, 17); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    rows.forEach((r) => { y += 6.2; cx = x; r.forEach((c, i) => { doc.text(c, cx, y); cx += widths[i]; }); doc.setDrawColor(235, 233, 228); doc.line(x, y + 2, x + widths.reduce((a, b) => a + b, 0), y + 2); });
  };
  table('Simulated contributions by initiative', ['Initiative', 'Contributions', 'Amount'], input.byProject, 14, 78, [55, 28, 28]);
  table('Visitor origin (top 8)', ['Country', 'Journeys'], input.origins.slice(0, 8), 140, 78, [45, 25]);
  table('Arrival airports', ['Airport', 'Journeys'], input.airports, 225, 78, [35, 25]);
  doc.setFontSize(7.5); doc.setTextColor(85, 86, 90);
  doc.text('Design prototype. No government endorsement, partnership or official mark is implied.', 14, 200);
  ribbon(doc, 0, 206, W, 4);
  doc.save(`TGJ-demo-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function footprintPdf(i: { summary: string; perKg: number; pax: number; isReturn: boolean; cabin: string; nonCo2: boolean; legs: { label: string; sub: string; kg: number }[]; eq: { tzYears: number; globalMonths: number; carKm: number }; suggestion: number }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  ribbon(doc, 0, 0, W, 4);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(85, 86, 90); doc.text('TANZANIA GREEN JOURNEY · FOOTPRINT ESTIMATE', 16, 16, { charSpace: 0.4 });
  doc.setFont('times', 'bold'); doc.setFontSize(26); doc.setTextColor(17, 17, 17); doc.text('Your travel footprint', 16, 30);
  doc.setFillColor(17, 17, 17); doc.rect(16, 38, W - 32, 34, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(30); doc.text(`${(i.perKg / 1000).toFixed(2)} t CO2e`, 22, 56);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  doc.text(`per passenger · ${i.isReturn ? 'return trip' : 'one way'} · ${i.cabin}${i.nonCo2 ? ' · incl. non-CO2 (x1.7)' : ''} · ${i.pax} passenger${i.pax > 1 ? 's' : ''}: ${((i.perKg * i.pax) / 1000).toFixed(2)} t in total`, 22, 65);
  doc.setTextColor(17, 17, 17); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Flight by flight', 16, 84);
  let y = 91; doc.setFontSize(9.5);
  i.legs.forEach((l) => { doc.setFont('helvetica', 'bold'); doc.text(l.label.replace('→', 'to'), 16, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 86, 90); doc.text(l.sub, 50, y); doc.setTextColor(17, 17, 17); doc.text(`${Math.round(l.kg)} kg`, W - 16, y, { align: 'right' }); y += 7; });
  y += 4; doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('In perspective (per passenger)', 16, y); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  [[`${i.eq.tzYears.toFixed(1)} years`, 'of an average Tanzanian’s CO2 (0.29 t per year, 2024)'], [`${i.eq.globalMonths.toFixed(1)} months`, 'of the world-average person’s CO2 (4.7 t per year, 2023)'], [`${Math.round(i.eq.carKm).toLocaleString('en-GB')} km`, 'in an average petrol car (approx. 0.17 kg per km)']]
    .forEach(([a, b]) => { doc.setFont('helvetica', 'bold'); doc.text(a, 16, y); doc.setFont('helvetica', 'normal'); doc.text(b, 50, y); y += 7; });
  y += 4; doc.setFillColor(227, 237, 230); doc.rect(16, y, W - 32, 22, 'F');
  doc.setFont('helvetica', 'bold'); doc.text(`Optional contribution guide: US$${i.suggestion}`, 20, y + 8);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(doc.splitTextToSize('An illustrative US$15 per estimated tonne. A voluntary conservation contribution in Tanzania, not an offset: it does not cancel your flight emissions.', W - 40), 20, y + 14);
  doc.setFontSize(7.5); doc.setTextColor(85, 86, 90);
  doc.text(doc.splitTextToSize('Method: great-circle distance + 8% routing uplift x per-passenger-km factor by flight length (illustrative: short-haul 0.155, medium 0.13, long-haul 0.115 kg) x cabin multiplier (economy 1, premium 1.6, business 2.9, first 4). Structure follows the UK Government GHG conversion-factor approach; factors are illustrative for a design prototype. Per-person CO2: Global Carbon Budget via Our World in Data.', W - 32), 16, 270);
  ribbon(doc, 0, 293, W, 4);
  doc.save('TGJ-footprint-estimate.pdf');
}
