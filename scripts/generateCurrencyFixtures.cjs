/**
 * Currency Test Fixture Generator
 * ================================
 * Generates comprehensive test fixtures for every real-world currency.
 *
 * Reads from:
 *   - currency-codes package (all 179 ISO-4217 entries)
 *   - src/patterns/symbols.ts CURRENCY_SYMBOL_MAP (manually extracted below)
 *   - src/currencyMapBuilder.ts nameToCodeMap overrides
 *
 * Outputs: test/fixtures/worldCurrencies.json
 *
 * Run:  node scripts/generateCurrencyFixtures.cjs
 */

const currencyCodes = require("currency-codes");
const fs = require("fs");
const path = require("path");

// ──────────────────────────────────────────────
// 1.  NON-TRANSACTABLE CODES TO EXCLUDE
// ──────────────────────────────────────────────
const EXCLUDED_CODES = new Set([
  // Precious metals
  "XAG",
  "XAU",
  "XPD",
  "XPT",
  // Bond market / supranational units
  "XBA",
  "XBB",
  "XBC",
  "XBD",
  "XDR",
  "XSU",
  "XUA",
  // Testing / no-currency
  "XTS",
  "XXX",
  // Fund codes / adjustment units
  "BOV",
  "CHE",
  "CHW",
  "CLF",
  "COU",
  "MXV",
  "USN",
  "UYI",
  "UYW",
]);

// ──────────────────────────────────────────────
// 2.  SYMBOL MAP  (mirrors CURRENCY_SYMBOL_MAP from src/patterns/symbols.ts)
//     key = symbol string, value = array of ISO codes it maps to
// ──────────────────────────────────────────────
const SYMBOL_MAP = {
  $: [
    "USD",
    "AUD",
    "CAD",
    "NZD",
    "SGD",
    "HKD",
    "MXN",
    "ARS",
    "CLP",
    "COP",
    "BRL",
  ],
  US$: ["USD"],
  A$: ["AUD"],
  AU$: ["AUD"],
  C$: ["CAD"],
  CA$: ["CAD"],
  NZ$: ["NZD"],
  S$: ["SGD"],
  HK$: ["HKD"],
  MX$: ["MXN"],
  AR$: ["ARS"],
  CL$: ["CLP"],
  CO$: ["COP"],
  R$: ["BRL"],
  "€": ["EUR"],
  "£": ["GBP"],
  "¥": ["JPY", "CNY"],
  "JP¥": ["JPY"],
  "CN¥": ["CNY"],
  元: ["CNY"],
  "₹": ["INR"],
  Rs: ["INR"],
  "Rs.": ["INR"],
  "₽": ["RUB"],
  руб: ["RUB"],
  "₩": ["KRW"],
  "₺": ["TRY"],
  TL: ["TRY"],
  Fr: ["CHF"],
  SFr: ["CHF"],
  zł: ["PLN"],
  "฿": ["THB"],
  Rp: ["IDR"],
  RM: ["MYR"],
  "₱": ["PHP"],
  "₫": ["VND"],
  R: ["ZAR"],
  kr: ["SEK", "NOK", "DKK", "ISK"],
  Kč: ["CZK"],
  Ft: ["HUF"],
  "₪": ["ILS"],
  "د.إ": ["AED"],
  "ر.س": ["SAR"],
  "E£": ["EGP"],
  "₦": ["NGN"],
  KSh: ["KES"],
  "৳": ["BDT"],
  "₴": ["UAH"],
  lei: ["RON"],
  лв: ["BGN"],
  kn: ["HRK"],
  "S/": ["PEN"],
  $U: ["UYU"],
  "₸": ["KZT"],
  "֏": ["AMD"],
  "₾": ["GEL"],
  "₼": ["AZN"],
  "₮": ["MNT"],
  "៛": ["KHR"],
  "₭": ["LAK"],
  K: ["MMK"],
  "؋": ["AFN"],
  "﷼": ["IRR"],
  KD: ["KWD"],
  BD: ["BHD"],
  QR: ["QAR"],
  LL: ["LBP"],
  TSh: ["TZS"],
  USh: ["UGX"],
  "GH₵": ["GHS"],
  N$: ["NAD"],
  FJ$: ["FJD"],
  P: ["BWP"],
  CFA: ["XOF", "XAF"],
};

// Build reverse map: code → [{ symbol, isUnique }]
function buildCodeToSymbols() {
  const map = {};
  for (const [sym, codes] of Object.entries(SYMBOL_MAP)) {
    // Skip entries that are just ISO codes themselves (like "USD": ["USD"])
    if (/^[A-Z]{3}$/.test(sym)) continue;
    for (const code of codes) {
      if (!map[code]) map[code] = [];
      map[code].push({ symbol: sym, isUnique: codes.length === 1 });
    }
  }
  return map;
}

// ──────────────────────────────────────────────
// 3.  AMBIGUITY GROUPS
//     Maps a bare currency word → the default ISO code it resolves to
//     (from currencyMapBuilder.ts overrides)
//     All other currencies sharing that word need qualification.
// ──────────────────────────────────────────────
const WORD_DEFAULTS = {
  dollar: "USD",
  euro: "EUR",
  pound: "GBP",
  yen: "JPY",
  rupee: "INR",
  peso: "MXN",
  won: "KRW",
  dirham: "AED",
};

// Which currencies share which ambiguous bare words?
// Manually curated based on official currency names from currency-codes.
const AMBIGUITY_GROUPS = {
  dollar: [
    "USD",
    "AUD",
    "CAD",
    "NZD",
    "SGD",
    "HKD",
    "BBD",
    "BMD",
    "BND",
    "BSD",
    "BZD",
    "FJD",
    "GYD",
    "JMD",
    "KYD",
    "LRD",
    "NAD",
    "SBD",
    "SRD",
    "TTD",
    "TWD",
    "XCD",
    "ZWG",
  ],
  euro: ["EUR"],
  pound: ["GBP", "EGP", "LBP", "SHP", "SYP", "SDG", "SSP", "FKP", "GIP"],
  yen: ["JPY"],
  rupee: ["INR", "PKR", "LKR", "NPR", "MUR", "SCR"],
  peso: ["MXN", "ARS", "CLP", "COP", "CUP", "DOP", "PHP", "UYU"],
  won: ["KRW", "KPW"],
  dirham: ["AED", "MAD"],
  franc: ["CHF", "XOF", "XAF", "XPF", "BIF", "CDF", "DJF", "GNF", "KMF", "RWF"],
  dinar: ["KWD", "IQD", "JOD", "BHD", "TND", "DZD", "LYD", "RSD"],
  riyal: ["SAR", "QAR", "YER"],
  rial: ["IRR", "OMR"],
  krone: ["DKK", "NOK", "ISK"],
  krona: ["SEK"],
  shilling: ["KES", "TZS", "UGX", "SOS"],
  leu: ["RON", "MDL"],
  lev: ["BGN"],
  kwacha: ["MWK", "ZMW"],
  real: ["BRL"],
  ruble: ["RUB", "BYN"],
  lira: ["TRY"],
  ringgit: ["MYR"],
  baht: ["THB"],
  rupiah: ["IDR"],
  dong: ["VND"],
  taka: ["BDT"],
  rand: ["ZAR"],
  naira: ["NGN"],
  cedi: ["GHS"],
  birr: ["ETB"],
  sheqel: ["ILS"],
  hryvnia: ["UAH"],
  zloty: ["PLN"],
  forint: ["HUF"],
  koruna: ["CZK"],
  lari: ["GEL"],
  manat: ["AZN", "TMT"],
  som: ["KGS", "UZS"],
  tenge: ["KZT"],
  tugrik: ["MNT"],
  kip: ["LAK"],
  kyat: ["MMK"],
  afghani: ["AFN"],
  nakfa: ["ERN"],
  ariary: ["MGA"],
  pula: ["BWP"],
  dalasi: ["GMD"],
  ouguiya: ["MRU"],
  leone: ["SLE"],
  dobra: ["STN"],
  vatu: ["VUV"],
  tala: ["WST"],
  kina: ["PGK"],
  ngultrum: ["BTN"],
  rufiyaa: ["MVR"],
  lilangeni: ["SZL"],
  loti: ["LSL"],
  kwanza: ["AOA"],
  metical: ["MZN"],
  gourde: ["HTG"],
  quetzal: ["GTQ"],
  lempira: ["HNL"],
  balboa: ["PAB"],
  colon: ["CRC", "SVC"],
  cordoba: ["NIO"],
  guarani: ["PYG"],
  boliviano: ["BOB"],
  sol: ["PEN"],
  pataca: ["MOP"],
  riel: ["KHR"],
  somoni: ["TJS"],
  dram: ["AMD"],
  guilder: ["ANG", "AWG"],
};

// Build reverse: code → { bareWord, isDefault }
function buildCodeToAmbiguity() {
  const map = {};
  for (const [word, codes] of Object.entries(AMBIGUITY_GROUPS)) {
    const defaultCode =
      WORD_DEFAULTS[word] || (codes.length === 1 ? codes[0] : null);
    for (const code of codes) {
      if (!map[code]) map[code] = [];
      map[code].push({
        bareWord: word,
        isDefault: code === defaultCode,
        groupSize: codes.length,
      });
    }
  }
  return map;
}

// ──────────────────────────────────────────────
// 4.  EXTRA COMMON NAMES / INFORMAL NAMES
//     These go beyond what currency-codes gives us.
// ──────────────────────────────────────────────
const EXTRA_NAMES = {
  USD: ["us dollar", "american dollar", "united states dollar"],
  EUR: ["euro"],
  GBP: ["british pound", "pound sterling", "sterling"],
  JPY: ["japanese yen"],
  CNY: ["chinese yuan", "renminbi", "yuan renminbi", "yuan"],
  INR: ["indian rupee"],
  AUD: ["australian dollar", "aussie dollar"],
  CAD: ["canadian dollar"],
  CHF: ["swiss franc"],
  NZD: ["new zealand dollar", "kiwi dollar"],
  SGD: ["singapore dollar"],
  HKD: ["hong kong dollar"],
  SEK: ["swedish krona"],
  NOK: ["norwegian krone"],
  DKK: ["danish krone"],
  ISK: ["iceland krona", "icelandic krona"],
  PLN: ["polish zloty"],
  CZK: ["czech koruna"],
  HUF: ["hungarian forint"],
  RUB: ["russian ruble", "russian rouble"],
  TRY: ["turkish lira"],
  BRL: ["brazilian real"],
  MXN: ["mexican peso"],
  ARS: ["argentine peso"],
  CLP: ["chilean peso"],
  COP: ["colombian peso"],
  PHP: ["philippine peso"],
  IDR: ["indonesian rupiah"],
  MYR: ["malaysian ringgit"],
  THB: ["thai baht"],
  VND: ["vietnamese dong"],
  KRW: ["south korean won", "korean won"],
  KPW: ["north korean won"],
  ZAR: ["south african rand"],
  NGN: ["nigerian naira"],
  KES: ["kenyan shilling"],
  EGP: ["egyptian pound"],
  AED: ["uae dirham", "emirati dirham"],
  SAR: ["saudi riyal"],
  QAR: ["qatari riyal"],
  ILS: ["israeli sheqel", "israeli shekel", "new israeli sheqel"],
  UAH: ["ukrainian hryvnia"],
  RON: ["romanian leu"],
  BGN: ["bulgarian lev"],
  RSD: ["serbian dinar"],
  PKR: ["pakistan rupee", "pakistani rupee"],
  LKR: ["sri lanka rupee", "sri lankan rupee"],
  NPR: ["nepalese rupee", "nepali rupee"],
  MUR: ["mauritius rupee", "mauritian rupee"],
  SCR: ["seychelles rupee", "seychellois rupee"],
  BDT: ["bangladeshi taka"],
  MMK: ["myanmar kyat", "burmese kyat"],
  KHR: ["cambodian riel"],
  LAK: ["lao kip", "laotian kip"],
  MNT: ["mongolian tugrik"],
  KZT: ["kazakhstani tenge"],
  UZS: ["uzbekistan sum", "uzbekistani som"],
  KGS: ["kyrgyzstani som"],
  TJS: ["tajikistani somoni"],
  TMT: ["turkmenistan manat", "turkmenistani manat"],
  GEL: ["georgian lari"],
  AMD: ["armenian dram"],
  AZN: ["azerbaijan manat", "azerbaijani manat"],
  AFN: ["afghan afghani"],
  IRR: ["iranian rial"],
  IQD: ["iraqi dinar"],
  JOD: ["jordanian dinar"],
  KWD: ["kuwaiti dinar"],
  BHD: ["bahraini dinar"],
  OMR: ["omani rial", "rial omani"],
  YER: ["yemeni rial"],
  LBP: ["lebanese pound"],
  SYP: ["syrian pound"],
  TND: ["tunisian dinar"],
  DZD: ["algerian dinar"],
  LYD: ["libyan dinar"],
  MAD: ["moroccan dirham"],
  SDG: ["sudanese pound"],
  SSP: ["south sudanese pound"],
  ETB: ["ethiopian birr"],
  ERN: ["eritrean nakfa"],
  TZS: ["tanzanian shilling"],
  UGX: ["uganda shilling", "ugandan shilling"],
  SOS: ["somali shilling"],
  GHS: ["ghana cedi", "ghanaian cedi"],
  XOF: ["west african cfa franc", "cfa franc bceao"],
  XAF: ["central african cfa franc", "cfa franc beac"],
  XPF: ["cfp franc"],
  XCD: ["east caribbean dollar"],
  MGA: ["malagasy ariary"],
  MWK: ["malawi kwacha", "malawian kwacha"],
  ZMW: ["zambian kwacha"],
  BWP: ["botswana pula"],
  NAD: ["namibia dollar", "namibian dollar"],
  MZN: ["mozambique metical", "mozambican metical"],
  AOA: ["angolan kwanza"],
  CDF: ["congolese franc"],
  RWF: ["rwanda franc", "rwandan franc"],
  BIF: ["burundi franc", "burundian franc"],
  DJF: ["djibouti franc"],
  GNF: ["guinean franc"],
  KMF: ["comorian franc"],
  SLE: ["sierra leonean leone"],
  GMD: ["gambian dalasi"],
  MRU: ["mauritanian ouguiya"],
  STN: ["sao tome dobra"],
  CVE: ["cabo verde escudo", "cape verdean escudo"],
  SZL: ["swazi lilangeni", "eswatini lilangeni"],
  LSL: ["lesotho loti"],
  FKP: ["falkland islands pound"],
  GIP: ["gibraltar pound"],
  SHP: ["saint helena pound"],
  BBD: ["barbados dollar", "barbadian dollar"],
  BMD: ["bermudian dollar", "bermuda dollar"],
  BND: ["brunei dollar"],
  BSD: ["bahamian dollar"],
  BZD: ["belize dollar", "belizean dollar"],
  GYD: ["guyana dollar", "guyanese dollar"],
  JMD: ["jamaican dollar"],
  KYD: ["cayman islands dollar"],
  LRD: ["liberian dollar"],
  SBD: ["solomon islands dollar"],
  SRD: ["surinam dollar", "surinamese dollar"],
  TTD: ["trinidad and tobago dollar"],
  TWD: ["new taiwan dollar", "taiwanese dollar"],
  FJD: ["fiji dollar", "fijian dollar"],
  VUV: ["vanuatu vatu"],
  WST: ["samoan tala"],
  TOP: ["tongan paanga"],
  PGK: ["papua new guinean kina"],
  BTN: ["bhutanese ngultrum"],
  MVR: ["maldivian rufiyaa"],
  HTG: ["haitian gourde"],
  GTQ: ["guatemalan quetzal"],
  HNL: ["honduran lempira"],
  NIO: ["nicaraguan cordoba"],
  CRC: ["costa rican colon"],
  SVC: ["el salvador colon"],
  PAB: ["panamanian balboa"],
  DOP: ["dominican peso"],
  CUP: ["cuban peso"],
  CUC: ["cuban convertible peso", "peso convertible"],
  PYG: ["paraguayan guarani"],
  BOB: ["bolivian boliviano"],
  PEN: ["peruvian sol"],
  UYU: ["uruguayan peso", "peso uruguayo"],
  VES: ["venezuelan bolivar", "bolivar soberano"],
  VED: ["venezuelan digital bolivar"],
  ANG: ["netherlands antillean guilder"],
  AWG: ["aruban florin"],
  MOP: ["macanese pataca"],
  BAM: ["bosnia convertible mark", "bosnian mark"],
  MDL: ["moldovan leu"],
  MKD: ["macedonian denar"],
  ALL: ["albanian lek"],
  BYN: ["belarusian ruble"],
  HRK: ["croatian kuna"],
  ZWG: ["zimbabwe gold"],
};

// ──────────────────────────────────────────────
// 5.  CATEGORY ASSIGNMENT
// ──────────────────────────────────────────────
//
// Category A: "Unique" – currency has its own unique symbol AND/OR is
//             the default for its bare word (e.g. USD, EUR, GBP, JPY, INR)
// Category B: "Disambiguated by prefix" – currency shares a bare word
//             with others but has a unique prefixed symbol (e.g. A$, C$, HK$)
// Category C: "Disambiguated by qualifier" – currency shares a bare word,
//             NO unique symbol, must use full name or ISO code
//             (e.g. Barbados Dollar, Bermudian Dollar)
// Category D: "ISO-only" – no symbol in our map, no shared bare word,
//             essentially only reachable via ISO code or full official name
//             (e.g. some rare African / Pacific currencies)

function assignCategory(code, codeToSymbols, codeToAmbiguity) {
  const symbols = codeToSymbols[code] || [];
  const ambiguities = codeToAmbiguity[code] || [];
  const hasUniqueSymbol = symbols.some((s) => s.isUnique);
  const isDefaultForBareWord = ambiguities.some((a) => a.isDefault);
  const inAmbiguityGroup = ambiguities.length > 0;

  if (hasUniqueSymbol && isDefaultForBareWord) return "A";
  if (hasUniqueSymbol || isDefaultForBareWord) return "A";
  if (symbols.length > 0 && !hasUniqueSymbol && inAmbiguityGroup) return "B";
  if (inAmbiguityGroup && !hasUniqueSymbol) return "C";
  if (symbols.length > 0) return "B";
  return "D";
}

// ──────────────────────────────────────────────
// 6.  TEST CASE GENERATION
// ──────────────────────────────────────────────

function generateTestCases(cur, category, codeToSymbols, codeToAmbiguity) {
  const code = cur.code;
  const tests = [];

  // --- Tier 1: ISO code before amount ---
  tests.push({
    input: `${code} 100`,
    expectedAmount: 100,
    expectedCurrency: code,
    format: "iso_code_before",
  });

  // --- Tier 2: ISO code after amount ---
  tests.push({
    input: `100 ${code}`,
    expectedAmount: 100,
    expectedCurrency: code,
    format: "iso_code_after",
  });

  // --- Tier 3: Full official name ---
  const officialName = cur.currency.toLowerCase();
  tests.push({
    input: `100 ${officialName}`,
    expectedAmount: 100,
    expectedCurrency: code,
    format: "full_official_name",
  });

  // --- Tier 4: Extra common names (qualified) ---
  const extras = EXTRA_NAMES[code] || [];
  for (const name of extras) {
    // Skip if same as official name lowercased
    if (name === officialName) continue;
    tests.push({
      input: `100 ${name}`,
      expectedAmount: 100,
      expectedCurrency: code,
      format: "common_name",
    });
  }

  // --- Tier 5: Symbol-based tests ---
  const symbols = codeToSymbols[code] || [];
  for (const { symbol, isUnique } of symbols) {
    if (isUnique) {
      // Unique symbol: should work without defaultCurrency
      tests.push({
        input: `${symbol}100`,
        expectedAmount: 100,
        expectedCurrency: code,
        format: "unique_symbol_before",
      });
      tests.push({
        input: `100${symbol}`,
        expectedAmount: 100,
        expectedCurrency: code,
        format: "unique_symbol_after",
      });
    } else {
      // Shared symbol: needs defaultCurrency
      tests.push({
        input: `${symbol}100`,
        expectedAmount: 100,
        expectedCurrency: code,
        defaultCurrency: code,
        format: "shared_symbol_with_default",
      });
    }
  }

  // --- Tier 6: Bare word tests (for currencies in ambiguity groups) ---
  const ambiguities = codeToAmbiguity[code] || [];
  for (const { bareWord, isDefault } of ambiguities) {
    if (isDefault) {
      // Default winner: bare word resolves to this currency
      tests.push({
        input: `100 ${bareWord}`,
        expectedAmount: 100,
        expectedCurrency: code,
        format: "bare_word_default",
      });
      // Also plural
      const plural = bareWord.endsWith("s") ? bareWord : `${bareWord}s`;
      tests.push({
        input: `100 ${plural}`,
        expectedAmount: 100,
        expectedCurrency: code,
        format: "bare_word_plural_default",
      });
    }
  }

  return tests;
}

// ──────────────────────────────────────────────
// 7.  MAIN
// ──────────────────────────────────────────────

function main() {
  const allCurrencies = currencyCodes.data;
  const codeToSymbols = buildCodeToSymbols();
  const codeToAmbiguity = buildCodeToAmbiguity();

  const fixtures = [];

  for (const cur of allCurrencies) {
    if (EXCLUDED_CODES.has(cur.code)) continue;

    const category = assignCategory(cur.code, codeToSymbols, codeToAmbiguity);
    const tests = generateTestCases(
      cur,
      category,
      codeToSymbols,
      codeToAmbiguity
    );

    fixtures.push({
      code: cur.code,
      officialName: cur.currency,
      countries: cur.countries,
      digits: cur.digits,
      category,
      tests,
    });
  }

  // Sort by category then code
  fixtures.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.code.localeCompare(b.code);
  });

  // Stats
  const totalTests = fixtures.reduce((sum, f) => sum + f.tests.length, 0);
  const byCat = { A: 0, B: 0, C: 0, D: 0 };
  fixtures.forEach((f) => byCat[f.category]++);

  console.log(`Generated fixtures for ${fixtures.length} currencies`);
  console.log(`  Category A (unique/default):           ${byCat.A}`);
  console.log(`  Category B (disambiguated by symbol):  ${byCat.B}`);
  console.log(`  Category C (disambiguated by qualifier): ${byCat.C}`);
  console.log(`  Category D (ISO-only):                 ${byCat.D}`);
  console.log(`  Total test cases:                      ${totalTests}`);

  const outPath = path.join(
    __dirname,
    "..",
    "test",
    "fixtures",
    "worldCurrencies.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(fixtures, null, 2));
  console.log(`\nWritten to: ${outPath}`);
}

main();
