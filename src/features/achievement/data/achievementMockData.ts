/**
 * SPWN Apps 2.0 - Member Achievement Mock Data
 * Location: src/features/achievement/data/achievementMockData.ts
 * -------------------------------------------------------------
 * Data read-model otentik untuk preview & testing:
 * 1. Anggota Berprestasi (Fajar Nugraha Wijaya - Level Madya)
 * 2. Anggota Baru (Empty State - Belum Ada Pencapaian)
 */

import {
  MemberAchievementProfile,
  MemberSkkItem,
  MemberBadgeItem,
  MemberActivityItem
} from '../../../types/achievement';

export const MOCK_ACTIVE_ACHIEVEMENT_PROFILE: MemberAchievementProfile = {
  member: {
    memberId: 'SPWN.32.01.2024.089',
    nama: 'Fajar Nugraha Wijaya',
    nomorKta: 'SPWN.32.01.2024.089',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Gugus Depan SMAN 1 Bogor - Pangkalan SAKA Pariwisata',
    kwarcab: 'Kota Bogor',
    kwarda: 'Jawa Barat',
    kridaUtamaId: 'pemandu',
    kridaUtamaNama: 'Krida Pemandu Wisata',
    level: 'MADYA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '15 Januari 2024'
  },
  summary: {
    totalSkkAvailable: 23,
    completedSkk: 12,
    inProgressSkk: 4,
    notStartedSkk: 7,
    progressPercent: 52.2,
    totalBadges: 4,
    totalActivities: 4
  }
};

export const MOCK_ACTIVE_SKK_ITEMS: MemberSkkItem[] = [
  // Krida Pemandu Wisata (6 SKK)
  {
    skkCode: 'SKK-PW-01',
    nama: 'Pemandu Ekowisata',
    kridaId: 'pemandu',
    kridaNama: 'Krida Pemandu Wisata',
    status: 'COMPLETED',
    levelAchieved: 'MADYA',
    startedAt: '2024-02-10',
    completedAt: '2024-05-20',
    progressPercent: 100,
    score: 92,
    evaluatorNama: 'Kak Suryo Pratama, S.ST.Par',
    description: 'Kecakapan memandu wisatawan di kawasan konservasi dan geopark dengan prinsip lestari.'
  },
  {
    skkCode: 'SKK-PW-02',
    nama: 'Pemandu Wisata Budaya & Cagar Budaya',
    kridaId: 'pemandu',
    kridaNama: 'Krida Pemandu Wisata',
    status: 'COMPLETED',
    levelAchieved: 'PURWA',
    startedAt: '2024-03-01',
    completedAt: '2024-06-15',
    progressPercent: 100,
    score: 88,
    evaluatorNama: 'Kak Bambang Soedirman',
    description: 'Penguasaan narasi sejarah, etika keraton, dan interpretasi warisan budaya lokal.'
  },
  {
    skkCode: 'SKK-PW-03',
    nama: 'Pemandu Wisata Petualangan & Trekking',
    kridaId: 'pemandu',
    kridaNama: 'Krida Pemandu Wisata',
    status: 'COMPLETED',
    levelAchieved: 'MADYA',
    startedAt: '2024-04-12',
    completedAt: '2024-08-30',
    progressPercent: 100,
    score: 95,
    evaluatorNama: 'Kak Dewi Anjani',
    description: 'Manajemen navigasi darat, keselamatan jalur curam, dan tanggap darurat kepanduan.'
  },
  {
    skkCode: 'SKK-PW-04',
    nama: 'Pemandu Wisata Bahari & Pesisir',
    kridaId: 'pemandu',
    kridaNama: 'Krida Pemandu Wisata',
    status: 'IN_PROGRESS',
    levelAchieved: 'PURWA',
    startedAt: '2025-01-10',
    completedAt: null,
    progressPercent: 65,
    score: 78,
    evaluatorNama: 'Kak Bambang Soedirman',
    description: 'Kecakapan interpretasi ekosistem terumbu karang dan keselamatan bahari.'
  },
  {
    skkCode: 'SKK-PW-05',
    nama: 'Pemandu Wisata Perkotaan (City Tour)',
    kridaId: 'pemandu',
    kridaNama: 'Krida Pemandu Wisata',
    status: 'COMPLETED',
    levelAchieved: 'PURWA',
    startedAt: '2024-07-01',
    completedAt: '2024-09-10',
    progressPercent: 100,
    score: 85,
    evaluatorNama: 'Kak Suryo Pratama',
    description: 'Keterampilan public speaking rute heritage perkotaan dan bus wisata.'
  },
  {
    skkCode: 'SKK-PW-06',
    nama: 'Pemandu Wisata Agro & Kebun Raya',
    kridaId: 'pemandu',
    kridaNama: 'Krida Pemandu Wisata',
    status: 'COMPLETED',
    levelAchieved: 'PURWA',
    startedAt: '2024-08-05',
    completedAt: '2024-11-12',
    progressPercent: 100,
    score: 90,
    evaluatorNama: 'Kak Siti Nurhaliza',
    description: 'Keterampilan edukasi botani, perkebunan teh, dan budidaya tanaman endemik.'
  },

  // Krida Penyuluh Wisata (5 SKK)
  {
    skkCode: 'SKK-PL-01',
    nama: 'Penyuluh Sadar Wisata & Sapta Pesona',
    kridaId: 'penyuluh',
    kridaNama: 'Krida Penyuluh Wisata',
    status: 'COMPLETED',
    levelAchieved: 'MADYA',
    startedAt: '2024-02-15',
    completedAt: '2024-04-25',
    progressPercent: 100,
    score: 94,
    evaluatorNama: 'Kak Siti Nurhaliza',
    description: 'Sosialisasi prinsip Aman, Tertib, Bersih, Sejuk, Indah, Ramah, Kenangan bagi masyarakat.'
  },
  {
    skkCode: 'SKK-PL-02',
    nama: 'Penyuluh Kebersihan & Pengelolaan Sampah Wisata',
    kridaId: 'penyuluh',
    kridaNama: 'Krida Penyuluh Wisata',
    status: 'COMPLETED',
    levelAchieved: 'PURWA',
    startedAt: '2024-06-01',
    completedAt: '2024-08-10',
    progressPercent: 100,
    score: 87,
    evaluatorNama: 'Kak Siti Nurhaliza',
    description: 'Kampanye bebas sampah plastik sekali pakai di destinasi pariwisata.'
  },
  {
    skkCode: 'SKK-PL-03',
    nama: 'Penyuluh CHSE & Keamanan Destinasi',
    kridaId: 'penyuluh',
    kridaNama: 'Krida Penyuluh Wisata',
    status: 'COMPLETED',
    levelAchieved: 'PURWA',
    startedAt: '2024-09-01',
    completedAt: '2024-10-30',
    progressPercent: 100,
    score: 91,
    evaluatorNama: 'Kak Bambang Soedirman',
    description: 'Penerapan standar Cleanliness, Health, Safety, Environment Sustainability.'
  },
  {
    skkCode: 'SKK-PL-04',
    nama: 'Penyuluh Digital Marketing & Konten Wisata',
    kridaId: 'penyuluh',
    kridaNama: 'Krida Penyuluh Wisata',
    status: 'IN_PROGRESS',
    levelAchieved: 'PURWA',
    startedAt: '2025-02-01',
    completedAt: null,
    progressPercent: 40,
    score: 75,
    evaluatorNama: 'Kak Fauzan Wicaksono',
    description: 'Edukasi storytelling destinasi melalui media sosial dan live broadcast desa.'
  },
  {
    skkCode: 'SKK-PL-05',
    nama: 'Penyuluh Perlindungan Flora & Fauna Langka',
    kridaId: 'penyuluh',
    kridaNama: 'Krida Penyuluh Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    startedAt: null,
    completedAt: null,
    progressPercent: 0,
    description: 'Advokasi konservasi satwa liar dan larangan perburuan di area wisata alam.'
  },

  // Krida MICE (6 SKK)
  {
    skkCode: 'SKK-MC-01',
    nama: 'Pengatur Acara & Protokoler SAKA',
    kridaId: 'mice',
    kridaNama: 'Krida Pertemuan, Perjalanan Insentif, Konvensi dan Pameran (MICE)',
    status: 'COMPLETED',
    levelAchieved: 'MADYA',
    startedAt: '2024-05-01',
    completedAt: '2024-07-20',
    progressPercent: 100,
    score: 96,
    evaluatorNama: 'Kak Suryo Pratama',
    description: 'Tata laksana protokoler resmi perkemahan, simposium, dan kunjungan kenegaraan.'
  },
  {
    skkCode: 'SKK-MC-02',
    nama: 'Logistik & Manajemen Venue Pameran',
    kridaId: 'mice',
    kridaNama: 'Krida Pertemuan, Perjalanan Insentif, Konvensi dan Pameran (MICE)',
    status: 'COMPLETED',
    levelAchieved: 'PURWA',
    startedAt: '2024-08-10',
    completedAt: '2024-11-05',
    progressPercent: 100,
    score: 89,
    evaluatorNama: 'Kak Budi Santoso',
    description: 'Perencanaan floor plan stan UMKM, tata panggung, dan jalur evakuasi penonton.'
  },
  {
    skkCode: 'SKK-MC-03',
    nama: 'Registrasi & Layanan Peserta Konvensi',
    kridaId: 'mice',
    kridaNama: 'Krida Pertemuan, Perjalanan Insentif, Konvensi dan Pameran (MICE)',
    status: 'COMPLETED',
    levelAchieved: 'PURWA',
    startedAt: '2024-10-01',
    completedAt: '2024-12-10',
    progressPercent: 100,
    score: 88,
    evaluatorNama: 'Kak Suryo Pratama',
    description: 'Sistem check-in QR Code, kit peserta, dan hospitality tamu delegasi mancanegara.'
  },
  {
    skkCode: 'SKK-MC-04',
    nama: 'Penata Acara Perjalanan Insentif',
    kridaId: 'mice',
    kridaNama: 'Krida Pertemuan, Perjalanan Insentif, Konvensi dan Pameran (MICE)',
    status: 'IN_PROGRESS',
    levelAchieved: 'PURWA',
    startedAt: '2025-01-15',
    completedAt: null,
    progressPercent: 50,
    score: 80,
    evaluatorNama: 'Kak Dewi Anjani',
    description: 'Merancang paket reward perjalanan korporat bermakna sosial dan budaya.'
  },
  {
    skkCode: 'SKK-MC-05',
    nama: 'Teknisi Audio Visual & Tata Suara Event',
    kridaId: 'mice',
    kridaNama: 'Krida Pertemuan, Perjalanan Insentif, Konvensi dan Pameran (MICE)',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    startedAt: null,
    completedAt: null,
    progressPercent: 0,
    description: 'Pengoperasian mixer suara lapangan, lighting panggung, dan proyektor multimedia.'
  },
  {
    skkCode: 'SKK-MC-06',
    nama: 'Pemandu Malam Keakraban & Api Unggun Wisata',
    kridaId: 'mice',
    kridaNama: 'Krida Pertemuan, Perjalanan Insentif, Konvensi dan Pameran (MICE)',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    startedAt: null,
    completedAt: null,
    progressPercent: 0,
    description: 'Merancang dinamika api unggun, refleksi kebangsaan, dan atraksi pentas seni.'
  },

  // Krida Kuliner Wisata (6 SKK)
  {
    skkCode: 'SKK-KL-01',
    nama: 'Higiene & Sanitasi Makanan Tradisional',
    kridaId: 'kuliner',
    kridaNama: 'Krida Kuliner Wisata',
    status: 'COMPLETED',
    levelAchieved: 'PURWA',
    startedAt: '2024-04-01',
    completedAt: '2024-06-30',
    progressPercent: 100,
    score: 93,
    evaluatorNama: 'Kak Budi Santoso',
    description: 'Standar kebersihan penjamah makanan, penyimpanan bahan segar, dan sertifikasi halal.'
  },
  {
    skkCode: 'SKK-KL-02',
    nama: 'Pengolah Hidangan Masakan Khas Daerah',
    kridaId: 'kuliner',
    kridaNama: 'Krida Kuliner Wisata',
    status: 'IN_PROGRESS',
    levelAchieved: 'PURWA',
    startedAt: '2025-02-10',
    completedAt: null,
    progressPercent: 30,
    score: 72,
    evaluatorNama: 'Kak Budi Santoso',
    description: 'Teknik memasak bumbu rempah nusantara dan penyajian tumpeng upacara adat.'
  },
  {
    skkCode: 'SKK-KL-03',
    nama: 'Penyaji & Hospitality Meja Makan Nusantara',
    kridaId: 'kuliner',
    kridaNama: 'Krida Kuliner Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    startedAt: null,
    completedAt: null,
    progressPercent: 0,
    description: 'Tata hidang jamuan kehormatan dengan perangkat saji tradisional gerabah dan daun.'
  },
  {
    skkCode: 'SKK-KL-04',
    nama: 'Peramu Minuman Rempah & Jamu Sehat',
    kridaId: 'kuliner',
    kridaNama: 'Krida Kuliner Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    startedAt: null,
    completedAt: null,
    progressPercent: 0,
    description: 'Pembuatan wedang jahe, bajigur, bandrek, dan teh rempah selamat datang wisatawan.'
  },
  {
    skkCode: 'SKK-KL-05',
    nama: 'Pemasar & Kemasan Oleh-Oleh Ramah Lingkungan',
    kridaId: 'kuliner',
    kridaNama: 'Krida Kuliner Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    startedAt: null,
    completedAt: null,
    progressPercent: 0,
    description: 'Desain besek bambu, pelabelan narasi produk kriya, dan barcode informasi.'
  },
  {
    skkCode: 'SKK-KL-06',
    nama: 'Kurator Kuliner Warisan Budaya Takbenda',
    kridaId: 'kuliner',
    kridaNama: 'Krida Kuliner Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    startedAt: null,
    completedAt: null,
    progressPercent: 0,
    description: 'Dokumentasi resep leluhur dan pengajuan status warisan gastronomi daerah.'
  }
];

export const MOCK_ACTIVE_BADGES: MemberBadgeItem[] = [
  {
    id: 'badge-01',
    badgeCode: 'BDG-TOUR-LEAD-2024',
    badgeName: 'Pemandu Unggul 2024',
    category: 'Kepemimpinan Pemanduan',
    description: 'Dianugerahkan atas keberhasilan memandu lebih dari 20 ekspedisi kepariwisataan alam dengan rekam jejak keselamatan sempurna (Zero Incident).',
    icon: 'Compass',
    color: '#0066B3',
    earnedAt: '2024-11-20'
  },
  {
    id: 'badge-02',
    badgeCode: 'BDG-SAPTA-PESONA-ADV',
    badgeName: 'Duta Sapta Pesona',
    category: 'Sadar Wisata',
    description: 'Pencapaian luar biasa dalam menggerakkan aksi bersih destinasi dan edukasi Sapta Pesona di 5 Desa Wisata binaan Kwarda Jabar.',
    icon: 'Award',
    color: '#10B981',
    earnedAt: '2024-09-15'
  },
  {
    id: 'badge-03',
    badgeCode: 'BDG-EXPEDITION-CILETUH',
    badgeName: 'Ekspedisi Geopark Ciletuh',
    category: 'Jelajah Alam',
    description: 'Menyelesaikan lintasan geologi 45 km Ciletuh-Palabuhanratu UNESCO Global Geopark dan mendokumentasikan keanekaragaman hayati lokal.',
    icon: 'Mountain',
    color: '#F59E0B',
    earnedAt: '2024-07-28'
  },
  {
    id: 'badge-04',
    badgeCode: 'BDG-CULTURE-HERITAGE',
    badgeName: 'Penjaga Cagar Budaya',
    category: 'Kearifan Lokal',
    description: 'Sertifikasi apresiasi atas dedikasi konservasi cagar budaya dan interpretasi sejarah di Kawasan Keraton Cirebon & Bandung.',
    icon: 'ShieldCheck',
    color: '#6366F1',
    earnedAt: '2024-12-05'
  }
];

export const MOCK_ACTIVE_ACTIVITIES: MemberActivityItem[] = [
  {
    id: 'act-01',
    activityName: 'Pemandu Delegasi Hari Pariwisata Dunia (WTD) 2024',
    date: '27 September 2024',
    location: 'Bandung & Kawasan Heritage Asia Afrika',
    role: 'Pemandu Wisata Lapangan (Tour Leader)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    referenceUrl: 'https://saka-pariwisata.org/agenda/wtd-2024'
  },
  {
    id: 'act-02',
    activityName: 'Kemah Bhakti SAKA Pariwisata Jawa Barat',
    date: '12 - 14 Agustus 2024',
    location: 'Bumi Perkemahan Mandalawangi, Cibodas',
    role: 'Koordinator MICE & Protokoler',
    thumbnailUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&auto=format&fit=crop&q=80',
    referenceUrl: 'https://saka-pariwisata.org/agenda/kemah-bhakti-2024'
  },
  {
    id: 'act-03',
    activityName: 'Aksi Bersih Destinasi & Edukasi Sapta Pesona',
    date: '10 Juni 2024',
    location: 'Desa Wisata Alamendah, Ciwidey',
    role: 'Fasilitator Penyuluhan Pengunjung',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    referenceUrl: 'https://saka-pariwisata.org/agenda/sapta-pesona-ciwidey'
  },
  {
    id: 'act-04',
    activityName: 'Eksplorasi Jalur Geowisata Kawah Tangkuban Parahu',
    date: '15 Maret 2024',
    location: 'TWA Tangkuban Parahu, Subang',
    role: 'Petugas Pengamat Trek & Navigasi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    referenceUrl: 'https://saka-pariwisata.org/agenda/geowisata-tangkuban'
  }
];

/**
 * Data Anggota Baru (Empty State)
 * Untuk menguji tampilan saat anggota belum menyelesaikan SKK apapun
 */
export const MOCK_EMPTY_ACHIEVEMENT_PROFILE: MemberAchievementProfile = {
  member: {
    memberId: 'SPWN.31.02.2026.012',
    nama: 'Bagas Aditya Pratama',
    nomorKta: 'SPWN.31.02.2026.012',
    fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'SMKN 57 Jakarta (Pariwisata & Perhotelan)',
    kwarcab: 'Jakarta Selatan',
    kwarda: 'DKI Jakarta',
    kridaUtamaId: 'pemandu',
    kridaUtamaNama: 'Krida Pemandu Wisata',
    level: 'PURWA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '20 September 2026'
  },
  summary: {
    totalSkkAvailable: 23,
    completedSkk: 0,
    inProgressSkk: 0,
    notStartedSkk: 23,
    progressPercent: 0,
    totalBadges: 0,
    totalActivities: 0
  }
};

export const MOCK_EMPTY_SKK_ITEMS: MemberSkkItem[] = [
  {
    skkCode: 'SKK-PW-01',
    nama: 'Pemandu Ekowisata',
    kridaId: 'pemandu',
    kridaNama: 'Krida Pemandu Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    progressPercent: 0,
    description: 'Kecakapan memandu wisatawan di kawasan konservasi dan geopark dengan prinsip lestari.'
  },
  {
    skkCode: 'SKK-PW-02',
    nama: 'Pemandu Wisata Budaya & Cagar Budaya',
    kridaId: 'pemandu',
    kridaNama: 'Krida Pemandu Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    progressPercent: 0,
    description: 'Penguasaan narasi sejarah, etika keraton, dan interpretasi warisan budaya lokal.'
  },
  {
    skkCode: 'SKK-PL-01',
    nama: 'Penyuluh Sadar Wisata & Sapta Pesona',
    kridaId: 'penyuluh',
    kridaNama: 'Krida Penyuluh Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    progressPercent: 0,
    description: 'Sosialisasi prinsip Aman, Tertib, Bersih, Sejuk, Indah, Ramah, Kenangan.'
  },
  {
    skkCode: 'SKK-MC-01',
    nama: 'Pengatur Acara & Protokoler SAKA',
    kridaId: 'mice',
    kridaNama: 'Krida MICE',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    progressPercent: 0,
    description: 'Tata laksana protokoler resmi perkemahan dan event MICE.'
  },
  {
    skkCode: 'SKK-KL-01',
    nama: 'Higiene & Sanitasi Makanan Tradisional',
    kridaId: 'kuliner',
    kridaNama: 'Krida Kuliner Wisata',
    status: 'NOT_STARTED',
    levelAchieved: 'PURWA',
    progressPercent: 0,
    description: 'Standar kebersihan penjamah makanan dan pengolahan higienis.'
  }
];
