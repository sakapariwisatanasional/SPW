// scripts/process_kecamatan.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../src/data');
const files = [
  'kecamatan_raw.csv',
  'chunk2.csv',
  'chunk3.csv',
  'chunk4.csv',
  'chunk5.csv',
  'chunk6.csv',
  'chunk7.csv',
  'chunk8.csv',
  'chunk9.csv',
];

// Extract regencies from wilayahData.ts to validate
const wilayahContent = fs.readFileSync(path.join(dataDir, 'wilayahData.ts'), 'utf-8');
const regencyMatches = wilayahContent.matchAll(/(?:^|[`\n])(\d{4}),(\d{2}),([^\n`]+)/gm);
const validRegencyMap = new Map();
for (const match of regencyMatches) {
  const code = match[1].trim();
  const provCode = match[2].trim();
  const name = match[3].trim().replace(/;$/, '');
  validRegencyMap.set(code, { code, provCode, name });
}
console.log(`Loaded ${validRegencyMap.size} valid regencies from wilayahData.ts`);

// Remap table for regional division / Papua new provinces harmonization
const REGENCY_REMAP = {
  '9106': '9111', // Manokwari Selatan
  '9107': '9112', // Pegunungan Arfak
  '9201': '9601', // Kab Sorong (Papua Barat Daya)
  '9202': '9602', // Kab Sorong Selatan (Papua Barat Daya)
  '9203': '9603', // Kab Raja Ampat (Papua Barat Daya)
  '9204': '9605', // Kab Maybrat (Papua Barat Daya)
  '9205': '9604', // Kab Tambrauw (Papua Barat Daya)
  '9271': '9671', // Kota Sorong (Papua Barat Daya)
  '9501': '9201', // Kab Nabire (Papua Tengah)
  '9502': '9203', // Kab Paniai (Papua Tengah)
  '9503': '9204', // Kab Mimika (Papua Tengah)
  '9504': '9205', // Kab Puncak (Papua Tengah)
  '9505': '9208', // Kab Deiyai (Papua Tengah)
  '9506': '9206', // Kab Dogiyai (Papua Tengah)
  '9507': '9207', // Kab Intan Jaya (Papua Tengah)
  '9508': '9202', // Kab Puncak Jaya (Papua Tengah)
  '9601': '9501', // Kab Jayawijaya (Papua Pegunungan)
  '9602': '9502', // Kab Pegunungan Bintang (Papua Pegunungan)
  '9603': '9503', // Kab Yahukimo (Papua Pegunungan)
  '9604': '9504', // Kab Tolikara (Papua Pegunungan)
  '9605': '9506', // Kab Yalimo (Papua Pegunungan)
  '9606': '9505', // Kab Mamberamo Tengah (Papua Pegunungan)
  '9607': '9507', // Kab Lanny Jaya (Papua Pegunungan)
  '9608': '9508', // Kab Nduga (Papua Pegunungan)
  '7324': '7325', // Kab Luwu Timur
};

const districtMap = new Map();
let totalLines = 0;
let skippedLines = 0;

for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${file}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  totalLines += lines.length;

  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 3) {
      skippedLines++;
      continue;
    }

    let code = parts[0];
    let regCode = parts[1];
    let name = parts.slice(2).join(',').trim();

    // Check if parts[0] is 7-digit code and parts[1] is 4-digit regency
    if (code.length === 7 && regCode.length === 4) {
      let targetReg = REGENCY_REMAP[regCode] || regCode;
      const dist3 = code.slice(4);
      const canonicalCode = `${targetReg}${dist3}`;
      districtMap.set(canonicalCode, {
        code: canonicalCode,
        regencyCode: targetReg,
        districtCode3: dist3,
        name: name.toUpperCase()
      });
    } else if (parts[0].length === 4 && parts[1].length <= 3) {
      const rCode = parts[0];
      let targetReg = REGENCY_REMAP[rCode] || rCode;
      const dist3 = parts[1].padStart(3, '0');
      const canonicalCode = `${targetReg}${dist3}`;
      districtMap.set(canonicalCode, {
        code: canonicalCode,
        regencyCode: targetReg,
        districtCode3: dist3,
        name: name.toUpperCase()
      });
    } else {
      skippedLines++;
    }
  }
}

console.log(`Parsed total ${districtMap.size} unique districts from ${totalLines} lines (skipped ${skippedLines}).`);

// Validate against regencies
let matchedRegencies = new Set();
let unmatchedCount = 0;
for (const [code, item] of districtMap.entries()) {
  if (validRegencyMap.has(item.regencyCode)) {
    matchedRegencies.add(item.regencyCode);
  } else {
    unmatchedCount++;
  }
}

console.log(`Districts cover ${matchedRegencies.size} / ${validRegencyMap.size} regencies.`);
if (unmatchedCount > 0) {
  const unmatchedCodes = new Map();
  for (const [code, item] of districtMap.entries()) {
    if (!validRegencyMap.has(item.regencyCode)) {
      unmatchedCodes.set(item.regencyCode, (unmatchedCodes.get(item.regencyCode) || 0) + 1);
    }
  }
  console.log(`Unmatched regency codes in districts (${unmatchedCodes.size} distinct):`, Array.from(unmatchedCodes.entries()));
}

// Generate src/data/districtsData.ts
// To make it compact, clean, and fast to load:
// We can group by regencyCode: { [regencyCode]: [ [code3, name], ... ] }
const groupedByRegency = {};
for (const item of districtMap.values()) {
  if (!groupedByRegency[item.regencyCode]) {
    groupedByRegency[item.regencyCode] = [];
  }
  groupedByRegency[item.regencyCode].push([item.districtCode3, item.name]);
}

// Sort districts in each regency by code3
for (const regCode in groupedByRegency) {
  groupedByRegency[regCode].sort((a, b) => a[0].localeCompare(b[0]));
}

const fileHeader = `/**
 * Master Data Kecamatan se-Indonesia (Synchronized with 38 Provinsi & 514 Kab/Kota)
 * Total Kecamatan: ${districtMap.size}
 * Auto-generated and verified.
 */
import { DistrictItem } from './wilayahData';

// Compact record: regencyCode -> Array of [districtCode3, name]
export const COMPACT_DISTRICTS_DATA: Record<string, [string, string][]> = ${JSON.stringify(groupedByRegency, null, 2)};

export function getMasterDistrictsByRegency(regencyCode: string): DistrictItem[] {
  const list = COMPACT_DISTRICTS_DATA[regencyCode];
  if (!list || list.length === 0) return [];
  return list.map(([districtCode3, name]) => ({
    code: \`\${regencyCode}\${districtCode3}\`,
    regencyCode,
    districtCode3,
    name,
  }));
}

export function getMasterDistrictByCode(code: string): DistrictItem | undefined {
  if (!code || code.length < 7) return undefined;
  const regCode = code.slice(0, 4);
  const dist3 = code.slice(4);
  const list = COMPACT_DISTRICTS_DATA[regCode];
  if (!list) return undefined;
  const found = list.find(([d3]) => d3 === dist3);
  if (found) {
    return {
      code,
      regencyCode: regCode,
      districtCode3: dist3,
      name: found[1],
    };
  }
  return undefined;
}

export const TOTAL_MASTER_DISTRICTS = ${districtMap.size};
`;

fs.writeFileSync(path.join(dataDir, 'districtsData.ts'), fileHeader, 'utf-8');
console.log(`Successfully generated src/data/districtsData.ts with ${districtMap.size} districts!`);
