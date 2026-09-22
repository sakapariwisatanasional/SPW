/**
 * SPWN Apps 2.0 - Master Data Wilayah Indonesia
 * Location: src/data/wilayahData.ts
 * -------------------------------------------------------------
 * Data master Provinsi, Kabupaten/Kota (regencies), dan Kecamatan (districts)
 * sesuai standar BPS / Kemendagri untuk penomoran dan filtering KTA Digital SPWN.
 * 
 * ATURAN KTA FORMAT FINAL:
 * - Kwartir Nasional: 00.NNNNNN
 * - Wilayah: 00.PPKK.CCC.NNNNNN
 *   * 00 = Kode Tetap Kwartir Nasional
 *   * PPKK = Kode Kabupaten/Kota dari regencies (4 digit)
 *   * CCC = 3 Digit Kode Kecamatan turunan dari districts
 *   * NNNNNN = Nomor Urut Anggota 6 digit
 */

export interface ProvinceItem {
  code: string; // 2 digit, e.g. "32"
  name: string;
}

export interface RegencyItem {
  code: string; // 4 digit PPKK, e.g. "3204"
  provinceCode: string; // 2 digit PP, e.g. "32"
  name: string;
}

export interface DistrictItem {
  code: string; // 7 digit PPKKCCC, e.g. "3204190"
  regencyCode: string; // 4 digit PPKK, e.g. "3204"
  districtCode3: string; // 3 digit CCC, e.g. "190"
  name: string;
}

import { getMasterDistrictsByRegency, getMasterDistrictByCode, TOTAL_MASTER_DISTRICTS } from './districtsData';
export { getMasterDistrictsByRegency, getMasterDistrictByCode, TOTAL_MASTER_DISTRICTS };

// -----------------------------------------------------------------
// 1. DATA PROVINSI (38 Provinsi Resmi)
// -----------------------------------------------------------------
export const PROVINCES: ProvinceItem[] = [
  { code: '11', name: 'ACEH' },
  { code: '12', name: 'SUMATERA UTARA' },
  { code: '13', name: 'SUMATERA BARAT' },
  { code: '14', name: 'RIAU' },
  { code: '15', name: 'JAMBI' },
  { code: '16', name: 'SUMATERA SELATAN' },
  { code: '17', name: 'BENGKULU' },
  { code: '18', name: 'LAMPUNG' },
  { code: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { code: '21', name: 'KEPULAUAN RIAU' },
  { code: '31', name: 'DKI JAKARTA' },
  { code: '32', name: 'JAWA BARAT' },
  { code: '33', name: 'JAWA TENGAH' },
  { code: '34', name: 'DI YOGYAKARTA' },
  { code: '35', name: 'JAWA TIMUR' },
  { code: '36', name: 'BANTEN' },
  { code: '51', name: 'BALI' },
  { code: '52', name: 'NUSA TENGGARA BARAT' },
  { code: '53', name: 'NUSA TENGGARA TIMUR' },
  { code: '61', name: 'KALIMANTAN BARAT' },
  { code: '62', name: 'KALIMANTAN TENGAH' },
  { code: '63', name: 'KALIMANTAN SELATAN' },
  { code: '64', name: 'KALIMANTAN TIMUR' },
  { code: '65', name: 'KALIMANTAN UTARA' },
  { code: '71', name: 'SULAWESI UTARA' },
  { code: '72', name: 'SULAWESI TENGAH' },
  { code: '73', name: 'SULAWESI SELATAN' },
  { code: '74', name: 'SULAWESI TENGGARA' },
  { code: '75', name: 'GORONTALO' },
  { code: '76', name: 'SULAWESI BARAT' },
  { code: '81', name: 'MALUKU' },
  { code: '82', name: 'MALUKU UTARA' },
  { code: '91', name: 'PAPUA BARAT' },
  { code: '92', name: 'PAPUA TENGAH' },
  { code: '93', name: 'PAPUA SELATAN' },
  { code: '94', name: 'PAPUA' },
  { code: '95', name: 'PAPUA PEGUNUNGAN' },
  { code: '96', name: 'PAPUA BARAT DAYA' },
];

export const PROVINCES_MAP: Record<string, string> = Object.fromEntries(
  PROVINCES.map((p) => [p.code, p.name])
);

// -----------------------------------------------------------------
// 2. DATA KABUPATEN / KOTA (PPKK)
// -----------------------------------------------------------------
const RAW_REGENCIES = `1101,11,KABUPATEN SIMEULUE
1102,11,KABUPATEN ACEH SINGKIL
1103,11,KABUPATEN ACEH SELATAN
1104,11,KABUPATEN ACEH TENGGARA
1105,11,KABUPATEN ACEH TIMUR
1106,11,KABUPATEN ACEH TENGAH
1107,11,KABUPATEN ACEH BARAT
1108,11,KABUPATEN ACEH BESAR
1109,11,KABUPATEN PIDIE
1110,11,KABUPATEN BIREUEN
1111,11,KABUPATEN ACEH UTARA
1112,11,KABUPATEN ACEH BARAT DAYA
1113,11,KABUPATEN GAYO LUES
1114,11,KABUPATEN ACEH TAMIANG
1115,11,KABUPATEN NAGAN RAYA
1116,11,KABUPATEN ACEH JAYA
1117,11,KABUPATEN BENER MERIAH
1118,11,KABUPATEN PIDIE JAYA
1171,11,KOTA BANDA ACEH
1172,11,KOTA SABANG
1173,11,KOTA LANGSA
1174,11,KOTA LHOKSEUMAWE
1175,11,KOTA SUBULUSSALAM
1201,12,KABUPATEN NIAS
1202,12,KABUPATEN MANDAILING NATAL
1203,12,KABUPATEN TAPANULI SELATAN
1204,12,KABUPATEN TAPANULI TENGAH
1205,12,KABUPATEN TAPANULI UTARA
1206,12,KABUPATEN TOBA SAMOSIR
1207,12,KABUPATEN LABUHAN BATU
1208,12,KABUPATEN ASAHAN
1209,12,KABUPATEN SIMALUNGUN
1210,12,KABUPATEN DAIRI
1211,12,KABUPATEN KARO
1212,12,KABUPATEN DELI SERDANG
1213,12,KABUPATEN LANGKAT
1214,12,KABUPATEN NIAS SELATAN
1215,12,KABUPATEN HUMBANG HASUNDUTAN
1216,12,KABUPATEN PAKPAK BHARAT
1217,12,KABUPATEN SAMOSIR
1218,12,KABUPATEN SERDANG BEDAGAI
1219,12,KABUPATEN BATU BARA
1220,12,KABUPATEN PADANG LAWAS UTARA
1221,12,KABUPATEN PADANG LAWAS
1222,12,KABUPATEN LABUHAN BATU SELATAN
1223,12,KABUPATEN LABUHAN BATU UTARA
1224,12,KABUPATEN NIAS UTARA
1225,12,KABUPATEN NIAS BARAT
1271,12,KOTA SIBOLGA
1272,12,KOTA TANJUNG BALAI
1273,12,KOTA PEMATANG SIANTAR
1274,12,KOTA TEBING TINGGI
1275,12,KOTA MEDAN
1276,12,KOTA BINJAI
1277,12,KOTA PADANGSIDIMPUAN
1278,12,KOTA GUNUNGSITOLI
1301,13,KABUPATEN KEPULAUAN MENTAWAI
1302,13,KABUPATEN PESISIR SELATAN
1303,13,KABUPATEN SOLOK
1304,13,KABUPATEN SIJUNJUNG
1305,13,KABUPATEN TANAH DATAR
1306,13,KABUPATEN PADANG PARIAMAN
1307,13,KABUPATEN AGAM
1308,13,KABUPATEN LIMA PULUH KOTA
1309,13,KABUPATEN PASAMAN
1310,13,KABUPATEN SOLOK SELATAN
1311,13,KABUPATEN DHARMASRAYA
1312,13,KABUPATEN PASAMAN BARAT
1371,13,KOTA PADANG
1372,13,KOTA SOLOK
1373,13,KOTA SAWAH LUNTO
1374,13,KOTA PADANG PANJANG
1375,13,KOTA BUKITTINGGI
1376,13,KOTA PAYAKUMBUH
1377,13,KOTA PARIAMAN
1401,14,KABUPATEN KUANTAN SINGINGI
1402,14,KABUPATEN INDRAGIRI HULU
1403,14,KABUPATEN INDRAGIRI HILIR
1404,14,KABUPATEN PELALAWAN
1405,14,KABUPATEN S I A K
1406,14,KABUPATEN KAMPAR
1407,14,KABUPATEN ROKAN HULU
1408,14,KABUPATEN BENGKALIS
1409,14,KABUPATEN ROKAN HILIR
1410,14,KABUPATEN KEPULAUAN MERANTI
1471,14,KOTA PEKANBARU
1473,14,KOTA D U M A I
1501,15,KABUPATEN KERINCI
1502,15,KABUPATEN MERANGIN
1503,15,KABUPATEN SAROLANGUN
1504,15,KABUPATEN BATANG HARI
1505,15,KABUPATEN MUARO JAMBI
1506,15,KABUPATEN TANJUNG JABUNG TIMUR
1507,15,KABUPATEN TANJUNG JABUNG BARAT
1508,15,KABUPATEN TEBO
1509,15,KABUPATEN BUNGO
1571,15,KOTA JAMBI
1572,15,KOTA SUNGAI PENUH
1601,16,KABUPATEN OGAN KOMERING ULU
1602,16,KABUPATEN OGAN KOMERING ILIR
1603,16,KABUPATEN MUARA ENIM
1604,16,KABUPATEN LAHAT
1605,16,KABUPATEN MUSI RAWAS
1606,16,KABUPATEN MUSI BANYUASIN
1607,16,KABUPATEN BANYU ASIN
1608,16,KABUPATEN OGAN KOMERING ULU SELATAN
1609,16,KABUPATEN OGAN KOMERING ULU TIMUR
1610,16,KABUPATEN OGAN ILIR
1611,16,KABUPATEN EMPAT LAWANG
1612,16,KABUPATEN PENUKAL ABAB LEMATANG ILIR
1613,16,KABUPATEN MUSI RAWAS UTARA
1671,16,KOTA PALEMBANG
1672,16,KOTA PRABUMULIH
1673,16,KOTA PAGAR ALAM
1674,16,KOTA LUBUKLINGGAU
1701,17,KABUPATEN BENGKULU SELATAN
1702,17,KABUPATEN REJANG LEBONG
1703,17,KABUPATEN BENGKULU UTARA
1704,17,KABUPATEN KAUR
1705,17,KABUPATEN SELUMA
1706,17,KABUPATEN MUKOMUKO
1707,17,KABUPATEN LEBONG
1708,17,KABUPATEN KEPAHIANG
1709,17,KABUPATEN BENGKULU TENGAH
1771,17,KOTA BENGKULU
1801,18,KABUPATEN LAMPUNG BARAT
1802,18,KABUPATEN TANGGAMUS
1803,18,KABUPATEN LAMPUNG SELATAN
1804,18,KABUPATEN LAMPUNG TIMUR
1805,18,KABUPATEN LAMPUNG TENGAH
1806,18,KABUPATEN LAMPUNG UTARA
1807,18,KABUPATEN WAY KANAN
1808,18,KABUPATEN TULANGBAWANG
1809,18,KABUPATEN PESAWARAN
1810,18,KABUPATEN PRINGSEWU
1811,18,KABUPATEN MESUJI
1812,18,KABUPATEN TULANG BAWANG BARAT
1813,18,KABUPATEN PESISIR BARAT
1871,18,KOTA BANDAR LAMPUNG
1872,18,KOTA METRO
1901,19,KABUPATEN BANGKA
1902,19,KABUPATEN BELITUNG
1903,19,KABUPATEN BANGKA BARAT
1904,19,KABUPATEN BANGKA TENGAH
1905,19,KABUPATEN BANGKA SELATAN
1906,19,KABUPATEN BELITUNG TIMUR
1971,19,KOTA PANGKAL PINANG
2101,21,KABUPATEN KARIMUN
2102,21,KABUPATEN BINTAN
2103,21,KABUPATEN NATUNA
2104,21,KABUPATEN LINGGA
2105,21,KABUPATEN KEPULAUAN ANAMBAS
2171,21,KOTA B A T A M
2172,21,KOTA TANJUNG PINANG
3101,31,KABUPATEN KEPULAUAN SERIBU
3171,31,KOTA JAKARTA SELATAN
3172,31,KOTA JAKARTA TIMUR
3173,31,KOTA JAKARTA PUSAT
3174,31,KOTA JAKARTA BARAT
3175,31,KOTA JAKARTA UTARA
3201,32,KABUPATEN BOGOR
3202,32,KABUPATEN SUKABUMI
3203,32,KABUPATEN CIANJUR
3204,32,KABUPATEN BANDUNG
3205,32,KABUPATEN GARUT
3206,32,KABUPATEN TASIKMALAYA
3207,32,KABUPATEN CIAMIS
3208,32,KABUPATEN KUNINGAN
3209,32,KABUPATEN CIREBON
3210,32,KABUPATEN MAJALENGKA
3211,32,KABUPATEN SUMEDANG
3212,32,KABUPATEN INDRAMAYU
3213,32,KABUPATEN SUBANG
3214,32,KABUPATEN PURWAKARTA
3215,32,KABUPATEN KARAWANG
3216,32,KABUPATEN BEKASI
3217,32,KABUPATEN BANDUNG BARAT
3218,32,KABUPATEN PANGANDARAN
3271,32,KOTA BOGOR
3272,32,KOTA SUKABUMI
3273,32,KOTA BANDUNG
3274,32,KOTA CIREBON
3275,32,KOTA BEKASI
3276,32,KOTA DEPOK
3277,32,KOTA CIMAHI
3278,32,KOTA TASIKMALAYA
3279,32,KOTA BANJAR
3301,33,KABUPATEN CILACAP
3302,33,KABUPATEN BANYUMAS
3303,33,KABUPATEN PURBALINGGA
3304,33,KABUPATEN BANJARNEGARA
3305,33,KABUPATEN KEBUMEN
3306,33,KABUPATEN PURWOREJO
3307,33,KABUPATEN WONOSOBO
3308,33,KABUPATEN MAGELANG
3309,33,KABUPATEN BOYOLALI
3310,33,KABUPATEN KLATEN
3311,33,KABUPATEN SUKOHARJO
3312,33,KABUPATEN WONOGIRI
3313,33,KABUPATEN KARANGANYAR
3314,33,KABUPATEN SRAGEN
3315,33,KABUPATEN GROBOGAN
3316,33,KABUPATEN BLORA
3317,33,KABUPATEN REMBANG
3318,33,KABUPATEN PATI
3319,33,KABUPATEN KUDUS
3320,33,KABUPATEN JEPARA
3321,33,KABUPATEN DEMAK
3322,33,KABUPATEN SEMARANG
3323,33,KABUPATEN TEMANGGUNG
3324,33,KABUPATEN KENDAL
3325,33,KABUPATEN BATANG
3326,33,KABUPATEN PEKALONGAN
3327,33,KABUPATEN PEMALANG
3328,33,KABUPATEN TEGAL
3329,33,KABUPATEN BREBES
3371,33,KOTA MAGELANG
3372,33,KOTA SURAKARTA
3373,33,KOTA SALATIGA
3374,33,KOTA SEMARANG
3375,33,KOTA PEKALONGAN
3376,33,KOTA TEGAL
3401,34,KABUPATEN KULON PROGO
3402,34,KABUPATEN BANTUL
3403,34,KABUPATEN GUNUNG KIDUL
3404,34,KABUPATEN SLEMAN
3471,34,KOTA YOGYAKARTA
3501,35,KABUPATEN PACITAN
3502,35,KABUPATEN PONOROGO
3503,35,KABUPATEN TRENGGALEK
3504,35,KABUPATEN TULUNGAGUNG
3505,35,KABUPATEN BLITAR
3506,35,KABUPATEN KEDIRI
3507,35,KABUPATEN MALANG
3508,35,KABUPATEN LUMAJANG
3509,35,KABUPATEN JEMBER
3510,35,KABUPATEN BANYUWANGI
3511,35,KABUPATEN BONDOWOSO
3512,35,KABUPATEN SITUBONDO
3513,35,KABUPATEN PROBOLINGGO
3514,35,KABUPATEN PASURUAN
3515,35,KABUPATEN SIDOARJO
3516,35,KABUPATEN MOJOKERTO
3517,35,KABUPATEN JOMBANG
3518,35,KABUPATEN NGANJUK
3519,35,KABUPATEN MADIUN
3520,35,KABUPATEN MAGETAN
3521,35,KABUPATEN NGAWI
3522,35,KABUPATEN BOJONEGORO
3523,35,KABUPATEN TUBAN
3524,35,KABUPATEN LAMONGAN
3525,35,KABUPATEN GRESIK
3526,35,KABUPATEN BANGKALAN
3527,35,KABUPATEN SAMPANG
3528,35,KABUPATEN PAMEKASAN
3529,35,KABUPATEN SUMENEP
3571,35,KOTA KEDIRI
3572,35,KOTA BLITAR
3573,35,KOTA MALANG
3574,35,KOTA PROBOLINGGO
3575,35,KOTA PASURUAN
3576,35,KOTA MOJOKERTO
3577,35,KOTA MADIUN
3578,35,KOTA SURABAYA
3579,35,KOTA BATU
3601,36,KABUPATEN PANDEGLANG
3602,36,KABUPATEN LEBAK
3603,36,KABUPATEN TANGERANG
3604,36,KABUPATEN SERANG
3671,36,KOTA TANGERANG
3672,36,KOTA CILEGON
3673,36,KOTA SERANG
3674,36,KOTA TANGERANG SELATAN
5101,51,KABUPATEN JEMBRANA
5102,51,KABUPATEN TABANAN
5103,51,KABUPATEN BADUNG
5104,51,KABUPATEN GIANYAR
5105,51,KABUPATEN KLUNGKUNG
5106,51,KABUPATEN BANGLI
5107,51,KABUPATEN KARANG ASEM
5108,51,KABUPATEN BULELENG
5171,51,KOTA DENPASAR
5201,52,KABUPATEN LOMBOK BARAT
5202,52,KABUPATEN LOMBOK TENGAH
5203,52,KABUPATEN LOMBOK TIMUR
5204,52,KABUPATEN SUMBAWA
5205,52,KABUPATEN DOMPU
5206,52,KABUPATEN BIMA
5207,52,KABUPATEN SUMBAWA BARAT
5208,52,KABUPATEN LOMBOK UTARA
5271,52,KOTA MATARAM
5272,52,KOTA BIMA
5301,53,KABUPATEN SUMBA BARAT
5302,53,KABUPATEN SUMBA TIMUR
5303,53,KABUPATEN KUPANG
5304,53,KABUPATEN TIMOR TENGAH SELATAN
5305,53,KABUPATEN TIMOR TENGAH UTARA
5306,53,KABUPATEN BELU
5307,53,KABUPATEN ALOR
5308,53,KABUPATEN LEMBATA
5309,53,KABUPATEN FLORES TIMUR
5310,53,KABUPATEN SIKKA
5311,53,KABUPATEN ENDE
5312,53,KABUPATEN NGADA
5313,53,KABUPATEN MANGGARAI
5314,53,KABUPATEN ROTE NDAO
5315,53,KABUPATEN MANGGARAI BARAT
5316,53,KABUPATEN SUMBA TENGAH
5317,53,KABUPATEN SUMBA BARAT DAYA
5318,53,KABUPATEN NAGEKEO
5319,53,KABUPATEN MANGGARAI TIMUR
5320,53,KABUPATEN SABU RAIJUA
5321,53,KABUPATEN MALAKA
5371,53,KOTA KUPANG
6101,61,KABUPATEN SAMBAS
6102,61,KABUPATEN BENGKAYANG
6103,61,KABUPATEN LANDAK
6104,61,KABUPATEN MEMPAWAH
6105,61,KABUPATEN SANGGAU
6106,61,KABUPATEN KETAPANG
6107,61,KABUPATEN SINTANG
6108,61,KABUPATEN KAPUAS HULU
6109,61,KABUPATEN SEKADAU
6110,61,KABUPATEN MELAWI
6111,61,KABUPATEN KAYONG UTARA
6112,61,KABUPATEN KUBU RAYA
6171,61,KOTA PONTIANAK
6172,61,KOTA SINGKAWANG
6201,62,KABUPATEN KOTAWARINGIN BARAT
6202,62,KABUPATEN KOTAWARINGIN TIMUR
6203,62,KABUPATEN KAPUAS
6204,62,KABUPATEN BARITO SELATAN
6205,62,KABUPATEN BARITO UTARA
6206,62,KABUPATEN SUKAMARA
6207,62,KABUPATEN LAMANDAU
6208,62,KABUPATEN SERUYAN
6209,62,KABUPATEN KATINGAN
6210,62,KABUPATEN PULANG PISAU
6211,62,KABUPATEN GUNUNG MAS
6212,62,KABUPATEN BARITO TIMUR
6213,62,KABUPATEN MURUNG RAYA
6271,62,KOTA PALANGKA RAYA
6301,63,KABUPATEN TANAH LAUT
6302,63,KABUPATEN KOTA BARU
6303,63,KABUPATEN BANJAR
6304,63,KABUPATEN BARITO KUALA
6305,63,KABUPATEN TAPIN
6306,63,KABUPATEN HULU SUNGAI SELATAN
6307,63,KABUPATEN HULU SUNGAI TENGAH
6308,63,KABUPATEN HULU SUNGAI UTARA
6309,63,KABUPATEN TABALONG
6310,63,KABUPATEN TANAH BUMBU
6311,63,KABUPATEN BALANGAN
6371,63,KOTA BANJARMASIN
6372,63,KOTA BANJAR BARU
6401,64,KABUPATEN PASER
6402,64,KABUPATEN KUTAI BARAT
6403,64,KABUPATEN KUTAI KARTANEGARA
6404,64,KABUPATEN KUTAI TIMUR
6405,64,KABUPATEN BERAU
6409,64,KABUPATEN PENAJAM PASER UTARA
6411,64,KABUPATEN MAHAKAM HULU
6471,64,KOTA BALIKPAPAN
6472,64,KOTA SAMARINDA
6474,64,KOTA BONTANG
6501,65,KABUPATEN MALINAU
6502,65,KABUPATEN BULUNGAN
6503,65,KABUPATEN TANA TIDUNG
6504,65,KABUPATEN NUNUKAN
6571,65,KOTA TARAKAN
7101,71,KABUPATEN BOLAANG MONGONDOW
7102,71,KABUPATEN MINAHASA
7103,71,KABUPATEN KEPULAUAN SANGIHE
7104,71,KABUPATEN KEPULAUAN TALAUD
7105,71,KABUPATEN MINAHASA SELATAN
7106,71,KABUPATEN MINAHASA UTARA
7107,71,KABUPATEN BOLAANG MONGONDOW UTARA
7108,71,KABUPATEN SIAU TAGULANDANG BIARO
7109,71,KABUPATEN MINAHASA TENGGARA
7110,71,KABUPATEN BOLAANG MONGONDOW SELATAN
7111,71,KABUPATEN BOLAANG MONGONDOW TIMUR
7171,71,KOTA MANADO
7172,71,KOTA BITUNG
7173,71,KOTA TOMOHON
7174,71,KOTA KOTAMOBAGU
7201,72,KABUPATEN BANGGAI KEPULAUAN
7202,72,KABUPATEN BANGGAI
7203,72,KABUPATEN MOROWALI
7204,72,KABUPATEN POSO
7205,72,KABUPATEN DONGGALA
7206,72,KABUPATEN TOLI-TOLI
7207,72,KABUPATEN BUOL
7208,72,KABUPATEN PARIGI MOUTONG
7209,72,KABUPATEN TOJO UNA-UNA
7210,72,KABUPATEN SIGI
7211,72,KABUPATEN BANGGAI LAUT
7212,72,KABUPATEN MOROWALI UTARA
7271,72,KOTA PALU
7301,73,KABUPATEN KEPULAUAN SELAYAR
7302,73,KABUPATEN BULUKUMBA
7303,73,KABUPATEN BANTAENG
7304,73,KABUPATEN JENEPONTO
7305,73,KABUPATEN TAKALAR
7306,73,KABUPATEN GOWA
7307,73,KABUPATEN SINJAI
7308,73,KABUPATEN MAROS
7309,73,KABUPATEN PANGKAJENE DAN KEPULAUAN
7310,73,KABUPATEN BARRU
7311,73,KABUPATEN BONE
7312,73,KABUPATEN SOPPENG
7313,73,KABUPATEN WAJO
7314,73,KABUPATEN SIDENRENG RAPPANG
7315,73,KABUPATEN PINRANG
7316,73,KABUPATEN ENREKANG
7317,73,KABUPATEN LUWU
7318,73,KABUPATEN TANA TORAJA
7322,73,KABUPATEN LUWU UTARA
7325,73,KABUPATEN LUWU TIMUR
7326,73,KABUPATEN TORAJA UTARA
7371,73,KOTA MAKASSAR
7372,73,KOTA PAREPARE
7373,73,KOTA PALOPO
7401,74,KABUPATEN BUTON
7402,74,KABUPATEN MUNA
7403,74,KABUPATEN KONAWE
7404,74,KABUPATEN KOLAKA
7405,74,KABUPATEN KONAWE SELATAN
7406,74,KABUPATEN BOMBANA
7407,74,KABUPATEN WAKATOBI
7408,74,KABUPATEN KOLAKA UTARA
7409,74,KABUPATEN BUTON UTARA
7410,74,KABUPATEN KONAWE UTARA
7411,74,KABUPATEN KOLAKA TIMUR
7412,74,KABUPATEN KONAWE KEPULAUAN
7413,74,KABUPATEN MUNA BARAT
7414,74,KABUPATEN BUTON TENGAH
7415,74,KABUPATEN BUTON SELATAN
7471,74,KOTA KENDARI
7472,74,KOTA BAUBAU
7501,75,KABUPATEN BOALEMO
7502,75,KABUPATEN GORONTALO
7503,75,KABUPATEN POHUWATO
7504,75,KABUPATEN BONE BOLANGO
7505,75,KABUPATEN GORONTALO UTARA
7571,75,KOTA GORONTALO
7601,76,KABUPATEN MAJENE
7602,76,KABUPATEN POLEWALI MANDAR
7603,76,KABUPATEN MAMASA
7604,76,KABUPATEN MAMUJU
7605,76,KABUPATEN MAMUJU UTARA
7606,76,KABUPATEN MAMUJU TENGAH
8101,81,KABUPATEN MALUKU TENGGARA BARAT
8102,81,KABUPATEN MALUKU TENGGARA
8103,81,KABUPATEN MALUKU TENGAH
8104,81,KABUPATEN BURU
8105,81,KABUPATEN KEPULAUAN ARU
8106,81,KABUPATEN SERAM BAGIAN BARAT
8107,81,KABUPATEN SERAM BAGIAN TIMUR
8108,81,KABUPATEN MALUKU BARAT DAYA
8109,81,KABUPATEN BURU SELATAN
8171,81,KOTA AMBON
8172,81,KOTA TUAL
8201,82,KABUPATEN HALMAHERA BARAT
8202,82,KABUPATEN HALMAHERA TENGAH
8203,82,KABUPATEN KEPULAUAN SULA
8204,82,KABUPATEN HALMAHERA SELATAN
8205,82,KABUPATEN HALMAHERA UTARA
8206,82,KABUPATEN HALMAHERA TIMUR
8207,82,KABUPATEN PULAU MOROTAI
8208,82,KABUPATEN PULAU TALIABU
8271,82,KOTA TERNATE
8272,82,KOTA TIDORE KEPULAUAN
9101,91,KABUPATEN FAKFAK
9102,91,KABUPATEN KAIMANA
9103,91,KABUPATEN TELUK WONDAMA
9104,91,KABUPATEN TELUK BINTUNI
9105,91,KABUPATEN MANOKWARI
9111,91,KABUPATEN MANOKWARI SELATAN
9112,91,KABUPATEN PEGUNUNGAN ARFAK
9201,92,KABUPATEN NABIRE
9202,92,KABUPATEN PUNCAK JAYA
9203,92,KABUPATEN PANIAI
9204,92,KABUPATEN MIMIKA
9205,92,KABUPATEN PUNCAK
9206,92,KABUPATEN DOGIYAI
9207,92,KABUPATEN INTAN JAYA
9208,92,KABUPATEN DEIYAI
9301,93,KABUPATEN MERAUKE
9302,93,KABUPATEN BOVEN DIGOEL
9303,93,KABUPATEN MAPPI
9304,93,KABUPATEN ASMAT
9401,94,KABUPATEN JAYAPURA
9402,94,KABUPATEN KEPULAUAN YAPEN
9403,94,KABUPATEN BIAK NUMFOR
9404,94,KABUPATEN SARMI
9405,94,KABUPATEN KEEROM
9406,94,KABUPATEN WAROPEN
9407,94,KABUPATEN SUPIORI
9408,94,KABUPATEN MAMBERAMO RAYA
9471,94,KOTA JAYAPURA
9501,95,KABUPATEN JAYAWIJAYA
9502,95,KABUPATEN PEGUNUNGAN BINTANG
9503,95,KABUPATEN YAHUKIMO
9504,95,KABUPATEN TOLIKARA
9505,95,KABUPATEN MAMBERAMO TENGAH
9506,95,KABUPATEN YALIMO
9507,95,KABUPATEN LANNY JAYA
9508,95,KABUPATEN NDUGA
9601,96,KABUPATEN SORONG
9602,96,KABUPATEN SORONG SELATAN
9603,96,KABUPATEN RAJA AMPAT
9604,96,KABUPATEN TAMBRAUW
9605,96,KABUPATEN MAYBRAT
9671,96,KOTA SORONG`;

export const REGENCIES: RegencyItem[] = RAW_REGENCIES.split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [code, provinceCode, name] = line.split(',');
    return { code, provinceCode, name };
  });

export const REGENCIES_MAP: Record<string, RegencyItem> = Object.fromEntries(
  REGENCIES.map((r) => [r.code, r])
);

// -----------------------------------------------------------------
// 3. DATA KECAMATAN RESMI DARI CSV BPS
// -----------------------------------------------------------------
export const SAMPLE_DISTRICTS: DistrictItem[] = [
  // Jawa Barat - Kabupaten Bogor (3201)
  { code: '3201010', regencyCode: '3201', districtCode3: '010', name: 'NANGGUNG' },
  { code: '3201020', regencyCode: '3201', districtCode3: '020', name: 'LEUWILIANG' },
  { code: '3201021', regencyCode: '3201', districtCode3: '021', name: 'LEUWISADENG' },
  { code: '3201030', regencyCode: '3201', districtCode3: '030', name: 'PAMIJAHAN' },
  { code: '3201040', regencyCode: '3201', districtCode3: '040', name: 'CIBUNGBULANG' },
  { code: '3201050', regencyCode: '3201', districtCode3: '050', name: 'CIAMPEA' },
  { code: '3201051', regencyCode: '3201', districtCode3: '051', name: 'TENJOLAYA' },
  { code: '3201060', regencyCode: '3201', districtCode3: '060', name: 'DRAMAGA' },
  { code: '3201070', regencyCode: '3201', districtCode3: '070', name: 'CIOMAS' },
  { code: '3201071', regencyCode: '3201', districtCode3: '071', name: 'TAMANSARI' },
  { code: '3201080', regencyCode: '3201', districtCode3: '080', name: 'CIJERUK' },
  { code: '3201081', regencyCode: '3201', districtCode3: '081', name: 'CIGOMBONG' },
  { code: '3201090', regencyCode: '3201', districtCode3: '090', name: 'CARINGIN' },
  { code: '3201100', regencyCode: '3201', districtCode3: '100', name: 'CIAWI' },
  { code: '3201110', regencyCode: '3201', districtCode3: '110', name: 'CISARUA' },
  { code: '3201120', regencyCode: '3201', districtCode3: '120', name: 'MEGAMENDUNG' },
  { code: '3201130', regencyCode: '3201', districtCode3: '130', name: 'SUKARAJA' },
  { code: '3201140', regencyCode: '3201', districtCode3: '140', name: 'BABAKAN MADANG' },
  { code: '3201150', regencyCode: '3201', districtCode3: '150', name: 'JONGGOL' },
  { code: '3201160', regencyCode: '3201', districtCode3: '160', name: 'CILEUNGSI' },
  { code: '3201170', regencyCode: '3201', districtCode3: '170', name: 'GUNUNG PUTRI' },
  { code: '3201180', regencyCode: '3201', districtCode3: '180', name: 'CITEUREUP' },
  { code: '3201190', regencyCode: '3201', districtCode3: '190', name: 'KLAPANUNGGAL' },
  { code: '3201200', regencyCode: '3201', districtCode3: '200', name: 'BOJONG GEDE' },
  { code: '3201210', regencyCode: '3201', districtCode3: '210', name: 'CIBINONG' },
  { code: '3201220', regencyCode: '3201', districtCode3: '220', name: 'PARUNG' },
  { code: '3201230', regencyCode: '3201', districtCode3: '230', name: 'GUNUNG SINDUR' },
  { code: '3201240', regencyCode: '3201', districtCode3: '240', name: 'KEMANG' },
  { code: '3201250', regencyCode: '3201', districtCode3: '250', name: 'RANCA BUNGUR' },
  { code: '3201260', regencyCode: '3201', districtCode3: '260', name: 'PARUNG PANJANG' },
  { code: '3201270', regencyCode: '3201', districtCode3: '270', name: 'JASINGA' },
  { code: '3201280', regencyCode: '3201', districtCode3: '280', name: 'CIGUDEG' },
  { code: '3201290', regencyCode: '3201', districtCode3: '290', name: 'SUKAJAYA' },
  { code: '3201300', regencyCode: '3201', districtCode3: '300', name: 'TENJO' },
  { code: '3201310', regencyCode: '3201', districtCode3: '310', name: 'RUMPIN' },
  { code: '3201320', regencyCode: '3201', districtCode3: '320', name: 'CARIU' },
  { code: '3201330', regencyCode: '3201', districtCode3: '330', name: 'TANJUNGSARI' },
  { code: '3201340', regencyCode: '3201', districtCode3: '340', name: 'SUKAMAKMUR' },
  { code: '3201350', regencyCode: '3201', districtCode3: '350', name: 'TAJURHALANG' },
  { code: '3201360', regencyCode: '3201', districtCode3: '360', name: 'CISEENG' },

  // Jawa Barat - Kabupaten Sukabumi (3202)
  { code: '3202010', regencyCode: '3202', districtCode3: '010', name: 'PELABUHANRATU' },
  { code: '3202020', regencyCode: '3202', districtCode3: '020', name: 'SIMPENAN' },
  { code: '3202030', regencyCode: '3202', districtCode3: '030', name: 'CIKAKAK' },
  { code: '3202040', regencyCode: '3202', districtCode3: '040', name: 'BANTARGADUNG' },
  { code: '3202050', regencyCode: '3202', districtCode3: '050', name: 'CISOLOK' },
  { code: '3202060', regencyCode: '3202', districtCode3: '060', name: 'CIKIDANG' },
  { code: '3202070', regencyCode: '3202', districtCode3: '070', name: 'LENGKONG' },
  { code: '3202080', regencyCode: '3202', districtCode3: '080', name: 'JAMPANG TENGAH' },
  { code: '3202090', regencyCode: '3202', districtCode3: '090', name: 'WARUNGKIARA' },
  { code: '3202100', regencyCode: '3202', districtCode3: '100', name: 'CIKEMBAR' },
  { code: '3202110', regencyCode: '3202', districtCode3: '110', name: 'CIBADAK' },
  { code: '3202120', regencyCode: '3202', districtCode3: '120', name: 'NAGRAK' },
  { code: '3202130', regencyCode: '3202', districtCode3: '130', name: 'PARUNGKUDA' },
  { code: '3202140', regencyCode: '3202', districtCode3: '140', name: 'BOJONGGENTENG' },
  { code: '3202150', regencyCode: '3202', districtCode3: '150', name: 'PARAKANSALAK' },
  { code: '3202160', regencyCode: '3202', districtCode3: '160', name: 'CICURUG' },
  { code: '3202170', regencyCode: '3202', districtCode3: '170', name: 'CIDAHU' },
  { code: '3202180', regencyCode: '3202', districtCode3: '180', name: 'KALAPANUNGGAL' },
  { code: '3202190', regencyCode: '3202', districtCode3: '190', name: 'KABANDUNGAN' },
  { code: '3202200', regencyCode: '3202', districtCode3: '200', name: 'WALURAN' },
  { code: '3202210', regencyCode: '3202', districtCode3: '210', name: 'JAMPANG KULON' },
  { code: '3202220', regencyCode: '3202', districtCode3: '220', name: 'CIEMAS' },
  { code: '3202230', regencyCode: '3202', districtCode3: '230', name: 'KALIBUNDER' },
  { code: '3202240', regencyCode: '3202', districtCode3: '240', name: 'SURADE' },
  { code: '3202250', regencyCode: '3202', districtCode3: '250', name: 'CIBITUNG' },
  { code: '3202260', regencyCode: '3202', districtCode3: '260', name: 'CIRACAP' },
  { code: '3202270', regencyCode: '3202', districtCode3: '270', name: 'GUNUNG GURUH' },
  { code: '3202280', regencyCode: '3202', districtCode3: '280', name: 'CICANTAYAN' },
  { code: '3202290', regencyCode: '3202', districtCode3: '290', name: 'CISAAT' },
  { code: '3202300', regencyCode: '3202', districtCode3: '300', name: 'KADUDAMPIT' },
  { code: '3202310', regencyCode: '3202', districtCode3: '310', name: 'SUKABUMI' },
  { code: '3202320', regencyCode: '3202', districtCode3: '320', name: 'SUKARAJA' },
  { code: '3202330', regencyCode: '3202', districtCode3: '330', name: 'KEBONPEDES' },
  { code: '3202340', regencyCode: '3202', districtCode3: '340', name: 'CIREUNGHAS' },
  { code: '3202350', regencyCode: '3202', districtCode3: '350', name: 'SUKALARANG' },
  { code: '3202360', regencyCode: '3202', districtCode3: '360', name: 'PABUARAN' },
  { code: '3202370', regencyCode: '3202', districtCode3: '370', name: 'PURABAYA' },
  { code: '3202380', regencyCode: '3202', districtCode3: '380', name: 'NYALINDUNG' },
  { code: '3202390', regencyCode: '3202', districtCode3: '390', name: 'GEGERBITUNG' },
  { code: '3202400', regencyCode: '3202', districtCode3: '400', name: 'SAGARANTEN' },
  { code: '3202410', regencyCode: '3202', districtCode3: '410', name: 'CURUGKEMBAR' },
  { code: '3202420', regencyCode: '3202', districtCode3: '420', name: 'CIDOLOG' },
  { code: '3202430', regencyCode: '3202', districtCode3: '430', name: 'CIDADAP' },
  { code: '3202440', regencyCode: '3202', districtCode3: '440', name: 'TEGAL BULEUD' },
  { code: '3202450', regencyCode: '3202', districtCode3: '450', name: 'CIAMBAR' },

  // Jawa Barat - Kabupaten Cianjur (3203)
  { code: '3203010', regencyCode: '3203', districtCode3: '010', name: 'AGRABINTA' },
  { code: '3203020', regencyCode: '3203', districtCode3: '020', name: 'SINDANGBARANG' },
  { code: '3203030', regencyCode: '3203', districtCode3: '030', name: 'CIDAUN' },
  { code: '3203040', regencyCode: '3203', districtCode3: '040', name: 'NARINGGUL' },
  { code: '3203050', regencyCode: '3203', districtCode3: '050', name: 'CIBINONG' },
  { code: '3203060', regencyCode: '3203', districtCode3: '060', name: 'CIKADU' },
  { code: '3203070', regencyCode: '3203', districtCode3: '070', name: 'TANGGEUNG' },
  { code: '3203080', regencyCode: '3203', districtCode3: '080', name: 'PASIRKUDA' },
  { code: '3203090', regencyCode: '3203', districtCode3: '090', name: 'KADUPANDAK' },
  { code: '3203100', regencyCode: '3203', districtCode3: '100', name: 'CIJATI' },
  { code: '3203110', regencyCode: '3203', districtCode3: '110', name: 'TAKOKAK' },
  { code: '3203120', regencyCode: '3203', districtCode3: '120', name: 'SUKANAGARA' },
  { code: '3203130', regencyCode: '3203', districtCode3: '130', name: 'CAMPAKA' },
  { code: '3203140', regencyCode: '3203', districtCode3: '140', name: 'CAMPAKA MULYA' },
  { code: '3203150', regencyCode: '3203', districtCode3: '150', name: 'PAGELARAN' },
  { code: '3203160', regencyCode: '3203', districtCode3: '160', name: 'LELES' },
  { code: '3203170', regencyCode: '3203', districtCode3: '170', name: 'WARUNGKONDANG' },
  { code: '3203180', regencyCode: '3203', districtCode3: '180', name: 'GEKBRONG' },
  { code: '3203190', regencyCode: '3203', districtCode3: '190', name: 'CILAKU' },
  { code: '3203200', regencyCode: '3203', districtCode3: '200', name: 'CIANJUR' },
  { code: '3203210', regencyCode: '3203', districtCode3: '210', name: 'KARANGTENGAH' },
  { code: '3203220', regencyCode: '3203', districtCode3: '220', name: 'MANDE' },
  { code: '3203230', regencyCode: '3203', districtCode3: '230', name: 'SUKALUYU' },
  { code: '3203240', regencyCode: '3203', districtCode3: '240', name: 'CIRANJANG' },
  { code: '3203250', regencyCode: '3203', districtCode3: '250', name: 'BOJONGPICUNG' },
  { code: '3203260', regencyCode: '3203', districtCode3: '260', name: 'HAURWANGI' },
  { code: '3203270', regencyCode: '3203', districtCode3: '270', name: 'SUKARESMI' },
  { code: '3203280', regencyCode: '3203', districtCode3: '280', name: 'CIKALONGKULON' },
  { code: '3203290', regencyCode: '3203', districtCode3: '290', name: 'PACET' },
  { code: '3203300', regencyCode: '3203', districtCode3: '300', name: 'CIPANAS' },
  { code: '3203310', regencyCode: '3203', districtCode3: '310', name: 'CUGENANG' },

  // Jawa Barat - Kabupaten Bandung (3204)
  { code: '3204010', regencyCode: '3204', districtCode3: '010', name: 'CIWIDEY' },
  { code: '3204020', regencyCode: '3204', districtCode3: '020', name: 'RANCABALI' },
  { code: '3204030', regencyCode: '3204', districtCode3: '030', name: 'PASIRJAMBU' },
  { code: '3204031', regencyCode: '3204', districtCode3: '031', name: 'CIMAUNG' },
  { code: '3204040', regencyCode: '3204', districtCode3: '040', name: 'PANGALENGAN' },
  { code: '3204050', regencyCode: '3204', districtCode3: '050', name: 'KERTASARI' },
  { code: '3204060', regencyCode: '3204', districtCode3: '060', name: 'PACET' },
  { code: '3204070', regencyCode: '3204', districtCode3: '070', name: 'CIPARAY' },
  { code: '3204080', regencyCode: '3204', districtCode3: '080', name: 'BALEENDAH' },
  { code: '3204090', regencyCode: '3204', districtCode3: '090', name: 'ARJASARI' },
  { code: '3204100', regencyCode: '3204', districtCode3: '100', name: 'BANJARAN' },
  { code: '3204101', regencyCode: '3204', districtCode3: '101', name: 'CANGKUANG' },
  { code: '3204110', regencyCode: '3204', districtCode3: '110', name: 'PAMEUNGPEUK' },
  { code: '3204120', regencyCode: '3204', districtCode3: '120', name: 'KATAPANG' },
  { code: '3204130', regencyCode: '3204', districtCode3: '130', name: 'SOREANG' },
  { code: '3204131', regencyCode: '3204', districtCode3: '131', name: 'KUTAWARINGIN' },
  { code: '3204140', regencyCode: '3204', districtCode3: '140', name: 'MARGAASIH' },
  { code: '3204150', regencyCode: '3204', districtCode3: '150', name: 'MARGAHAYU' },
  { code: '3204160', regencyCode: '3204', districtCode3: '160', name: 'DAYEUHKOLOT' },
  { code: '3204170', regencyCode: '3204', districtCode3: '170', name: 'BOJONGSOANG' },
  { code: '3204180', regencyCode: '3204', districtCode3: '180', name: 'RANCAEKEK' },
  { code: '3204190', regencyCode: '3204', districtCode3: '190', name: 'CICALENGKA' },
  { code: '3204200', regencyCode: '3204', districtCode3: '200', name: 'NAGREG' },
  { code: '3204210', regencyCode: '3204', districtCode3: '210', name: 'CIKANCUNG' },
  { code: '3204220', regencyCode: '3204', districtCode3: '220', name: 'PASEH' },
  { code: '3204230', regencyCode: '3204', districtCode3: '230', name: 'IBUN' },
  { code: '3204240', regencyCode: '3204', districtCode3: '240', name: 'SOLOKAN JERUK' },
  { code: '3204250', regencyCode: '3204', districtCode3: '250', name: 'MAJALAYA' },
  { code: '3204260', regencyCode: '3204', districtCode3: '260', name: 'CILEUNYI' },
  { code: '3204270', regencyCode: '3204', districtCode3: '270', name: 'CIMENYAN' },
  { code: '3204280', regencyCode: '3204', districtCode3: '280', name: 'CILENGKRANG' },

  // Jawa Barat - Kabupaten Garut (3205)
  { code: '3205010', regencyCode: '3205', districtCode3: '010', name: 'GARUT KOTA' },
  { code: '3205020', regencyCode: '3205', districtCode3: '020', name: 'KARANGPAWITAN' },
  { code: '3205030', regencyCode: '3205', districtCode3: '030', name: 'WANARAJA' },
  { code: '3205031', regencyCode: '3205', districtCode3: '031', name: 'PANGATIKAN' },
  { code: '3205032', regencyCode: '3205', districtCode3: '032', name: 'SUCINARAJA' },
  { code: '3205040', regencyCode: '3205', districtCode3: '040', name: 'TAROGONG KALER' },
  { code: '3205050', regencyCode: '3205', districtCode3: '050', name: 'TAROGONG KIDUL' },
  { code: '3205060', regencyCode: '3205', districtCode3: '060', name: 'BANYURESMI' },
  { code: '3205070', regencyCode: '3205', districtCode3: '070', name: 'SAMARANG' },
  { code: '3205080', regencyCode: '3205', districtCode3: '080', name: 'PASIRWANGI' },
  { code: '3205090', regencyCode: '3205', districtCode3: '090', name: 'LELES' },
  { code: '3205100', regencyCode: '3205', districtCode3: '100', name: 'KADUNGORA' },
  { code: '3205110', regencyCode: '3205', districtCode3: '110', name: 'LEUWIGOONG' },
  { code: '3205120', regencyCode: '3205', districtCode3: '120', name: 'CIBATU' },
  { code: '3205130', regencyCode: '3205', districtCode3: '130', name: 'KERSAMANAH' },
  { code: '3205140', regencyCode: '3205', districtCode3: '140', name: 'MALANGBONG' },
  { code: '3205150', regencyCode: '3205', districtCode3: '150', name: 'SUKAWENING' },
  { code: '3205160', regencyCode: '3205', districtCode3: '160', name: 'KARANGTENGAH' },
  { code: '3205170', regencyCode: '3205', districtCode3: '170', name: 'BAYONGBONG' },
  { code: '3205180', regencyCode: '3205', districtCode3: '180', name: 'CIGEDUG' },
  { code: '3205190', regencyCode: '3205', districtCode3: '190', name: 'CILAWU' },
  { code: '3205200', regencyCode: '3205', districtCode3: '200', name: 'CISURUPAN' },
  { code: '3205210', regencyCode: '3205', districtCode3: '210', name: 'SUKARESMI' },
  { code: '3205220', regencyCode: '3205', districtCode3: '220', name: 'CIKAJANG' },
  { code: '3205230', regencyCode: '3205', districtCode3: '230', name: 'BANJARWANGI' },
  { code: '3205240', regencyCode: '3205', districtCode3: '240', name: 'SINGAJAYA' },
  { code: '3205250', regencyCode: '3205', districtCode3: '250', name: 'CIHURIP' },
  { code: '3205260', regencyCode: '3205', districtCode3: '260', name: 'PEUNDEUY' },
  { code: '3205270', regencyCode: '3205', districtCode3: '270', name: 'PAKENJENG' },
  { code: '3205280', regencyCode: '3205', districtCode3: '280', name: 'PAMULIHAN' },
  { code: '3205290', regencyCode: '3205', districtCode3: '290', name: 'CISEWU' },
  { code: '3205300', regencyCode: '3205', districtCode3: '300', name: 'CARINGIN' },
  { code: '3205310', regencyCode: '3205', districtCode3: '310', name: 'TALEGONG' },
  { code: '3205320', regencyCode: '3205', districtCode3: '320', name: 'BUNGBULANG' },
  { code: '3205330', regencyCode: '3205', districtCode3: '330', name: 'MEKARMUKTI' },
  { code: '3205340', regencyCode: '3205', districtCode3: '340', name: 'PAMEUNGPEUK' },
  { code: '3205350', regencyCode: '3205', districtCode3: '350', name: 'CIKELET' },
  { code: '3205360', regencyCode: '3205', districtCode3: '360', name: 'CIBALONG' },

  // Jawa Barat - Kabupaten Tasikmalaya (3206)
  { code: '3206010', regencyCode: '3206', districtCode3: '010', name: 'SINGAPARNA' },
  { code: '3206020', regencyCode: '3206', districtCode3: '020', name: 'SUKARAME' },
  { code: '3206030', regencyCode: '3206', districtCode3: '030', name: 'MANGUNREJA' },
  { code: '3206040', regencyCode: '3206', districtCode3: '040', name: 'CIGALONTANG' },
  { code: '3206050', regencyCode: '3206', districtCode3: '050', name: 'LEUWISARI' },
  { code: '3206060', regencyCode: '3206', districtCode3: '060', name: 'PADAKEMBANG' },
  { code: '3206070', regencyCode: '3206', districtCode3: '070', name: 'SARIWANGI' },
  { code: '3206080', regencyCode: '3206', districtCode3: '080', name: 'SUKARATU' },
  { code: '3206090', regencyCode: '3206', districtCode3: '090', name: 'CISAYONG' },
  { code: '3206100', regencyCode: '3206', districtCode3: '100', name: 'SUKAHENING' },
  { code: '3206110', regencyCode: '3206', districtCode3: '110', name: 'RAJAPOLAH' },
  { code: '3206120', regencyCode: '3206', districtCode3: '120', name: 'JAMANIS' },
  { code: '3206130', regencyCode: '3206', districtCode3: '130', name: 'CIAWI' },
  { code: '3206140', regencyCode: '3206', districtCode3: '140', name: 'KADIPATEN' },
  { code: '3206150', regencyCode: '3206', districtCode3: '150', name: 'PAGERAGEUNG' },
  { code: '3206160', regencyCode: '3206', districtCode3: '160', name: 'SUKARESIK' },
  { code: '3206170', regencyCode: '3206', districtCode3: '170', name: 'SALAWU' },
  { code: '3206180', regencyCode: '3206', districtCode3: '180', name: 'PUSPAHIANG' },
  { code: '3206190', regencyCode: '3206', districtCode3: '190', name: 'TARAJU' },
  { code: '3206200', regencyCode: '3206', districtCode3: '200', name: 'SODONGHILIR' },
  { code: '3206210', regencyCode: '3206', districtCode3: '210', name: 'BOJONGGAMBIR' },
  { code: '3206220', regencyCode: '3206', districtCode3: '220', name: 'CULAMEGA' },
  { code: '3206230', regencyCode: '3206', districtCode3: '230', name: 'BANTARKALONG' },
  { code: '3206240', regencyCode: '3206', districtCode3: '240', name: 'BOJONGASIH' },
  { code: '3206250', regencyCode: '3206', districtCode3: '250', name: 'CIPATUJAH' },
  { code: '3206260', regencyCode: '3206', districtCode3: '260', name: 'KARANGNUNGGAL' },
  { code: '3206270', regencyCode: '3206', districtCode3: '270', name: 'CIKALONG' },
  { code: '3206280', regencyCode: '3206', districtCode3: '280', name: 'PANCATENGAH' },
  { code: '3206290', regencyCode: '3206', districtCode3: '290', name: 'CIKATOMAS' },

  // Jawa Barat - Kabupaten Ciamis (3207)
  { code: '3207010', regencyCode: '3207', districtCode3: '010', name: 'CIAMIS' },
  { code: '3207020', regencyCode: '3207', districtCode3: '020', name: 'CIKONENG' },
  { code: '3207030', regencyCode: '3207', districtCode3: '030', name: 'SINDANGKASIH' },
  { code: '3207040', regencyCode: '3207', districtCode3: '040', name: 'CIHAURBEUTI' },
  { code: '3207050', regencyCode: '3207', districtCode3: '050', name: 'SADANANYA' },
  { code: '3207060', regencyCode: '3207', districtCode3: '060', name: 'BAREGBEG' },
  { code: '3207070', regencyCode: '3207', districtCode3: '070', name: 'SUKAMANTRI' },
  { code: '3207080', regencyCode: '3207', districtCode3: '080', name: 'PANUMBANGAN' },
  { code: '3207090', regencyCode: '3207', districtCode3: '090', name: 'PANJALU' },
  { code: '3207100', regencyCode: '3207', districtCode3: '100', name: 'KAWALI' },
  { code: '3207110', regencyCode: '3207', districtCode3: '110', name: 'PANAWANGAN' },
  { code: '3207120', regencyCode: '3207', districtCode3: '120', name: 'CIPAKU' },
  { code: '3207130', regencyCode: '3207', districtCode3: '130', name: 'JATINAGARA' },
  { code: '3207140', regencyCode: '3207', districtCode3: '140', name: 'RAJADESA' },
  { code: '3207150', regencyCode: '3207', districtCode3: '150', name: 'RANCAH' },
  { code: '3207160', regencyCode: '3207', districtCode3: '160', name: 'TAMBAKSARI' },
  { code: '3207170', regencyCode: '3207', districtCode3: '170', name: 'CISAGA' },
  { code: '3207180', regencyCode: '3207', districtCode3: '180', name: 'SUKADANA' },
  { code: '3207190', regencyCode: '3207', districtCode3: '190', name: 'CIDOLOG' },
  { code: '3207200', regencyCode: '3207', districtCode3: '200', name: 'CIMARAGAS' },
  { code: '3207210', regencyCode: '3207', districtCode3: '210', name: 'PAMARICAN' },
  { code: '3207220', regencyCode: '3207', districtCode3: '220', name: 'BANJARSARI' },

  // Jawa Barat - Kabupaten Kuningan (3208)
  { code: '3208010', regencyCode: '3208', districtCode3: '010', name: 'KUNINGAN' },
  { code: '3208020', regencyCode: '3208', districtCode3: '020', name: 'CIGUGUR' },
  { code: '3208030', regencyCode: '3208', districtCode3: '030', name: 'KRAMATMULYA' },
  { code: '3208040', regencyCode: '3208', districtCode3: '040', name: 'JALAKSANA' },
  { code: '3208050', regencyCode: '3208', districtCode3: '050', name: 'CILIMUS' },
  { code: '3208060', regencyCode: '3208', districtCode3: '060', name: 'MANDIRANCAN' },
  { code: '3208070', regencyCode: '3208', districtCode3: '070', name: 'PASAWAHAN' },
  { code: '3208080', regencyCode: '3208', districtCode3: '080', name: 'PANCALANG' },
  { code: '3208090', regencyCode: '3208', districtCode3: '090', name: 'JAPARA' },
  { code: '3208100', regencyCode: '3208', districtCode3: '100', name: 'CIGANDAMEKAR' },
  { code: '3208110', regencyCode: '3208', districtCode3: '110', name: 'CIAWIGEBANG' },
  { code: '3208120', regencyCode: '3208', districtCode3: '120', name: 'CIDAHU' },
  { code: '3208130', regencyCode: '3208', districtCode3: '130', name: 'KALIMANGGIS' },
  { code: '3208140', regencyCode: '3208', districtCode3: '140', name: 'LEBAKWANGI' },
  { code: '3208150', regencyCode: '3208', districtCode3: '150', name: 'LURAGUNG' },
  { code: '3208160', regencyCode: '3208', districtCode3: '160', name: 'CIWARU' },
  { code: '3208170', regencyCode: '3208', districtCode3: '170', name: 'CIBINGBIN' },
  { code: '3208180', regencyCode: '3208', districtCode3: '180', name: 'CIBEUREUM' },
  { code: '3208190', regencyCode: '3208', districtCode3: '190', name: 'CIMAHI' },
  { code: '3208200', regencyCode: '3208', districtCode3: '200', name: 'KARANGKANCANA' },
  { code: '3208210', regencyCode: '3208', districtCode3: '210', name: 'MALEBER' },
  { code: '3208220', regencyCode: '3208', districtCode3: '220', name: 'GARAWANGI' },
  { code: '3208230', regencyCode: '3208', districtCode3: '230', name: 'SINDANGAGUNG' },
  { code: '3208240', regencyCode: '3208', districtCode3: '240', name: 'CINIRU' },
  { code: '3208250', regencyCode: '3208', districtCode3: '250', name: 'HANTARA' },
  { code: '3208260', regencyCode: '3208', districtCode3: '260', name: 'SELAJAMBE' },
  { code: '3208270', regencyCode: '3208', districtCode3: '270', name: 'SUBANG' },
  { code: '3208280', regencyCode: '3208', districtCode3: '280', name: 'CILEBAK' },
  { code: '3208290', regencyCode: '3208', districtCode3: '290', name: 'DARMA' },
  { code: '3208300', regencyCode: '3208', districtCode3: '300', name: 'KADUGEDE' },
  { code: '3208310', regencyCode: '3208', districtCode3: '310', name: 'NUSAHERANG' },

  // Jawa Barat - Kabupaten Cirebon (3209)
  { code: '3209010', regencyCode: '3209', districtCode3: '010', name: 'SUMBER' },
  { code: '3209020', regencyCode: '3209', districtCode3: '020', name: 'DUKUPUNTANG' },
  { code: '3209030', regencyCode: '3209', districtCode3: '030', name: 'PLUMBON' },
  { code: '3209040', regencyCode: '3209', districtCode3: '040', name: 'WERU' },
  { code: '3209050', regencyCode: '3209', districtCode3: '050', name: 'KEDAWUNG' },
  { code: '3209060', regencyCode: '3209', districtCode3: '060', name: 'GUNUNG JATI' },
  { code: '3209070', regencyCode: '3209', districtCode3: '070', name: 'KAPETAKAN' },
  { code: '3209080', regencyCode: '3209', districtCode3: '080', name: 'KLANGENAN' },
  { code: '3209090', regencyCode: '3209', districtCode3: '090', name: 'ARJAWINANGUN' },
  { code: '3209100', regencyCode: '3209', districtCode3: '100', name: 'PANGURAGAN' },
  { code: '3209110', regencyCode: '3209', districtCode3: '110', name: 'CIWARINGIN' },
  { code: '3209120', regencyCode: '3209', districtCode3: '120', name: 'SUSUKAN' },
  { code: '3209130', regencyCode: '3209', districtCode3: '130', name: 'PALIMANAN' },
  { code: '3209140', regencyCode: '3209', districtCode3: '140', name: 'ASTANAJAPURA' },
  { code: '3209150', regencyCode: '3209', districtCode3: '150', name: 'PANGENAN' },
  { code: '3209160', regencyCode: '3209', districtCode3: '160', name: 'KARANGSEMBUNG' },
  { code: '3209170', regencyCode: '3209', districtCode3: '170', name: 'LEMAHABANG' },
  { code: '3209180', regencyCode: '3209', districtCode3: '180', name: 'MUNDU' },
  { code: '3209190', regencyCode: '3209', districtCode3: '190', name: 'BEBER' },
  { code: '3209200', regencyCode: '3209', districtCode3: '200', name: 'TALUN' },
  { code: '3209210', regencyCode: '3209', districtCode3: '210', name: 'SEDONG' },
  { code: '3209220', regencyCode: '3209', districtCode3: '220', name: 'SINDANGLAUT' },
  { code: '3209230', regencyCode: '3209', districtCode3: '230', name: 'CILEDUG' },
  { code: '3209240', regencyCode: '3209', districtCode3: '240', name: 'LOSARI' },
  { code: '3209250', regencyCode: '3209', districtCode3: '250', name: 'PABEDILAN' },
  { code: '3209260', regencyCode: '3209', districtCode3: '260', name: 'BABAKAN' },
  { code: '3209270', regencyCode: '3209', districtCode3: '270', name: 'WALED' },
  { code: '3209280', regencyCode: '3209', districtCode3: '280', name: 'PASALEMAN' },

  // Jawa Barat - Kabupaten Majalengka (3210)
  { code: '3210010', regencyCode: '3210', districtCode3: '010', name: 'MAJALENGKA' },
  { code: '3210020', regencyCode: '3210', districtCode3: '020', name: 'CIGASONG' },
  { code: '3210030', regencyCode: '3210', districtCode3: '030', name: 'SUKAHAJI' },
  { code: '3210040', regencyCode: '3210', districtCode3: '040', name: 'SINDANG' },
  { code: '3210050', regencyCode: '3210', districtCode3: '050', name: 'RAJAGALUH' },
  { code: '3210060', regencyCode: '3210', districtCode3: '060', name: 'SINDANGWANGI' },
  { code: '3210070', regencyCode: '3210', districtCode3: '070', name: 'LEUWIMUNDING' },
  { code: '3210080', regencyCode: '3210', districtCode3: '080', name: 'PALASAH' },
  { code: '3210090', regencyCode: '3210', districtCode3: '090', name: 'JATIWANGI' },
  { code: '3210100', regencyCode: '3210', districtCode3: '100', name: 'DAWUAN' },
  { code: '3210110', regencyCode: '3210', districtCode3: '110', name: 'KASOKANDEL' },
  { code: '3210120', regencyCode: '3210', districtCode3: '120', name: 'KERTAJATI' },
  { code: '3210130', regencyCode: '3210', districtCode3: '130', name: 'JATITUJUH' },
  { code: '3210140', regencyCode: '3210', districtCode3: '140', name: 'LIGUNG' },
  { code: '3210150', regencyCode: '3210', districtCode3: '150', name: 'SUMBERJAYA' },
  { code: '3210160', regencyCode: '3210', districtCode3: '160', name: 'KADIPATEN' },
  { code: '3210170', regencyCode: '3210', districtCode3: '170', name: 'PANYINGKIRAN' },
  { code: '3210180', regencyCode: '3210', districtCode3: '180', name: 'BANTARUJEG' },
  { code: '3210190', regencyCode: '3210', districtCode3: '190', name: 'MALAUSMA' },
  { code: '3210200', regencyCode: '3210', districtCode3: '200', name: 'LEMAHSUGIH' },
  { code: '3210210', regencyCode: '3210', districtCode3: '210', name: 'CIKIJING' },
  { code: '3210220', regencyCode: '3210', districtCode3: '220', name: 'CINGAMBUL' },
  { code: '3210230', regencyCode: '3210', districtCode3: '230', name: 'TALAGA' },
  { code: '3210240', regencyCode: '3210', districtCode3: '240', name: 'BANJARAN' },
  { code: '3210250', regencyCode: '3210', districtCode3: '250', name: 'ARGAPURA' },
  { code: '3210260', regencyCode: '3210', districtCode3: '260', name: 'MAJA' },

  // Jawa Barat - Kabupaten Sumedang (3211)
  { code: '3211010', regencyCode: '3211', districtCode3: '010', name: 'SUMEDANG SELATAN' },
  { code: '3211020', regencyCode: '3211', districtCode3: '020', name: 'SUMEDANG UTARA' },
  { code: '3211030', regencyCode: '3211', districtCode3: '030', name: 'GANEAS' },
  { code: '3211040', regencyCode: '3211', districtCode3: '040', name: 'SITURAJA' },
  { code: '3211050', regencyCode: '3211', districtCode3: '050', name: 'CISITU' },
  { code: '3211060', regencyCode: '3211', districtCode3: '060', name: 'DARMARAJA' },
  { code: '3211070', regencyCode: '3211', districtCode3: '070', name: 'WADO' },
  { code: '3211080', regencyCode: '3211', districtCode3: '080', name: 'JATINUNGGAL' },
  { code: '3211090', regencyCode: '3211', districtCode3: '090', name: 'CIBUGEL' },
  { code: '3211100', regencyCode: '3211', districtCode3: '100', name: 'PASEH' },
  { code: '3211110', regencyCode: '3211', districtCode3: '110', name: 'CIMALAKA' },
  { code: '3211120', regencyCode: '3211', districtCode3: '120', name: 'CISARUA' },
  { code: '3211130', regencyCode: '3211', districtCode3: '130', name: 'TANJUNGKERTA' },
  { code: '3211140', regencyCode: '3211', districtCode3: '140', name: 'TANJUNGMEDAR' },
  { code: '3211150', regencyCode: '3211', districtCode3: '150', name: 'BUAHDUA' },
  { code: '3211160', regencyCode: '3211', districtCode3: '160', name: 'SURIAN' },
  { code: '3211170', regencyCode: '3211', districtCode3: '170', name: 'TOMO' },
  { code: '3211180', regencyCode: '3211', districtCode3: '180', name: 'UJUNGJAYA' },
  { code: '3211190', regencyCode: '3211', districtCode3: '190', name: 'CONGGEANG' },
  { code: '3211200', regencyCode: '3211', districtCode3: '200', name: 'JATIGEDE' },
  { code: '3211210', regencyCode: '3211', districtCode3: '210', name: 'PAMULIHAN' },
  { code: '3211220', regencyCode: '3211', districtCode3: '220', name: 'RANCAKALONG' },
  { code: '3211230', regencyCode: '3211', districtCode3: '230', name: 'TANJUNGSARI' },
  { code: '3211240', regencyCode: '3211', districtCode3: '240', name: 'SUKASARI' },
  { code: '3211250', regencyCode: '3211', districtCode3: '250', name: 'JATINANGOR' },
  { code: '3211260', regencyCode: '3211', districtCode3: '260', name: 'CIMANGGUNG' },

  // Jawa Barat - Kabupaten Indramayu (3212)
  { code: '3212010', regencyCode: '3212', districtCode3: '010', name: 'INDRAMAYU' },
  { code: '3212020', regencyCode: '3212', districtCode3: '020', name: 'SINDANG' },
  { code: '3212030', regencyCode: '3212', districtCode3: '030', name: 'CANTIGI' },
  { code: '3212040', regencyCode: '3212', districtCode3: '040', name: 'PASEKAN' },
  { code: '3212050', regencyCode: '3212', districtCode3: '050', name: 'BALONGAN' },
  { code: '3212060', regencyCode: '3212', districtCode3: '060', name: 'JUNTINYUAT' },
  { code: '3212070', regencyCode: '3212', districtCode3: '070', name: 'SLIYEG' },
  { code: '3212080', regencyCode: '3212', districtCode3: '080', name: 'JATIBARANG' },
  { code: '3212090', regencyCode: '3212', districtCode3: '090', name: 'WIDASARI' },
  { code: '3212100', regencyCode: '3212', districtCode3: '100', name: 'KERTASEMAYA' },
  { code: '3212110', regencyCode: '3212', districtCode3: '110', name: 'SUKAGUMIWANG' },
  { code: '3212120', regencyCode: '3212', districtCode3: '120', name: 'KRANGKENG' },
  { code: '3212130', regencyCode: '3212', districtCode3: '130', name: 'KARANGAMPEL' },
  { code: '3212140', regencyCode: '3212', districtCode3: '140', name: 'KEDOKAN BUNDER' },
  { code: '3212150', regencyCode: '3212', districtCode3: '150', name: 'LOHBENER' },
  { code: '3212160', regencyCode: '3212', districtCode3: '160', name: 'ARAHAN' },
  { code: '3212170', regencyCode: '3212', districtCode3: '170', name: 'LOSARANG' },
  { code: '3212180', regencyCode: '3212', districtCode3: '180', name: 'KANDANGHAUR' },
  { code: '3212190', regencyCode: '3212', districtCode3: '190', name: 'BONGAS' },
  { code: '3212200', regencyCode: '3212', districtCode3: '200', name: 'ANJATAN' },
  { code: '3212210', regencyCode: '3212', districtCode3: '210', name: 'SUKRA' },
  { code: '3212220', regencyCode: '3212', districtCode3: '220', name: 'PATROL' },
  { code: '3212230', regencyCode: '3212', districtCode3: '230', name: 'GABUSWETAN' },
  { code: '3212240', regencyCode: '3212', districtCode3: '240', name: 'KROYA' },
  { code: '3212250', regencyCode: '3212', districtCode3: '250', name: 'HAURGEULIS' },
  { code: '3212260', regencyCode: '3212', districtCode3: '260', name: 'GANTAR' },
  { code: '3212270', regencyCode: '3212', districtCode3: '270', name: 'TERISI' },
  { code: '3212280', regencyCode: '3212', districtCode3: '280', name: 'CIKEDUNG' },
  { code: '3212290', regencyCode: '3212', districtCode3: '290', name: 'LELEA' },
  { code: '3212300', regencyCode: '3212', districtCode3: '300', name: 'TUKDANA' },

  // Jawa Barat - Kabupaten Subang (3213)
  { code: '3213010', regencyCode: '3213', districtCode3: '010', name: 'SUBANG' },
  { code: '3213020', regencyCode: '3213', districtCode3: '020', name: 'CIJAMBE' },
  { code: '3213030', regencyCode: '3213', districtCode3: '030', name: 'CISALAK' },
  { code: '3213040', regencyCode: '3213', districtCode3: '040', name: 'KASOMALANG' },
  { code: '3213050', regencyCode: '3213', districtCode3: '050', name: 'JALAN CAGAK' },
  { code: '3213060', regencyCode: '3213', districtCode3: '060', name: 'CIATER' },
  { code: '3213070', regencyCode: '3213', districtCode3: '070', name: 'SAGALAHERANG' },
  { code: '3213080', regencyCode: '3213', districtCode3: '080', name: 'SERANGPANJANG' },
  { code: '3213090', regencyCode: '3213', districtCode3: '090', name: 'KALIJATI' },
  { code: '3213100', regencyCode: '3213', districtCode3: '100', name: 'DAWUAN' },
  { code: '3213110', regencyCode: '3213', districtCode3: '110', name: 'CIPEUNDEUY' },
  { code: '3213120', regencyCode: '3213', districtCode3: '120', name: 'PABUARAN' },
  { code: '3213130', regencyCode: '3213', districtCode3: '130', name: 'PATOKBEUSI' },
  { code: '3213140', regencyCode: '3213', districtCode3: '140', name: 'PURWADADI' },
  { code: '3213150', regencyCode: '3213', districtCode3: '150', name: 'CIKAUM' },
  { code: '3213160', regencyCode: '3213', districtCode3: '160', name: 'PAGADEN' },
  { code: '3213170', regencyCode: '3213', districtCode3: '170', name: 'PAGADEN BARAT' },
  { code: '3213180', regencyCode: '3213', districtCode3: '180', name: 'CIPUNAGARA' },
  { code: '3213190', regencyCode: '3213', districtCode3: '190', name: 'COMPRENG' },
  { code: '3213200', regencyCode: '3213', districtCode3: '200', name: 'BINONG' },
  { code: '3213210', regencyCode: '3213', districtCode3: '210', name: 'TAMBAKDAHAN' },
  { code: '3213220', regencyCode: '3213', districtCode3: '220', name: 'CIASEM' },
  { code: '3213230', regencyCode: '3213', districtCode3: '230', name: 'BLANAKAN' },
  { code: '3213240', regencyCode: '3213', districtCode3: '240', name: 'SUKASARI' },
  { code: '3213250', regencyCode: '3213', districtCode3: '250', name: 'PAMANUKAN' },
  { code: '3213260', regencyCode: '3213', districtCode3: '260', name: 'LEGONKULON' },
  { code: '3213270', regencyCode: '3213', districtCode3: '270', name: 'PUSAKANAGARA' },
  { code: '3213280', regencyCode: '3213', districtCode3: '280', name: 'PUSAKAJAYA' },

  // Jawa Barat - Kabupaten Purwakarta (3214)
  { code: '3214010', regencyCode: '3214', districtCode3: '010', name: 'PURWAKARTA' },
  { code: '3214020', regencyCode: '3214', districtCode3: '020', name: 'CAMPAKA' },
  { code: '3214030', regencyCode: '3214', districtCode3: '030', name: 'CIBATU' },
  { code: '3214040', regencyCode: '3214', districtCode3: '040', name: 'BUNGURSARI' },
  { code: '3214050', regencyCode: '3214', districtCode3: '050', name: 'BABAKANCIKAO' },
  { code: '3214060', regencyCode: '3214', districtCode3: '060', name: 'PASAWAHAN' },
  { code: '3214070', regencyCode: '3214', districtCode3: '070', name: 'PONDOKSALAM' },
  { code: '3214080', regencyCode: '3214', districtCode3: '080', name: 'WANAYASA' },
  { code: '3214090', regencyCode: '3214', districtCode3: '090', name: 'KIARAPEDES' },
  { code: '3214100', regencyCode: '3214', districtCode3: '100', name: 'BOJONG' },
  { code: '3214110', regencyCode: '3214', districtCode3: '110', name: 'DARANGDAN' },
  { code: '3214120', regencyCode: '3214', districtCode3: '120', name: 'PLERED' },
  { code: '3214130', regencyCode: '3214', districtCode3: '130', name: 'TEGALWARU' },
  { code: '3214140', regencyCode: '3214', districtCode3: '140', name: 'SUKATANI' },
  { code: '3214150', regencyCode: '3214', districtCode3: '150', name: 'JATILUHUR' },
  { code: '3214160', regencyCode: '3214', districtCode3: '160', name: 'SUKASARI' },
  { code: '3214170', regencyCode: '3214', districtCode3: '170', name: 'MANIIS' },

  // Jawa Barat - Kabupaten Karawang (3215)
  { code: '3215010', regencyCode: '3215', districtCode3: '010', name: 'KARAWANG BARAT' },
  { code: '3215020', regencyCode: '3215', districtCode3: '020', name: 'KARAWANG TIMUR' },
  { code: '3215030', regencyCode: '3215', districtCode3: '030', name: 'TELUKJAMBE TIMUR' },
  { code: '3215040', regencyCode: '3215', districtCode3: '040', name: 'TELUKJAMBE BARAT' },
  { code: '3215050', regencyCode: '3215', districtCode3: '050', name: 'KLARI' },
  { code: '3215060', regencyCode: '3215', districtCode3: '060', name: 'CIAMPEL' },
  { code: '3215070', regencyCode: '3215', districtCode3: '070', name: 'MAJALAYA' },
  { code: '3215080', regencyCode: '3215', districtCode3: '080', name: 'RENGASDENGKLOK' },
  { code: '3215090', regencyCode: '3215', districtCode3: '090', name: 'KUTAWAHLUYA' },
  { code: '3215100', regencyCode: '3215', districtCode3: '100', name: 'RAWAMERTA' },
  { code: '3215110', regencyCode: '3215', districtCode3: '110', name: 'JAYAKERTA' },
  { code: '3215120', regencyCode: '3215', districtCode3: '120', name: 'PEDES' },
  { code: '3215130', regencyCode: '3215', districtCode3: '130', name: 'CIBUAYA' },
  { code: '3215140', regencyCode: '3215', districtCode3: '140', name: 'TIRTAJAYA' },
  { code: '3215150', regencyCode: '3215', districtCode3: '150', name: 'BATUJAYA' },
  { code: '3215160', regencyCode: '3215', districtCode3: '160', name: 'PAKISJAYA' },
  { code: '3215170', regencyCode: '3215', districtCode3: '170', name: 'TEMPURAN' },
  { code: '3215180', regencyCode: '3215', districtCode3: '180', name: 'CILAMAYA KULON' },
  { code: '3215190', regencyCode: '3215', districtCode3: '190', name: 'CILAMAYA WETAN' },
  { code: '3215200', regencyCode: '3215', districtCode3: '200', name: 'BANYUSARI' },
  { code: '3215210', regencyCode: '3215', districtCode3: '210', name: 'JATISARI' },
  { code: '3215220', regencyCode: '3215', districtCode3: '220', name: 'TIRTAMULYA' },
  { code: '3215230', regencyCode: '3215', districtCode3: '230', name: 'KOTABARU' },
  { code: '3215240', regencyCode: '3215', districtCode3: '240', name: 'CIKAMPEK' },
  { code: '3215250', regencyCode: '3215', districtCode3: '250', name: 'PURWASARI' },
  { code: '3215260', regencyCode: '3215', districtCode3: '260', name: 'LEMAHABANG' },
  { code: '3215270', regencyCode: '3215', districtCode3: '270', name: 'TELAGASARI' },
  { code: '3215280', regencyCode: '3215', districtCode3: '280', name: 'PANGKALAN' },
  { code: '3215290', regencyCode: '3215', districtCode3: '290', name: 'TEGALWARU' },

  // Jawa Barat - Kabupaten Bekasi (3216)
  { code: '3216010', regencyCode: '3216', districtCode3: '010', name: 'CIKARANG PUSAT' },
  { code: '3216020', regencyCode: '3216', districtCode3: '020', name: 'CIKARANG SELATAN' },
  { code: '3216030', regencyCode: '3216', districtCode3: '030', name: 'CIKARANG UTARA' },
  { code: '3216040', regencyCode: '3216', districtCode3: '040', name: 'CIKARANG BARAT' },
  { code: '3216050', regencyCode: '3216', districtCode3: '050', name: 'CIKARANG TIMUR' },
  { code: '3216060', regencyCode: '3216', districtCode3: '060', name: 'CIBITUNG' },
  { code: '3216070', regencyCode: '3216', districtCode3: '070', name: 'TAMBUN SELATAN' },
  { code: '3216080', regencyCode: '3216', districtCode3: '080', name: 'TAMBUN UTARA' },
  { code: '3216090', regencyCode: '3216', districtCode3: '090', name: 'CIBARUSAH' },
  { code: '3216100', regencyCode: '3216', districtCode3: '100', name: 'BOJONGMANGU' },
  { code: '3216110', regencyCode: '3216', districtCode3: '110', name: 'SERANG BARU' },
  { code: '3216120', regencyCode: '3216', districtCode3: '120', name: 'SETU' },
  { code: '3216130', regencyCode: '3216', districtCode3: '130', name: 'KEDUNGWARINGIN' },
  { code: '3216140', regencyCode: '3216', districtCode3: '140', name: 'KARANGBAHAGIA' },
  { code: '3216150', regencyCode: '3216', districtCode3: '150', name: 'PEBAYURAN' },
  { code: '3216160', regencyCode: '3216', districtCode3: '160', name: 'SUKAKARYA' },
  { code: '3216170', regencyCode: '3216', districtCode3: '170', name: 'SUKATANI' },
  { code: '3216180', regencyCode: '3216', districtCode3: '180', name: 'CABANGBUNGIN' },
  { code: '3216190', regencyCode: '3216', districtCode3: '190', name: 'MUARAGEMBONG' },
  { code: '3216200', regencyCode: '3216', districtCode3: '200', name: 'BABELAN' },
  { code: '3216210', regencyCode: '3216', districtCode3: '210', name: 'TARUMAJAYA' },
  { code: '3216220', regencyCode: '3216', districtCode3: '220', name: 'TAMBELANG' },
  { code: '3216230', regencyCode: '3216', districtCode3: '230', name: 'SUKAWANGI' },

  // Jawa Barat - Kabupaten Bandung Barat (3217)
  { code: '3217010', regencyCode: '3217', districtCode3: '010', name: 'PADALARANG' },
  { code: '3217020', regencyCode: '3217', districtCode3: '020', name: 'NGAMPRAH' },
  { code: '3217030', regencyCode: '3217', districtCode3: '030', name: 'CISARUA' },
  { code: '3217040', regencyCode: '3217', districtCode3: '040', name: 'PARONGPONG' },
  { code: '3217050', regencyCode: '3217', districtCode3: '050', name: 'LEMBANG' },
  { code: '3217060', regencyCode: '3217', districtCode3: '060', name: 'CIKALONGWETAN' },
  { code: '3217070', regencyCode: '3217', districtCode3: '070', name: 'CIPEUNDEUY' },
  { code: '3217080', regencyCode: '3217', districtCode3: '080', name: 'BATUJAJAR' },
  { code: '3217090', regencyCode: '3217', districtCode3: '090', name: 'CIHAMPELAS' },
  { code: '3217100', regencyCode: '3217', districtCode3: '100', name: 'CILILIN' },
  { code: '3217110', regencyCode: '3217', districtCode3: '110', name: 'CIPONGKOR' },
  { code: '3217120', regencyCode: '3217', districtCode3: '120', name: 'RONGGA' },
  { code: '3217130', regencyCode: '3217', districtCode3: '130', name: 'GUNUNGHALU' },
  { code: '3217140', regencyCode: '3217', districtCode3: '140', name: 'SINDANGKERTA' },
  { code: '3217150', regencyCode: '3217', districtCode3: '150', name: 'SAGULING' },

  // Jawa Barat - Kabupaten Pangandaran (3218)
  { code: '3218010', regencyCode: '3218', districtCode3: '010', name: 'PARIGI' },
  { code: '3218020', regencyCode: '3218', districtCode3: '020', name: 'CIJULANG' },
  { code: '3218030', regencyCode: '3218', districtCode3: '030', name: 'CIMERAK' },
  { code: '3218040', regencyCode: '3218', districtCode3: '040', name: 'CIGUGUR' },
  { code: '3218050', regencyCode: '3218', districtCode3: '050', name: 'LANGKAPLANCAR' },
  { code: '3218060', regencyCode: '3218', districtCode3: '060', name: 'MANGUNJAYA' },
  { code: '3218070', regencyCode: '3218', districtCode3: '070', name: 'PADAHERANG' },
  { code: '3218080', regencyCode: '3218', districtCode3: '080', name: 'KALIPUCANG' },
  { code: '3218090', regencyCode: '3218', districtCode3: '090', name: 'PANGANDARAN' },
  { code: '3218100', regencyCode: '3218', districtCode3: '100', name: 'SIDAMULIH' },

  // Jawa Barat - Kota Bogor (3271)
  { code: '3271010', regencyCode: '3271', districtCode3: '010', name: 'BOGOR SELATAN' },
  { code: '3271020', regencyCode: '3271', districtCode3: '020', name: 'BOGOR TIMUR' },
  { code: '3271030', regencyCode: '3271', districtCode3: '030', name: 'BOGOR UTARA' },
  { code: '3271040', regencyCode: '3271', districtCode3: '040', name: 'BOGOR TENGAH' },
  { code: '3271050', regencyCode: '3271', districtCode3: '050', name: 'BOGOR BARAT' },
  { code: '3271060', regencyCode: '3271', districtCode3: '060', name: 'TANAH SAREAL' },

  // Jawa Barat - Kota Sukabumi (3272)
  { code: '3272010', regencyCode: '3272', districtCode3: '010', name: 'GUNUNGPUYUH' },
  { code: '3272020', regencyCode: '3272', districtCode3: '020', name: 'CIKOLE' },
  { code: '3272030', regencyCode: '3272', districtCode3: '030', name: 'CITAMIANG' },
  { code: '3272040', regencyCode: '3272', districtCode3: '040', name: 'WARUDOYONG' },
  { code: '3272050', regencyCode: '3272', districtCode3: '050', name: 'BAROS' },
  { code: '3272060', regencyCode: '3272', districtCode3: '060', name: 'LEMBURSITU' },
  { code: '3272070', regencyCode: '3272', districtCode3: '070', name: 'CIBEUREUM' },

  // Jawa Barat - Kota Bandung (3273)
  { code: '3273010', regencyCode: '3273', districtCode3: '010', name: 'BANDUNG KULON' },
  { code: '3273020', regencyCode: '3273', districtCode3: '020', name: 'BABAKAN CIPARAY' },
  { code: '3273030', regencyCode: '3273', districtCode3: '030', name: 'BOJONGLOA KALER' },
  { code: '3273040', regencyCode: '3273', districtCode3: '040', name: 'BOJONGLOA KIDUL' },
  { code: '3273050', regencyCode: '3273', districtCode3: '050', name: 'ASTANA ANYAR' },
  { code: '3273060', regencyCode: '3273', districtCode3: '060', name: 'REGOL' },
  { code: '3273070', regencyCode: '3273', districtCode3: '070', name: 'LENGKONG' },
  { code: '3273080', regencyCode: '3273', districtCode3: '080', name: 'BANDUNG KIDUL' },
  { code: '3273090', regencyCode: '3273', districtCode3: '090', name: 'BUAHBATU' },
  { code: '3273100', regencyCode: '3273', districtCode3: '100', name: 'RANCASARI' },
  { code: '3273110', regencyCode: '3273', districtCode3: '110', name: 'GEDEBAGE' },
  { code: '3273120', regencyCode: '3273', districtCode3: '120', name: 'CIBIRU' },
  { code: '3273130', regencyCode: '3273', districtCode3: '130', name: 'PANYILEUKAN' },
  { code: '3273140', regencyCode: '3273', districtCode3: '140', name: 'UJUNG BERUNG' },
  { code: '3273150', regencyCode: '3273', districtCode3: '150', name: 'CINAMBO' },
  { code: '3273160', regencyCode: '3273', districtCode3: '160', name: 'ARCAMANIK' },
  { code: '3273170', regencyCode: '3273', districtCode3: '170', name: 'ANTAPANI' },
  { code: '3273180', regencyCode: '3273', districtCode3: '180', name: 'MANDALAJATI' },
  { code: '3273190', regencyCode: '3273', districtCode3: '190', name: 'KIARACONDONG' },
  { code: '3273200', regencyCode: '3273', districtCode3: '200', name: 'BATUNUNGGAL' },
  { code: '3273210', regencyCode: '3273', districtCode3: '210', name: 'SUMUR BANDUNG' },
  { code: '3273220', regencyCode: '3273', districtCode3: '220', name: 'ANDIR' },
  { code: '3273230', regencyCode: '3273', districtCode3: '230', name: 'CICENDO' },
  { code: '3273240', regencyCode: '3273', districtCode3: '240', name: 'SUKAJADI' },
  { code: '3273250', regencyCode: '3273', districtCode3: '250', name: 'SUKASARI' },
  { code: '3273260', regencyCode: '3273', districtCode3: '260', name: 'CIDADAP' },
  { code: '3273270', regencyCode: '3273', districtCode3: '270', name: 'COBLONG' },

  // Jawa Barat - Kota Cirebon (3274)
  { code: '3274010', regencyCode: '3274', districtCode3: '010', name: 'KEJAKSAN' },
  { code: '3274020', regencyCode: '3274', districtCode3: '020', name: 'LEMAHWUNGKUK' },
  { code: '3274030', regencyCode: '3274', districtCode3: '030', name: 'HARJAMUKTI' },
  { code: '3274040', regencyCode: '3274', districtCode3: '040', name: 'PEKALIPAN' },
  { code: '3274050', regencyCode: '3274', districtCode3: '050', name: 'KESAMBI' },

  // Jawa Barat - Kota Bekasi (3275)
  { code: '3275010', regencyCode: '3275', districtCode3: '010', name: 'BEKASI TIMUR' },
  { code: '3275020', regencyCode: '3275', districtCode3: '020', name: 'BEKASI BARAT' },
  { code: '3275030', regencyCode: '3275', districtCode3: '030', name: 'BEKASI UTARA' },
  { code: '3275040', regencyCode: '3275', districtCode3: '040', name: 'BEKASI SELATAN' },
  { code: '3275050', regencyCode: '3275', districtCode3: '050', name: 'RAWALUMBU' },
  { code: '3275060', regencyCode: '3275', districtCode3: '060', name: 'MEDANSATRIA' },
  { code: '3275070', regencyCode: '3275', districtCode3: '070', name: 'BANTARGEBANG' },
  { code: '3275080', regencyCode: '3275', districtCode3: '080', name: 'PONDOKGEDE' },
  { code: '3275090', regencyCode: '3275', districtCode3: '090', name: 'JATIASIH' },
  { code: '3275100', regencyCode: '3275', districtCode3: '100', name: 'JATISAMPURNA' },
  { code: '3275110', regencyCode: '3275', districtCode3: '110', name: 'MUSTIKAJAYA' },
  { code: '3275120', regencyCode: '3275', districtCode3: '120', name: 'PONDOKMELATI' },

  // Jawa Barat - Kota Depok (3276)
  { code: '3276010', regencyCode: '3276', districtCode3: '010', name: 'PANCORAN MAS' },
  { code: '3276020', regencyCode: '3276', districtCode3: '020', name: 'SUKMAJAYA' },
  { code: '3276030', regencyCode: '3276', districtCode3: '030', name: 'CIMANGGIS' },
  { code: '3276040', regencyCode: '3276', districtCode3: '040', name: 'SAWANGAN' },
  { code: '3276050', regencyCode: '3276', districtCode3: '050', name: 'LIMO' },
  { code: '3276060', regencyCode: '3276', districtCode3: '060', name: 'BEJI' },
  { code: '3276070', regencyCode: '3276', districtCode3: '070', name: 'CIPAYUNG' },
  { code: '3276080', regencyCode: '3276', districtCode3: '080', name: 'CILODONG' },
  { code: '3276090', regencyCode: '3276', districtCode3: '090', name: 'TAPOS' },
  { code: '3276100', regencyCode: '3276', districtCode3: '100', name: 'BOJONGSARI' },
  { code: '3276110', regencyCode: '3276', districtCode3: '110', name: 'CINERE' },

  // Jawa Barat - Kota Cimahi (3277)
  { code: '3277010', regencyCode: '3277', districtCode3: '010', name: 'CIMAHI SELATAN' },
  { code: '3277020', regencyCode: '3277', districtCode3: '020', name: 'CIMAHI TENGAH' },
  { code: '3277030', regencyCode: '3277', districtCode3: '030', name: 'CIMAHI UTARA' },

  // Jawa Barat - Kota Tasikmalaya (3278)
  { code: '3278010', regencyCode: '3278', districtCode3: '010', name: 'CIHIDEUNG' },
  { code: '3278020', regencyCode: '3278', districtCode3: '020', name: 'CIPEDES' },
  { code: '3278030', regencyCode: '3278', districtCode3: '030', name: 'TAWANG' },
  { code: '3278040', regencyCode: '3278', districtCode3: '040', name: 'INDIHIANG' },
  { code: '3278050', regencyCode: '3278', districtCode3: '050', name: 'KAWALU' },
  { code: '3278060', regencyCode: '3278', districtCode3: '060', name: 'CIBEUREUM' },
  { code: '3278070', regencyCode: '3278', districtCode3: '070', name: 'TAMANSARI' },
  { code: '3278080', regencyCode: '3278', districtCode3: '080', name: 'MANGKUBUMI' },
  { code: '3278090', regencyCode: '3278', districtCode3: '090', name: 'BUNGURSARI' },
  { code: '3278100', regencyCode: '3278', districtCode3: '100', name: 'PURBARATU' },

  // Jawa Barat - Kota Banjar (3279)
  { code: '3279010', regencyCode: '3279', districtCode3: '010', name: 'BANJAR' },
  { code: '3279020', regencyCode: '3279', districtCode3: '020', name: 'PURWAHARJA' },
  { code: '3279030', regencyCode: '3279', districtCode3: '030', name: 'PATARUMAN' },
  { code: '3279040', regencyCode: '3279', districtCode3: '040', name: 'LANGENSARI' },

  // DKI Jakarta - Jakarta Selatan (3171)
  { code: '3171010', regencyCode: '3171', districtCode3: '010', name: 'JAGAKARSA' },
  { code: '3171020', regencyCode: '3171', districtCode3: '020', name: 'PASAR MINGGU' },
  { code: '3171030', regencyCode: '3171', districtCode3: '030', name: 'CILANDAK' },
  { code: '3171040', regencyCode: '3171', districtCode3: '040', name: 'PESANGGRAHAN' },
  { code: '3171050', regencyCode: '3171', districtCode3: '050', name: 'KEBAYORAN LAMA' },
  { code: '3171060', regencyCode: '3171', districtCode3: '060', name: 'KEBAYORAN BARU' },
  { code: '3171070', regencyCode: '3171', districtCode3: '070', name: 'MAMPANG PRAPATAN' },
  { code: '3171080', regencyCode: '3171', districtCode3: '080', name: 'PANCORAN' },
  { code: '3171090', regencyCode: '3171', districtCode3: '090', name: 'TEBET' },
  { code: '3171100', regencyCode: '3171', districtCode3: '100', name: 'SETIA BUDI' },

  // DKI Jakarta - Jakarta Pusat (3173)
  { code: '3173010', regencyCode: '3173', districtCode3: '010', name: 'TANAH ABANG' },
  { code: '3173020', regencyCode: '3173', districtCode3: '020', name: 'MENTENG' },
  { code: '3173030', regencyCode: '3173', districtCode3: '030', name: 'SENEN' },
  { code: '3173040', regencyCode: '3173', districtCode3: '040', name: 'JOHAR BARU' },
  { code: '3173050', regencyCode: '3173', districtCode3: '050', name: 'CEMPAKA PUTIH' },
  { code: '3173060', regencyCode: '3173', districtCode3: '060', name: 'KEMAYORAN' },
  { code: '3173070', regencyCode: '3173', districtCode3: '070', name: 'SAWAH BESAR' },
  { code: '3173080', regencyCode: '3173', districtCode3: '080', name: 'GAMBIR' },

  // Jawa Tengah - Kota Surakarta (3372)
  { code: '3372010', regencyCode: '3372', districtCode3: '010', name: 'LAWEYAN' },
  { code: '3372020', regencyCode: '3372', districtCode3: '020', name: 'SERENGAN' },
  { code: '3372030', regencyCode: '3372', districtCode3: '030', name: 'PASAR KLIWON' },
  { code: '3372040', regencyCode: '3372', districtCode3: '040', name: 'JEBRES' },
  { code: '3372050', regencyCode: '3372', districtCode3: '050', name: 'BANJARSARI' },

  // Jawa Tengah - Kota Semarang (3374)
  { code: '3374010', regencyCode: '3374', districtCode3: '010', name: 'SEMARANG TENGAH' },
  { code: '3374020', regencyCode: '3374', districtCode3: '020', name: 'SEMARANG UTARA' },
  { code: '3374030', regencyCode: '3374', districtCode3: '030', name: 'SEMARANG TIMUR' },
  { code: '3374040', regencyCode: '3374', districtCode3: '040', name: 'GAYAMSARI' },
  { code: '3374050', regencyCode: '3374', districtCode3: '050', name: 'SEMARANG SELATAN' },
  { code: '3374060', regencyCode: '3374', districtCode3: '060', name: 'CANDISARI' },
  { code: '3374070', regencyCode: '3374', districtCode3: '070', name: 'GAJAHMUNGKUR' },
  { code: '3374080', regencyCode: '3374', districtCode3: '080', name: 'SEMARANG BARAT' },

  // Jawa Tengah - Kabupaten Magelang (3308)
  { code: '3308010', regencyCode: '3308', districtCode3: '010', name: 'SALAM' },
  { code: '3308020', regencyCode: '3308', districtCode3: '020', name: 'BOROBUDUR' },
  { code: '3308030', regencyCode: '3308', districtCode3: '030', name: 'MUNTILAN' },
  { code: '3308040', regencyCode: '3308', districtCode3: '040', name: 'MUNGKID' },

  // DI Yogyakarta - Kabupaten Sleman (3404)
  { code: '3404010', regencyCode: '3404', districtCode3: '010', name: 'MOYUDAN' },
  { code: '3404020', regencyCode: '3404', districtCode3: '020', name: 'MINGGIR' },
  { code: '3404030', regencyCode: '3404', districtCode3: '030', name: 'SEYEGAN' },
  { code: '3404040', regencyCode: '3404', districtCode3: '040', name: 'GODEAN' },
  { code: '3404050', regencyCode: '3404', districtCode3: '050', name: 'GAMPING' },
  { code: '3404060', regencyCode: '3404', districtCode3: '060', name: 'MLATI' },
  { code: '3404070', regencyCode: '3404', districtCode3: '070', name: 'DEPOK' },
  { code: '3404080', regencyCode: '3404', districtCode3: '080', name: 'BERBAH' },
  { code: '3404090', regencyCode: '3404', districtCode3: '090', name: 'PRAMBANAN' },
  { code: '3404100', regencyCode: '3404', districtCode3: '100', name: 'KALASAN' },
  { code: '3404110', regencyCode: '3404', districtCode3: '110', name: 'NGEMPLAK' },
  { code: '3404120', regencyCode: '3404', districtCode3: '120', name: 'NGAGLIK' },
  { code: '3404130', regencyCode: '3404', districtCode3: '130', name: 'SLEMAN' },
  { code: '3404140', regencyCode: '3404', districtCode3: '140', name: 'TEMPEL' },
  { code: '3404150', regencyCode: '3404', districtCode3: '150', name: 'TURI' },
  { code: '3404160', regencyCode: '3404', districtCode3: '160', name: 'PAKEM' },
  { code: '3404170', regencyCode: '3404', districtCode3: '170', name: 'CANGKRINGAN' },

  // DI Yogyakarta - Kota Yogyakarta (3471)
  { code: '3471010', regencyCode: '3471', districtCode3: '010', name: 'MANTRIJERON' },
  { code: '3471020', regencyCode: '3471', districtCode3: '020', name: 'KRATON' },
  { code: '3471030', regencyCode: '3471', districtCode3: '030', name: 'MERGANGSAN' },
  { code: '3471040', regencyCode: '3471', districtCode3: '040', name: 'UMBULHARJO' },
  { code: '3471050', regencyCode: '3471', districtCode3: '050', name: 'KOTAGEDE' },
  { code: '3471060', regencyCode: '3471', districtCode3: '060', name: 'GONDOKUSUMAN' },
  { code: '3471070', regencyCode: '3471', districtCode3: '070', name: 'DANUREJAN' },
  { code: '3471080', regencyCode: '3471', districtCode3: '080', name: 'PAKUALAMAN' },
  { code: '3471090', regencyCode: '3471', districtCode3: '090', name: 'GONDOMANAN' },
  { code: '3471100', regencyCode: '3471', districtCode3: '100', name: 'NGAMPILAN' },
  { code: '3471110', regencyCode: '3471', districtCode3: '110', name: 'WIROBRAJAN' },
  { code: '3471120', regencyCode: '3471', districtCode3: '120', name: 'GEDONG TENGEN' },
  { code: '3471130', regencyCode: '3471', districtCode3: '130', name: 'JETIS' },
  { code: '3471140', regencyCode: '3471', districtCode3: '140', name: 'TEGALREJO' },

  // Jawa Timur - Kota Surabaya (3578)
  { code: '3578010', regencyCode: '3578', districtCode3: '010', name: 'GENTENG' },
  { code: '3578020', regencyCode: '3578', districtCode3: '020', name: 'TEGALSARI' },
  { code: '3578080', regencyCode: '3578', districtCode3: '080', name: 'SUKOLILO' },
  { code: '3578100', regencyCode: '3578', districtCode3: '100', name: 'GUBENG' },
  { code: '3578110', regencyCode: '3578', districtCode3: '110', name: 'RUNGKUT' },
  { code: '3578120', regencyCode: '3578', districtCode3: '120', name: 'WONOKROMO' },

  // Jawa Timur - Kota Batu (3579) & Banyuwangi (3510)
  { code: '3579010', regencyCode: '3579', districtCode3: '010', name: 'BATU' },
  { code: '3579020', regencyCode: '3579', districtCode3: '020', name: 'BUMIAJI' },
  { code: '3579030', regencyCode: '3579', districtCode3: '030', name: 'JUNREJO' },
  { code: '3510180', regencyCode: '3510', districtCode3: '180', name: 'BANYUWANGI' },

  // Bali - Kabupaten Badung (5103)
  { code: '5103010', regencyCode: '5103', districtCode3: '010', name: 'KUTA SELATAN' },
  { code: '5103020', regencyCode: '5103', districtCode3: '020', name: 'KUTA' },
  { code: '5103030', regencyCode: '5103', districtCode3: '030', name: 'KUTA UTARA' },
  { code: '5103040', regencyCode: '5103', districtCode3: '040', name: 'MENGWI' },
  { code: '5103050', regencyCode: '5103', districtCode3: '050', name: 'ABIANSEMAL' },
  { code: '5103060', regencyCode: '5103', districtCode3: '060', name: 'PETANG' },

  // Bali - Kabupaten Gianyar (5104)
  { code: '5104010', regencyCode: '5104', districtCode3: '010', name: 'SUKAWATI' },
  { code: '5104020', regencyCode: '5104', districtCode3: '020', name: 'BLAHBATUH' },
  { code: '5104030', regencyCode: '5104', districtCode3: '030', name: 'GIANYAR' },
  { code: '5104040', regencyCode: '5104', districtCode3: '040', name: 'TAMPAKSIRING' },
  { code: '5104050', regencyCode: '5104', districtCode3: '050', name: 'UBUD' },
  { code: '5104060', regencyCode: '5104', districtCode3: '060', name: 'TEGALLALANG' },
  { code: '5104070', regencyCode: '5104', districtCode3: '070', name: 'PAYANGAN' },

  // Bali - Kota Denpasar (5171)
  { code: '5171010', regencyCode: '5171', districtCode3: '010', name: 'DENPASAR SELATAN' },
  { code: '5171020', regencyCode: '5171', districtCode3: '020', name: 'DENPASAR TIMUR' },
  { code: '5171030', regencyCode: '5171', districtCode3: '030', name: 'DENPASAR BARAT' },
  { code: '5171040', regencyCode: '5171', districtCode3: '040', name: 'DENPASAR UTARA' },

  // NTB - Lombok Barat (5201) & Lombok Tengah (5202)
  { code: '5201061', regencyCode: '5201', districtCode3: '061', name: 'BATU LAYAR' },
  { code: '5201060', regencyCode: '5201', districtCode3: '060', name: 'GUNUNG SARI' },
  { code: '5202020', regencyCode: '5202', districtCode3: '020', name: 'PUJUT' },

  // NTT - Manggarai Barat (5315) & Ende (5311)
  { code: '5315010', regencyCode: '5315', districtCode3: '010', name: 'KOMODO' },
  { code: '5315011', regencyCode: '5315', districtCode3: '011', name: 'BOLENG' },
  { code: '5311053', regencyCode: '5311', districtCode3: '053', name: 'KELIMUTU' },

  // Sulawesi Selatan - Kota Makassar (7371) & Tana Toraja (7318)
  { code: '7371050', regencyCode: '7371', districtCode3: '050', name: 'UJUNG PANDANG' },
  { code: '7371060', regencyCode: '7371', districtCode3: '060', name: 'MAKASSAR' },
  { code: '7371110', regencyCode: '7371', districtCode3: '110', name: 'BIRING KANAYA' },
  { code: '7318040', regencyCode: '7318', districtCode3: '040', name: 'MAKALE' },

  // Papua - Kota Jayapura (9471)
  { code: '9471010', regencyCode: '9471', districtCode3: '010', name: 'MUARA TAMI' },
  { code: '9471020', regencyCode: '9471', districtCode3: '020', name: 'ABEPURA' },
  { code: '9471021', regencyCode: '9471', districtCode3: '021', name: 'HERAM' },
  { code: '9471030', regencyCode: '9471', districtCode3: '030', name: 'JAYAPURA SELATAN' },
  { code: '9471040', regencyCode: '9471', districtCode3: '040', name: 'JAYAPURA UTARA' },

  // Papua Barat - Kota Sorong (9171) & Raja Ampat (9105)
  { code: '9171010', regencyCode: '9171', districtCode3: '010', name: 'SORONG BARAT' },
  { code: '9171020', regencyCode: '9171', districtCode3: '020', name: 'SORONG KEPULAUAN' },
  { code: '9171030', regencyCode: '9171', districtCode3: '030', name: 'SORONG TIMUR' },
  { code: '9171040', regencyCode: '9171', districtCode3: '040', name: 'SORONG UTARA' },
  { code: '9105050', regencyCode: '9105', districtCode3: '050', name: 'WAIGEO SELATAN' },
  { code: '9105053', regencyCode: '9105', districtCode3: '053', name: 'KOTA WAISAI' },
];

export const DISTRICTS_MAP: Record<string, DistrictItem> = Object.fromEntries(
  SAMPLE_DISTRICTS.map((d) => [d.code, d])
);

// -----------------------------------------------------------------
// 4. CUSTOM DISTRICT STORAGE & CSV PARSER
// -----------------------------------------------------------------
const CUSTOM_DISTRICTS_STORAGE_KEY = 'SPWN_CUSTOM_DISTRICTS_V1';

// In-memory cache for fast lookup
let customDistrictsCache: DistrictItem[] | null = null;

export function getCustomDistricts(regencyCode?: string): DistrictItem[] {
  if (customDistrictsCache === null) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(CUSTOM_DISTRICTS_STORAGE_KEY);
        customDistrictsCache = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.warn('Gagal membaca custom districts dari localStorage', e);
        customDistrictsCache = [];
      }
    } else {
      customDistrictsCache = [];
    }
  }

  if (regencyCode) {
    return (customDistrictsCache || []).filter((d) => d.regencyCode === regencyCode);
  }
  return customDistrictsCache || [];
}

export function saveCustomDistricts(newItems: DistrictItem[]): number {
  const current = getCustomDistricts();
  const map = new Map<string, DistrictItem>();
  
  // Load existing
  current.forEach((item) => map.set(item.code, item));
  
  // Merge new items
  newItems.forEach((item) => {
    if (item.code && item.name && item.regencyCode) {
      map.set(item.code, item);
    }
  });

  const merged = Array.from(map.values());
  customDistrictsCache = merged;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(CUSTOM_DISTRICTS_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('spwn:districts-updated', { detail: { count: merged.length } }));
    } catch (e) {
      console.warn('Gagal menyimpan custom districts ke localStorage', e);
    }
  }

  return merged.length;
}

export function clearCustomDistricts(): void {
  customDistrictsCache = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(CUSTOM_DISTRICTS_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('spwn:districts-updated', { detail: { count: 0 } }));
    } catch (e) {
      console.warn('Gagal menghapus custom districts', e);
    }
  }
}

/**
 * Universal CSV Parser for District (Kecamatan) Data
 * Supports formats:
 * - regency_code, district_code3, district_name (e.g. 3201, 010, CIBINONG)
 * - code, name (e.g. 3201010, CIBINONG or 32.01.01, CIBINONG)
 * - prov_code, reg_code, dist_code, dist_name
 */
export function parseDistrictCsv(csvText: string): { items: DistrictItem[]; errors: string[]; totalParsed: number } {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const items: DistrictItem[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    return { items, errors: ['File atau teks CSV kosong.'], totalParsed: 0 };
  }

  // Detect header
  const firstLine = lines[0].toLowerCase();
  const isHeader = 
    firstLine.includes('kode') || 
    firstLine.includes('code') || 
    firstLine.includes('nama') || 
    firstLine.includes('name') || 
    firstLine.includes('kecamatan') ||
    firstLine.includes('district');

  const startIndex = isHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    let delimiter = ',';
    if (rawLine.includes(';') && !rawLine.includes(',')) delimiter = ';';
    else if (rawLine.includes('\t')) delimiter = '\t';
    else if (rawLine.includes('|')) delimiter = '|';

    const cols = rawLine.split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length < 2) continue;

    try {
      // 3+ columns [regencyCode, districtCode3, name]
      if (cols.length >= 3 && /^\d{4}$/.test(cols[0].replace(/\D/g, ''))) {
        const regencyCode = cols[0].replace(/\D/g, '');
        const rawDistCode = cols[1].replace(/\D/g, '');
        const districtCode3 = rawDistCode.padStart(3, '0').slice(-3);
        const name = cols[2].toUpperCase();
        const code = `${regencyCode}${districtCode3}`;

        items.push({ code, regencyCode, districtCode3, name });
      } 
      // 4 columns [provCode, regCode, distCode, name]
      else if (cols.length >= 4 && /^\d{2}$/.test(cols[0].replace(/\D/g, ''))) {
        const provCode = cols[0].replace(/\D/g, '');
        const rawReg = cols[1].replace(/\D/g, '');
        const regencyCode = rawReg.length === 4 ? rawReg : `${provCode}${rawReg.padStart(2, '0')}`;
        const rawDistCode = cols[2].replace(/\D/g, '');
        const districtCode3 = rawDistCode.padStart(3, '0').slice(-3);
        const name = cols[3].toUpperCase();
        const code = `${regencyCode}${districtCode3}`;

        items.push({ code, regencyCode, districtCode3, name });
      }
      // 2 columns [code, name]
      else {
        const rawCode = cols[0].replace(/[\s.-]/g, '');
        const name = cols[1].toUpperCase();

        if (rawCode.length >= 6) {
          const regencyCode = rawCode.slice(0, 4);
          const remainder = rawCode.slice(4);
          const districtCode3 = remainder.length === 2 ? `${remainder}0` : remainder.padStart(3, '0').slice(0, 3);
          const code = `${regencyCode}${districtCode3}`;

          items.push({ code, regencyCode, districtCode3, name });
        } else {
          errors.push(`Baris ${i + 1}: Format kode tidak dikenali (${cols[0]})`);
        }
      }
    } catch (e: any) {
      errors.push(`Baris ${i + 1}: ${e?.message || 'Gagal memproses baris'}`);
    }
  }

  return { items, errors, totalParsed: items.length };
}

// -----------------------------------------------------------------
// 5. HELPER FUNCTIONS
// -----------------------------------------------------------------
export function getProvinceByCode(code: string): ProvinceItem | undefined {
  const name = PROVINCES_MAP[code];
  return name ? { code, name } : undefined;
}

export function getRegencyByCode(code: string): RegencyItem | undefined {
  return REGENCIES_MAP[code];
}

export function getDistrictByCode(code: string): DistrictItem | undefined {
  const customMatch = getCustomDistricts().find((d) => d.code === code);
  if (customMatch) return customMatch;
  const masterMatch = getMasterDistrictByCode(code);
  if (masterMatch) return masterMatch;
  if (DISTRICTS_MAP[code]) return DISTRICTS_MAP[code];
  if (code.length >= 7) {
    const regCode = code.slice(0, 4);
    const dist3 = code.slice(4);
    const regList = getDistrictsByRegency(regCode);
    return regList.find((d) => d.code === code || d.districtCode3 === dist3);
  }
  return undefined;
}

export function getRegenciesByProvince(provCode: string): RegencyItem[] {
  return REGENCIES.filter((r) => r.provinceCode === provCode);
}

export function getDistrictsByRegency(regencyCode: string): DistrictItem[] {
  // 1. Check custom/imported districts first
  const custom = getCustomDistricts(regencyCode);
  if (custom.length > 0) {
    return custom;
  }

  // 2. Query Master Database of 6,843 Kecamatan se-Indonesia
  const masterList = getMasterDistrictsByRegency(regencyCode);
  if (masterList.length > 0) {
    return masterList;
  }

  // 3. Fallback to sample districts if any
  const found = SAMPLE_DISTRICTS.filter((d) => d.regencyCode === regencyCode);
  if (found.length > 0) {
    return found;
  }
  // Standard BPS 3-digit kecamatan fallback for any regency in 514 regencies
  const regency = REGENCIES_MAP[regencyCode];
  const baseName = regency ? regency.name.replace(/^(KABUPATEN|KOTA)\s+/i, '') : 'Wilayah';
  return [
    { code: `${regencyCode}010`, regencyCode, districtCode3: '010', name: `${baseName} Kota` },
    { code: `${regencyCode}020`, regencyCode, districtCode3: '020', name: `${baseName} Barat` },
    { code: `${regencyCode}030`, regencyCode, districtCode3: '030', name: `${baseName} Timur` },
    { code: `${regencyCode}040`, regencyCode, districtCode3: '040', name: `${baseName} Selatan` },
    { code: `${regencyCode}050`, regencyCode, districtCode3: '050', name: `${baseName} Utara` },
    { code: `${regencyCode}060`, regencyCode, districtCode3: '060', name: `${baseName} Tengah` },
  ];
}

export function resolveDistrictName(regencyCode?: string, districtCode3?: string): string {
  if (!districtCode3) return '';
  const cleanCode = districtCode3.toString().trim();
  const ccc3 = cleanCode.length >= 3 ? cleanCode.slice(-3) : cleanCode.padStart(3, '0');

  if (regencyCode) {
    const cleanReg = regencyCode.toString().trim();
    const list = getDistrictsByRegency(cleanReg);
    const item = list.find(
      (d) =>
        d.code === cleanCode ||
        d.districtCode3 === cleanCode ||
        d.districtCode3 === ccc3 ||
        d.code === `${cleanReg}${ccc3}`
    );
    if (item) return item.name;
  }

  const customMatch = getCustomDistricts().find(
    (d) => d.code === cleanCode || d.districtCode3 === cleanCode || d.districtCode3 === ccc3
  );
  if (customMatch) return customMatch.name;

  const item = SAMPLE_DISTRICTS.find(
    (d) => d.code === cleanCode || d.districtCode3 === cleanCode || d.districtCode3 === ccc3
  );
  return item ? item.name : `Kecamatan ${cleanCode}`;
}


