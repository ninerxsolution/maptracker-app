import type { Quake } from "./usgs";

// USGS has no country field — only free-text `place`, e.g.
//   "45 km NNE of Cruz Bay, U.S. Virgin Islands" · "Izu Islands, Japan region"
//   "22 km SSW of La Quinta, CA" · "south of the Fiji Islands" · "northern Mid-Atlantic Ridge"
// These helpers normalise that text into a country (or ocean region) and aggregate.

const US_STATES = new Set([
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
  "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
  "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  // ("Georgia" is deliberately absent — in USGS feeds it is almost always the country.)
]);
const US_STATE_CODES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// Alternate spellings of the same country (no sub-region worth showing).
const VARIANTS: Record<string, string> = {
  MX: "Mexico",
  "Burma (Myanmar)": "Myanmar",
  Burma: "Myanmar",
  "Fiji Islands": "Fiji",
  "Federated States of Micronesia": "Micronesia",
  "Timor-Leste": "Timor Leste",
  "East Timor": "Timor Leste",
  Türkiye: "Turkey",
  Turkiye: "Turkey",
};

// Island groups → sovereign country / territory (kept as a sub-region).
const ISLAND_GROUPS: Record<string, string> = {
  "Kermadec Islands": "New Zealand",
  "Loyalty Islands": "New Caledonia",
  "Kuril Islands": "Russia",
  "Komandorskiye Ostrova": "Russia",
  "Mariana Islands": "Northern Mariana Islands",
  "Aleutian Islands": "United States",
  "Rat Islands": "United States",
  "Andreanof Islands": "United States",
  "Fox Islands": "United States",
  "Galapagos Islands": "Ecuador",
  "Easter Island": "Chile",
  "Macquarie Island": "Australia",
  "Izu Islands": "Japan",
  "Bonin Islands": "Japan",
  "Ryukyu Islands": "Japan",
  "Andaman Islands": "India",
  "Nicobar Islands": "India",
  "Santa Cruz Islands": "Solomon Islands",
  "South Sandwich Islands": "South Georgia and the South Sandwich Islands",
  "Chagos Archipelago": "British Indian Ocean Territory",
  Socotra: "Yemen",
  "Jan Mayen": "Svalbard",
  "Balleny Islands": "Antarctica",
};

const ISO2: Record<string, string> = {
  "United States": "US", "Puerto Rico": "PR", "U.S. Virgin Islands": "VI", Guam: "GU",
  "Northern Mariana Islands": "MP", "American Samoa": "AS", Canada: "CA", Mexico: "MX",
  Guatemala: "GT", "El Salvador": "SV", Honduras: "HN", Nicaragua: "NI", "Costa Rica": "CR",
  Panama: "PA", Belize: "BZ", Cuba: "CU", Haiti: "HT", "Dominican Republic": "DO",
  Jamaica: "JM", "Trinidad and Tobago": "TT", Guadeloupe: "GP", Martinique: "MQ",
  Dominica: "DM", Montserrat: "MS", "Saint Lucia": "LC", Barbados: "BB", Anguilla: "AI",
  "Saint Kitts and Nevis": "KN", Colombia: "CO", Venezuela: "VE", Ecuador: "EC", Peru: "PE",
  Bolivia: "BO", Chile: "CL", Argentina: "AR", Brazil: "BR", Paraguay: "PY", Uruguay: "UY",
  Iceland: "IS", Norway: "NO", Svalbard: "SJ", Portugal: "PT", Spain: "ES", France: "FR",
  Italy: "IT", Switzerland: "CH", Austria: "AT", Germany: "DE", Poland: "PL", Slovenia: "SI",
  Croatia: "HR", "Bosnia and Herzegovina": "BA", Serbia: "RS", Montenegro: "ME", Albania: "AL",
  "North Macedonia": "MK", Greece: "GR", Bulgaria: "BG", Romania: "RO", Ukraine: "UA",
  Cyprus: "CY", Turkey: "TR", Georgia: "GE", Armenia: "AM", Azerbaijan: "AZ", Iran: "IR",
  Iraq: "IQ", Syria: "SY", Lebanon: "LB", Israel: "IL", Jordan: "JO", "Saudi Arabia": "SA",
  Yemen: "YE", Oman: "OM", Egypt: "EG", Libya: "LY", Tunisia: "TN", Algeria: "DZ",
  Morocco: "MA", Ethiopia: "ET", Eritrea: "ER", Djibouti: "DJ", Somalia: "SO", Kenya: "KE",
  Uganda: "UG", Rwanda: "RW", Burundi: "BI", Tanzania: "TZ", Malawi: "MW", Mozambique: "MZ",
  Zambia: "ZM", Zimbabwe: "ZW", "South Africa": "ZA", Madagascar: "MG", Mauritius: "MU",
  Sudan: "SD", "South Sudan": "SS", "Democratic Republic of the Congo": "CD",
  Kazakhstan: "KZ", Kyrgyzstan: "KG", Tajikistan: "TJ", Uzbekistan: "UZ", Turkmenistan: "TM",
  Afghanistan: "AF", Pakistan: "PK", India: "IN", Nepal: "NP", Bhutan: "BT", Bangladesh: "BD",
  "Sri Lanka": "LK", Myanmar: "MM", Thailand: "TH", Laos: "LA", Vietnam: "VN", Cambodia: "KH",
  Malaysia: "MY", Singapore: "SG", Brunei: "BN", Indonesia: "ID", "Timor Leste": "TL",
  Philippines: "PH", Taiwan: "TW", China: "CN", Mongolia: "MN", "North Korea": "KP",
  "South Korea": "KR", Japan: "JP", Russia: "RU", "Papua New Guinea": "PG",
  "Solomon Islands": "SB", Vanuatu: "VU", "New Caledonia": "NC", Fiji: "FJ", Tonga: "TO",
  Samoa: "WS", "Wallis and Futuna": "WF", Kiribati: "KI", Tuvalu: "TV", Micronesia: "FM",
  Palau: "PW", "Marshall Islands": "MH", "Cook Islands": "CK", "French Polynesia": "PF",
  Niue: "NU", Australia: "AU", "New Zealand": "NZ", Antarctica: "AQ",
  "South Georgia and the South Sandwich Islands": "GS",
  "British Indian Ocean Territory": "IO",
};

const OCEAN_RE =
  /(Ridge|Rise|Sea|Ocean|Passage|Fracture Zone|Trench|Basin|Gulf|Strait|Plateau|Triple Junction)$/i;
const DIRECTION_PREFIX_RE =
  /^(?:(?:off|near) the (?:\w+ )?coast of|(?:north|south|east|west|northeast|northwest|southeast|southwest) of(?: the)?|northern|southern|eastern|western|central)\s+/i;

type Region = { key: string; sub: string | null; isOcean: boolean };

/** Map a USGS `place` string to a country (or ocean region). */
export function regionOf(place: string | null): Region {
  if (!place) return { key: "Unknown", sub: null, isOcean: false };

  const comma = place.lastIndexOf(", ");
  let name = (comma >= 0 ? place.slice(comma + 2) : place).trim();
  name = name.replace(/\s+region$/i, "");

  // Strip "south of the …" / "northern …" and keep it only if it lands somewhere known.
  const stripped = name.replace(DIRECTION_PREFIX_RE, "").replace(/\s+region$/i, "");
  const offshore = stripped !== name;
  const known = (n: string) =>
    Boolean(VARIANTS[n] || ISLAND_GROUPS[n] || ISO2[n] || US_STATES.has(n) || OCEAN_RE.test(n));
  if (offshore && known(stripped)) name = stripped;

  if (US_STATE_CODES[name]) return { key: "United States", sub: US_STATE_CODES[name], isOcean: false };
  if (US_STATES.has(name)) return { key: "United States", sub: name, isOcean: false };
  if (VARIANTS[name]) return { key: VARIANTS[name], sub: null, isOcean: false };
  if (ISLAND_GROUPS[name]) return { key: ISLAND_GROUPS[name], sub: name, isOcean: false };

  // Unmapped names are ocean regions if they look like one, or were described as
  // "off the coast of / south of …" something we couldn't place.
  return {
    key: name,
    sub: null,
    isOcean: !ISO2[name] && (OCEAN_RE.test(name) || (offshore && !known(stripped))),
  };
}

const thaiNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["th"], { type: "region" })
    : null;

export type SituationLevel = "critical" | "watch" | "normal";

export type CountryEvent = {
  id: string;
  mag: number | null;
  place: string | null;
  time: number;
  depth: number | null;
  url: string | null;
  tsunami: number;
};

export type CountryStat = {
  key: string; // canonical English name (as USGS spells it)
  code: string | null; // ISO 3166-1 alpha-2
  label: string; // Thai name when known
  isOcean: boolean;
  count: number;
  maxMag: number | null;
  maxPlace: string | null;
  significant: number;
  felt: number;
  tsunami: number;
  worstAlert: string | null;
  latest: number;
  level: SituationLevel;
  subregions: { name: string; count: number }[];
  events: CountryEvent[];
};

const ALERT_RANK: Record<string, number> = { green: 1, yellow: 2, orange: 3, red: 4 };

/**
 * Situation level for a country, from its strongest signal:
 * - รุนแรง (critical): max M ≥ 6, or a PAGER orange/red alert
 * - เฝ้าระวัง (watch): max M ≥ 4.5, a PAGER yellow alert, or any tsunami flag
 * - ปกติ (normal): everything else
 */
export function situationLevel(
  maxMag: number | null,
  worstAlert: string | null,
  tsunami: number,
): SituationLevel {
  const m = maxMag ?? 0;
  const a = worstAlert ? ALERT_RANK[worstAlert] ?? 0 : 0;
  if (m >= 6 || a >= 3) return "critical";
  if (m >= 4.5 || a === 2 || tsunami > 0) return "watch";
  return "normal";
}

/** Group quakes by country/region and compute per-group stats (sorted by count desc). */
export function aggregateByCountry(quakes: Quake[]): CountryStat[] {
  const groups = new Map<
    string,
    { region: Region; quakes: Quake[]; subs: Map<string, number> }
  >();

  for (const q of quakes) {
    const region = regionOf(q.place);
    let g = groups.get(region.key);
    if (!g) {
      g = { region, quakes: [], subs: new Map() };
      groups.set(region.key, g);
    }
    g.quakes.push(q);
    if (region.sub) g.subs.set(region.sub, (g.subs.get(region.sub) ?? 0) + 1);
  }

  const stats: CountryStat[] = [];
  for (const [key, g] of groups) {
    let maxMag: number | null = null;
    let maxPlace: string | null = null;
    let significant = 0;
    let felt = 0;
    let tsunami = 0;
    let worstAlert: string | null = null;
    let latest = 0;
    for (const q of g.quakes) {
      if (q.mag != null && (maxMag == null || q.mag > maxMag)) {
        maxMag = q.mag;
        maxPlace = q.place;
      }
      if ((q.sig ?? 0) >= 600) significant++;
      felt += q.felt ?? 0;
      if (q.tsunami) tsunami++;
      if (q.alert && (ALERT_RANK[q.alert] ?? 0) > (worstAlert ? ALERT_RANK[worstAlert] ?? 0 : 0)) {
        worstAlert = q.alert;
      }
      if (q.time > latest) latest = q.time;
    }

    const code = ISO2[key] ?? null;
    let label = key;
    if (code && thaiNames) {
      try {
        label = thaiNames.of(code) ?? key;
      } catch {
        label = key;
      }
    }

    stats.push({
      key,
      code,
      label,
      isOcean: g.region.isOcean,
      count: g.quakes.length,
      maxMag,
      maxPlace,
      significant,
      felt,
      tsunami,
      worstAlert,
      latest,
      level: situationLevel(maxMag, worstAlert, tsunami),
      subregions: [...g.subs.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
      events: [...g.quakes]
        .sort((a, b) => b.time - a.time)
        .slice(0, 5)
        .map((q) => ({
          id: q.id,
          mag: q.mag,
          place: q.place,
          time: q.time,
          depth: q.depth,
          url: q.url,
          tsunami: q.tsunami,
        })),
    });
  }

  return stats.sort((a, b) => b.count - a.count || (b.maxMag ?? 0) - (a.maxMag ?? 0));
}
