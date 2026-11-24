# Tanzania Green Journey — interactive prototype

*Every journey can help protect Tanzania.*

A design prototype for a proposed national tourism and conservation initiative. It implements the approved **Direction 04 · The National Colours** identity: Libre Baskerville and Libre Franklin, a deep national green, the flag-colour ribbon used sparingly, and photographs cut on the flag's diagonal.

> Demonstration only. Payments, dashboard figures and impact statements are simulated or illustrative. No government endorsement, partnership or official mark is implied. Kiswahili copy is a draft for native-speaker review.

## Run it locally

Requirements: Node.js 18.18 or newer (20 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run dev` listens on all network interfaces, so a phone on the same Wi-Fi can open `http://<your-computer-ip>:3000`.

| Route | Purpose |
|---|---|
| `/` | Presentation hub |
| `/qr/` | Airport QR landing: scannable code, manual open, printable poster |
| `/journey/` | Visitor journey (QR destination: `/journey/?src=qr`) |
| `/discover/` | Destinations, conservation stories, interactive map and 3D model |
| `/calculator/` | Travel footprint calculator: multi-stop and return trips, flight-time mode, comparisons, ways to travel lighter, method, FAQ, PDF summary. Accepts `?from=LHR&to=DAR&cabin=economy&pax=1&trip=return` |
| `/dashboard/` | Government dashboard |
| `/verify/?ref=…` | Demonstration record check (target of the acknowledgement QR) |
| `/privacy/` | Privacy notice |

### Scanning the QR code with a phone during development
The QR code encodes `NEXT_PUBLIC_BASE_URL` + `/journey/?src=qr`. If that variable is empty, it uses the address the page was opened on. A phone cannot open `localhost`, so either open `/qr/` on your computer using its network address (for example `http://192.168.1.20:3000/qr/`), or copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_BASE_URL=http://192.168.1.20:3000`, then restart.

## Build and deploy

The app is a static export (`output: 'export'`):

```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.example npm run build   # writes ./out
npx serve out                                                    # preview the static build
```

Upload `out/` to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, an S3 bucket or a government web server). On Vercel or Netlify, import the repository and set `NEXT_PUBLIC_BASE_URL` to the production address; the build command is `npm run build` and the output folder is `out`.

## Footprint calculator (added in this update)

- **By airports**: up to four flights (international plus Tanzania's domestic airports: Arusha, Mwanza, Dodoma, Seronera, Mafia), one way or return. Each flight is calculated separately and shown flight by flight on the map.
- **By flight time**: short, medium, long or ultra-long haul, or a slider in hours, for travellers who don't know their airports.
- **Method**: great-circle distance + 8% routing uplift × a per-passenger-km factor by flight length (short 0.155, medium 0.13, long 0.115 kg, illustrative) × cabin multiplier (economy 1, premium 1.6, business 2.9, first 4). Optional ×1.7 non-CO₂ sensitivity. All in `lib/emissions.ts`, so a methodology agreed with national authorities can replace it in one place.
- **Comparisons**: years of an average Tanzanian's CO₂ (0.29 t, 2024), months of the world-average person's (4.7 t, 2023), car-kilometre equivalent. Per-person figures: Global Carbon Budget via Our World in Data / Global Carbon Project.
- **Contribution guide**: an illustrative US$15 per estimated tonne, clearly labelled as a voluntary conservation contribution and not an offset. "Support a Tanzanian initiative" carries the trip into the journey at the initiative step with the amount prefilled.
- **Journey and dashboard**: the flight step has a one-way/return option; the footprint step shows the comparisons and links to the calculator; the dashboard has a footprint-awareness panel (simulated).
- Runs entirely in the browser; nothing entered in the calculator is sent anywhere.

## Stack
Next.js 14 (App Router, static export) · React 18 · TypeScript · Tailwind CSS · Framer Motion · Three.js with React Three Fiber and drei · Recharts · Lucide icons · qrcode · jsPDF. No backend, database, payment gateway, analytics or third-party trackers.

## What is real and what is simulated
| Real | Simulated or illustrative |
|---|---|
| Airport coordinates and great-circle distances | Every payment (no money is collected; no card details are requested) |
| The emissions calculation, which is transparent and shown step by step (structure follows the UK Government conversion-factor approach: distance × 1.08 uplift × class factor) | The base emission factor (0.115 kg CO₂e per passenger-km), labelled as illustrative; non-CO₂ effects are an optional ×1.7 sensitivity |
| A working QR code and links | All dashboard figures (365 days of seeded, deterministic simulated data) |
| Destination facts (areas, UNESCO listing years, elevation) | The five initiatives and their "illustrative impact" unit costs |
| Openly licensed photographs, credited in the interface | The verification QR on the acknowledgement (marked DEMO) |

Journeys you complete are stored only in your browser (localStorage) and are added to the dashboard on the same browser, tagged "This device". Use **Reset demo data** on the dashboard to clear them.

## Project structure
```
app/            routes (journey, qr, discover, dashboard, verify, privacy)
components/     ui (buttons, fields, photo, counter…), journey steps, dashboard, map (SVG), three (3D)
lib/            data (airports, airlines, projects, destinations), emissions model, i18n, demo store, dashboard data, PDF
public/images/  photographs (Wikimedia Commons / Flickr, open licences)
```

## Photography credits
Erasmus Kamugisha (Kilimanjaro, CC BY-SA 4.0) · Bjørn Christian Tørrissen (Serengeti, CC BY-SA 3.0) · Thomas Fuhrmann (Ngorongoro, CC BY-SA 4.0) · Diego Delso (Tarangire baobab and Stone Town, CC BY-SA 4.0) · Harvey Barrison (dhow, CC BY-SA 2.0) · Fanny Schertzer (mangroves on the Zanzibar coast, used as a sample for the Rufiji Delta, CC BY 2.5) · Nina R (Amani forest, CC BY 2.0) · David Stanley (Dar es Salaam, CC BY 2.0). Replace them with licensed or commissioned photography before public use.

## Known limitations
- No real payment, airline or flight-tracking integration (by design).
- Dashboard data is generated in the browser; there is no shared backend, so each device sees its own "This device" journeys.
- The Tanzania map is schematic and is not an authoritative boundary map.
- The emissions factor must be replaced with a methodology agreed with national authorities before any public use.
- Kiswahili translations need native-speaker review.
- The 3D view needs WebGL; on small screens and with reduced motion the 2D map is shown by default.

## Five-minute demonstration script
1. **Arrival (`/qr/`).** "A visitor lands at Julius Nyerere, Kilimanjaro or Zanzibar and sees this code in the arrivals hall." Scan it with a phone, or press *Open on this device*.
2. **Welcome.** Point out the national colours, the voluntary statement and the language switch. Switch to Kiswahili and back.
3. **Flight.** Press *Sample* (London to Dar es Salaam), then show the searchable airport list and airport information. *Continue*, then *Calculate estimate*.
4. **Footprint.** The route draws across the Equator: about 0.93 t CO₂e per economy passenger, one way. Open *How this estimate is calculated* and read the statement that a contribution does not offset the flight.
5. **Discover.** Choose Kilimanjaro, then Rufiji Delta mangroves; open the facts; switch the map to 3D.
6. **Support.** Choose *Mangrove restoration* and US$25; note the illustrative impact and the demonstration labels. Add a name, tick the consent box, review, and confirm the simulated contribution.
7. **Acknowledgement.** Download the PDF and show the DEMO verification code.
8. **Dashboard (`/dashboard/`).** Show the banner saying the data is illustrative, then the KPIs. Filter to *Mangrove restoration · 30 days*. Point to the journey you just made, tagged *This device*. Click a map circle, export the PDF report, then *Reset demo data*.
