export const CLOCK_UPDATE_INTERVAL = 30_000;

export const STORAGE_KEYS = {
  FAVORITES: "livetv:favorites" as const,
  RECENTS: "livetv:recents" as const
} as const;

export const COUNTRY_PATTERNS: Array<[RegExp, string]> = [
  [/\b(ARG|AR|Argentina)\b/i, "Argentina"],
  [/\b(BR|Brazil|Brasil)\b/i, "Brazil"],
  [/\b(CL|Chile)\b/i, "Chile"],
  [/\b(CO|Colombia)\b/i, "Colombia"],
  [/\b(DE|Germany|Deutschland)\b/i, "Germany"],
  [/\b(ES|Spain|Espana)\b/i, "Spain"],
  [/\b(FR|France)\b/i, "France"],
  [/\b(GB|UK|United Kingdom|England)\b/i, "United Kingdom"],
  [/\b(IN|India)\b/i, "India"],
  [/\b(IT|Italy|Italia)\b/i, "Italy"],
  [/\b(MX|Mexico)\b/i, "Mexico"],
  [/\b(NL|Netherlands)\b/i, "Netherlands"],
  [/\b(PT|Portugal)\b/i, "Portugal"],
  [/\b(QA|Qatar)\b/i, "Qatar"],
  [/\b(SA|Saudi Arabia)\b/i, "Saudi Arabia"],
  [/\b(TR|Turkey)\b/i, "Turkey"],
  [/\b(UA|Ukraine)\b/i, "Ukraine"],
  [/\b(USA|United States|US)\b/i, "USA"],
  [/Latino|Latin America/i, "Latin America"]
];

export const GROUP_PATTERNS: Array<[RegExp, string]> = [
  [/^(AR\s*\||.*\bARG\b|.*Argentina)/i, "Argentina"],
  [/^(MX\s*\||.*Mexico)/i, "Mexico"],
  [/^(USA\s*\||.*NBC|.*NBA|.*Fox Soccer|.*Universo)/i, "USA"],
  [/Latino|TUDN|Claro|Telemundo|Azteca|Win Sports|TyC|Tigo/i, "Latino"],
  [/ESPN/i, "ESPN"],
  [/FOX/i, "Fox"],
  [/beIN|BEIN/i, "beIN"],
  [/DAZN/i, "DAZN"],
  [/SKY|Sky/i, "Sky"],
  [/Setanta|OTT/i, "Eastern Europe"],
  [/SPORT|Sports|Sport|Deportes|Futbol|Football|Golf|Liga|LALIGA/i, "Sports"]
];
