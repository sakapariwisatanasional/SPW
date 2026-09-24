/**
 * SPWN Apps 2.0 - National Member Achievement Data Across All Regions
 * Location: src/features/achievement/data/nationalAchievementMembers.ts
 * --------------------------------------------------------------------
 * Data capaian 23 SKK, matriks 4 krida, dan riwayat kegiatan anggota
 * SAKA Pariwisata dari berbagai Kwartir Daerah se-Indonesia untuk Dashboard SuperAdmin.
 */

import {
  MemberLevel,
  SkkStatusType,
  MemberSkkItem,
  MemberBadgeItem,
  MemberActivityItem,
} from '../../../types/achievement';

export interface NationalMemberAchievement {
  id: string;
  memberId: string;
  nama: string;
  nomorKta: string;
  full_name?: string;
  nama_lengkap?: string;
  no_kta?: string;
  nomor_kta?: string;
  fotoUrl: string;
  pangkalan: string;
  kwarcab: string;
  kwarda: string;
  kridaUtamaId: 'pemandu' | 'penyuluh' | 'mice' | 'kuliner';
  kridaUtamaNama: string;
  tingkatan: string;
  level: MemberLevel;
  statusKta: 'ACTIVE' | 'PENDING' | 'REVIEWED_VERIFIED';
  tanggalBergabung: string;
  summary: {
    totalSkkAvailable: number;
    completedSkk: number;
    inProgressSkk: number;
    notStartedSkk: number;
    progressPercent: number;
    totalBadges: number;
    totalActivities: number;
    averageScore?: number;
  };
  skkMatrix: MemberSkkItem[];
  activities: MemberActivityItem[];
  badges: MemberBadgeItem[];
}

// 23 SKK Master Generator Helper
export function generate23SkkMatrix(
  pemanduDone: number,
  penyuluhDone: number,
  miceDone: number,
  kulinerDone: number,
  memberLevel: MemberLevel,
  evaluator: string = 'Kak Suryo Pratama'
): MemberSkkItem[] {
  // Krida Pemandu (6 SKK)
  const pemanduSKK = [
    { code: 'SKK-PW-01', name: 'Pemandu Ekowisata', desc: 'Memandu wisatawan di kawasan konservasi, geopark, dan taman nasional.' },
    { code: 'SKK-PW-02', name: 'Pemandu Wisata Budaya & Cagar Budaya', desc: 'Penguasaan narasi sejarah, etika keraton, dan interpretasi warisan budaya.' },
    { code: 'SKK-PW-03', name: 'Pemandu Wisata Petualangan & Trekking', desc: 'Navigasi darat, keselamatan jalur curam, dan tanggap darurat kepanduan.' },
    { code: 'SKK-PW-04', name: 'Pemandu Wisata Bahari & Pesisir', desc: 'Interpretasi ekosistem terumbu karang dan keselamatan bahari.' },
    { code: 'SKK-PW-05', name: 'Pemandu Wisata Perkotaan (City Tour)', desc: 'Public speaking rute heritage perkotaan dan pengelolaan bus wisata.' },
    { code: 'SKK-PW-06', name: 'Pemandu Wisata Agro & Kebun Raya', desc: 'Edukasi botani, perkebunan teh, dan budidaya tanaman endemik.' },
  ];

  // Krida Penyuluh (5 SKK)
  const penyuluhSKK = [
    { code: 'SKK-PL-01', name: 'Penyuluh Sadar Wisata & Sapta Pesona', desc: 'Sosialisasi prinsip Aman, Tertib, Bersih, Sejuk, Indah, Ramah, Kenangan.' },
    { code: 'SKK-PL-02', name: 'Penyuluh Kebersihan & Sampah Wisata', desc: 'Kampanye bebas sampah plastik dan kelestarian ekosistem destinasi.' },
    { code: 'SKK-PL-03', name: 'Penyuluh CHSE & Keamanan Destinasi', desc: 'Standar Cleanliness, Health, Safety, Environment Sustainability.' },
    { code: 'SKK-PL-04', name: 'Penyuluh Digital Marketing & Konten Wisata', desc: 'Storytelling destinasi melalui media sosial dan live promosi desa.' },
    { code: 'SKK-PL-05', name: 'Penyuluh Perlindungan Flora & Fauna Langka', desc: 'Advokasi konservasi satwa liar dan larangan perburuan di area wisata.' },
  ];

  // Krida Mice & Event (6 SKK)
  const miceSKK = [
    { code: 'SKK-MC-01', name: 'Pengatur Acara & Protokoler SAKA', desc: 'Tata laksana protokoler perkemahan, simposium, dan kunjungan resmi.' },
    { code: 'SKK-MC-02', name: 'Logistik & Manajemen Venue Pameran', desc: 'Perencanaan floor plan stan UMKM, tata panggung, dan jalur evakuasi.' },
    { code: 'SKK-MC-03', name: 'Registrasi & Layanan Peserta Konvensi', desc: 'Sistem check-in QR Code, kit peserta, dan hospitality tamu delegasi.' },
    { code: 'SKK-MC-04', name: 'Penata Acara Perjalanan Insentif', desc: 'Merancang paket reward perjalanan korporat bernilai budaya.' },
    { code: 'SKK-MC-05', name: 'Teknisi Audio Visual & Tata Suara Event', desc: 'Pengoperasian mixer suara lapangan, lighting panggung, dan multimedia.' },
    { code: 'SKK-MC-06', name: 'Pemandu Malam Keakraban & Api Unggun Wisata', desc: 'Dinamika api unggun, refleksi kebangsaan, dan atraksi pentas seni.' },
  ];

  // Krida Kuliner & Cinderamata (6 SKK)
  const kulinerSKK = [
    { code: 'SKK-KL-01', name: 'Higiene & Sanitasi Makanan Tradisional', desc: 'Standar kebersihan penjamah makanan, bahan segar, dan sertifikasi halal.' },
    { code: 'SKK-KL-02', name: 'Pengolah Hidangan Masakan Khas Daerah', desc: 'Teknik memasak bumbu rempah nusantara dan sajian tumpeng upacara adat.' },
    { code: 'SKK-KL-03', name: 'Penyaji & Hospitality Meja Makan Nusantara', desc: 'Tata hidang jamuan kehormatan dengan perangkat saji tradisional gerabah.' },
    { code: 'SKK-KL-04', name: 'Peramu Minuman Rempah & Jamu Sehat', desc: 'Pembuatan wedang jahe, bajigur, bandrek, dan teh rempah sambutan.' },
    { code: 'SKK-KL-05', name: 'Pemasar & Kemasan Oleh-Oleh Ramah Lingkungan', desc: 'Desain besek bambu, pelabelan narasi produk kriya, dan barcode info.' },
    { code: 'SKK-KL-06', name: 'Kurator Kuliner Warisan Budaya Takbenda', desc: 'Dokumentasi resep leluhur dan pengajuan status warisan gastronomi daerah.' },
  ];

  const buildItems = (
    list: Array<{ code: string; name: string; desc: string }>,
    doneCount: number,
    kridaId: string,
    kridaNama: string
  ): MemberSkkItem[] => {
    return list.map((item, index) => {
      let status: SkkStatusType = 'NOT_STARTED';
      let progress = 0;
      let score: number | undefined = undefined;
      let completedAt: string | null = null;
      let startedAt: string | null = null;

      if (index < doneCount) {
        status = 'COMPLETED';
        progress = 100;
        score = 85 + ((index * 3) % 13);
        completedAt = '2024-11-20';
        startedAt = '2024-03-10';
      } else if (index === doneCount) {
        status = 'IN_PROGRESS';
        progress = 55;
        score = 76;
        startedAt = '2025-01-15';
      }

      return {
        skkCode: item.code,
        nama: item.name,
        kridaId,
        kridaNama,
        status,
        levelAchieved: status === 'COMPLETED' ? memberLevel : 'PURWA',
        startedAt,
        completedAt,
        progressPercent: progress,
        score,
        evaluatorNama: evaluator,
        description: item.desc,
      };
    });
  };

  return [
    ...buildItems(pemanduSKK, pemanduDone, 'pemandu', 'Krida Pemandu'),
    ...buildItems(penyuluhSKK, penyuluhDone, 'penyuluh', 'Krida Penyuluh'),
    ...buildItems(miceSKK, miceDone, 'mice', 'Krida Mice & Event'),
    ...buildItems(kulinerSKK, kulinerDone, 'kuliner', 'Krida Kuliner & Cinderamata'),
  ];
}

// Master Anggota Seluruh Wilayah Lengkap dengan Kemajuan, Matrix & Riwayat Kegiatan
export const NATIONAL_ACHIEVEMENT_MEMBERS: NationalMemberAchievement[] = [
  {
    id: 'NAT-MEM-001',
    memberId: '00.000001',
    nama: 'Dr. H. Bambang Soedirman, M.Par',
    nomorKta: '00.000001',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Kwarnas Gerakan Pramuka Pusat - Jakarta',
    kwarcab: 'Kwartir Nasional',
    kwarda: 'DKI JAKARTA',
    kridaUtamaId: 'pemandu',
    kridaUtamaNama: 'Krida Pemandu',
    tingkatan: 'Pamong Saka',
    level: 'UTAMA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '15 Januari 2023',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 21,
      inProgressSkk: 2,
      notStartedSkk: 0,
      progressPercent: 91.3,
      totalBadges: 7,
      totalActivities: 8,
      averageScore: 94.6,
    },
    skkMatrix: generate23SkkMatrix(6, 5, 5, 5, 'UTAMA', 'Kak Prof. Azis Suhendar'),
    activities: [
      {
        id: 'ACT-001',
        activityName: 'Simposium Nasional Pariwisata Berkelanjutan & Sadar Wisata 2026',
        date: '10 - 12 Februari 2026',
        location: 'Jakarta Convention Center (JCC), Senayan, Jakarta Pusat',
        role: 'Keynote Speaker & Dewan Pengarah SAKA',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'ACT-002',
        activityName: 'Kemah Bakti Sapta Pesona Tingkat Nasional di Kepulauan Seribu',
        date: '20 - 23 November 2025',
        location: 'Pulau Pari, Kepulauan Seribu, DKI Jakarta',
        role: 'Pamong Pendamping Kontingen Nasional',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'ACT-003',
        activityName: 'Diklat Instruktur Nasional Krida Pemandu & CHSE Wisata',
        date: '14 - 18 Agustus 2025',
        location: 'Pusdiklatnas Cibubur, Jakarta Timur',
        role: 'Master Trainer & Penguji SKK Nasional',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'ACT-004',
        activityName: 'Festival Budaya Betawi & Eksplorasi Heritage Kota Tua',
        date: '22 Juni 2025',
        location: 'Taman Fatahillah, Kota Tua Jakarta',
        role: 'Koordinator Pemanduan Wisata Dwibahasa',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b1', badgeCode: 'BDG-UTAMA', badgeName: 'Lencana Saka Utama', category: 'Tingkatan', description: 'Tingkatan tertinggi kecakapan SAKA Pariwisata', icon: 'Award', color: '#6A1B9A', earnedAt: 'Jan 2026' },
      { id: 'b2', badgeCode: 'BDG-PEMANDU-MAS', badgeName: 'Pemandu Ahli Nusantara', category: 'Krida', description: 'Penguasaan 6 SKK Pemandu Paripurna', icon: 'Compass', color: '#009B4D', earnedAt: 'Des 2025' },
      { id: 'b3', badgeCode: 'BDG-SAPTA-PESONA', badgeName: 'Pelopor Sapta Pesona', category: 'Karakter', description: 'Dedikasi teladan aksi sadar wisata nasional', icon: 'ShieldCheck', color: '#0066B3', earnedAt: 'Nov 2025' },
    ],
  },
  {
    id: 'NAT-MEM-002',
    memberId: '00.32.04.190.000123',
    nama: 'Fajar Nugraha Wijaya',
    nomorKta: '00.32.04.190.000123',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan Saka Pariwisata Kab. Bandung',
    kwarcab: 'KABUPATEN BANDUNG',
    kwarda: 'JAWA BARAT',
    kridaUtamaId: 'pemandu',
    kridaUtamaNama: 'Krida Pemandu',
    tingkatan: 'Anggota',
    level: 'MADYA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '10 Februari 2024',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 12,
      inProgressSkk: 4,
      notStartedSkk: 7,
      progressPercent: 52.2,
      totalBadges: 4,
      totalActivities: 5,
      averageScore: 89.2,
    },
    skkMatrix: generate23SkkMatrix(4, 3, 3, 2, 'MADYA', 'Kak Dr. H. Bambang Soedirman'),
    activities: [
      {
        id: 'ACT-005',
        activityName: 'Aksi Bersih Kawasan Ekowisata Kawah Putih Ciwidey',
        date: '15 - 16 Januari 2026',
        location: 'Kawah Putih, Ciwidey, Kabupaten Bandung',
        role: 'Ketua Tim Kampanye Bebas Sampah Plastik',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'ACT-006',
        activityName: 'Eksplorasi Perkebunan Teh Rancabali & Guiding Dwibahasa',
        date: '08 Oktober 2025',
        location: 'Perkebunan Teh Rancabali, Ciwidey, Jawa Barat',
        role: 'Pemandu Wisata Agro & Interpretasi Alam',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'ACT-007',
        activityName: 'Pentas Seni Angklung & Kuliner Priangan Soreang',
        date: '14 Juli 2025',
        location: 'Gedung Budaya Sabilulungan, Soreang, Bandung',
        role: 'Protokoler Acara & LO Delegasi Kwarda',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b4', badgeCode: 'BDG-MADYA', badgeName: 'Lencana Madya', category: 'Tingkatan', description: 'Tingkatan menengah SKK Pariwisata', icon: 'Award', color: '#0066B3', earnedAt: 'Agt 2025' },
      { id: 'b5', badgeCode: 'BDG-EKOWISATA', badgeName: 'Spesialis Ekowisata', category: 'Krida', description: 'Lulus SKK Pemandu Ekowisata Nilai A', icon: 'Compass', color: '#009B4D', earnedAt: 'Mei 2025' },
    ],
  },
  {
    id: 'NAT-MEM-003',
    memberId: '00.32.01.010.000124',
    nama: 'Annisa Rahmawati Putri',
    nomorKta: '00.32.01.010.000124',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan SMAN 1 Cibinong',
    kwarcab: 'KABUPATEN BOGOR',
    kwarda: 'JAWA BARAT',
    kridaUtamaId: 'penyuluh',
    kridaUtamaNama: 'Krida Penyuluh',
    tingkatan: 'Dewan Saka',
    level: 'MADYA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '01 Maret 2024',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 14,
      inProgressSkk: 3,
      notStartedSkk: 6,
      progressPercent: 60.8,
      totalBadges: 5,
      totalActivities: 5,
      averageScore: 91.5,
    },
    skkMatrix: generate23SkkMatrix(3, 5, 3, 3, 'MADYA', 'Kak Siti Nurhaliza Putri'),
    activities: [
      {
        id: 'ACT-008',
        activityName: 'Kampanye Sadar Wisata & Edukasi CHSE Desa Wisata Malasari',
        date: '12 - 14 Januari 2026',
        location: 'Desa Wisata Malasari, Nanggung, Kab. Bogor',
        role: 'Koordinator Sosialisasi Sapta Pesona Warga',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'ACT-009',
        activityName: 'Pemberdayaan UMKM Kriya Bambu & Cinderamata Cibinong',
        date: '25 September 2025',
        location: 'Gedung Kesenian Kabupaten Bogor',
        role: 'Fasilitator Kurasi Produk Kemasan Ramah Lingkungan',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b6', badgeCode: 'BDG-PENYULUH-UTAMA', badgeName: 'Penyuluh Unggulan', category: 'Krida', description: 'Tuntas 5 SKK Krida Penyuluh', icon: 'ShieldCheck', color: '#0066B3', earnedAt: 'Okt 2025' },
    ],
  },
  {
    id: 'NAT-MEM-004',
    memberId: '00.33.74.010.000185',
    nama: 'Rizky Dwi Santoso',
    nomorKta: '00.33.74.010.000185',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan Universitas Diponegoro',
    kwarcab: 'KOTA SEMARANG',
    kwarda: 'JAWA TENGAH',
    kridaUtamaId: 'mice',
    kridaUtamaNama: 'Krida Mice & Event',
    tingkatan: 'Anggota',
    level: 'PURWA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '18 Maret 2025',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 8,
      inProgressSkk: 5,
      notStartedSkk: 10,
      progressPercent: 34.7,
      totalBadges: 2,
      totalActivities: 3,
      averageScore: 84.5,
    },
    skkMatrix: generate23SkkMatrix(2, 2, 3, 1, 'PURWA', 'Kak Budi Hartono'),
    activities: [
      {
        id: 'ACT-010',
        activityName: 'Semarang Night Carnival & Festival Kota Lama',
        date: '02 - 04 Mei 2025',
        location: 'Kawasan Kota Lama, Semarang, Jawa Tengah',
        role: 'Divisi Registrasi Peserta & Tata Kelola Panggung',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b7', badgeCode: 'BDG-PURWA', badgeName: 'Lencana Purwa', category: 'Tingkatan', description: 'Tingkatan dasar SKK Pariwisata', icon: 'Award', color: '#009B4D', earnedAt: 'Nov 2025' },
    ],
  },
  {
    id: 'NAT-MEM-005',
    memberId: '00.34.04.010.000312',
    nama: 'Danang Prasetyo',
    nomorKta: '00.34.04.010.000312',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan Saka Pariwisata Sleman - Candi Prambanan',
    kwarcab: 'KABUPATEN SLEMAN',
    kwarda: 'DI YOGYAKARTA',
    kridaUtamaId: 'pemandu',
    kridaUtamaNama: 'Krida Pemandu',
    tingkatan: 'Pamong Saka',
    level: 'UTAMA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '12 Januari 2023',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 20,
      inProgressSkk: 3,
      notStartedSkk: 0,
      progressPercent: 86.9,
      totalBadges: 6,
      totalActivities: 9,
      averageScore: 93.8,
    },
    skkMatrix: generate23SkkMatrix(6, 5, 5, 4, 'UTAMA', 'Kak Suryo Pratama'),
    activities: [
      {
        id: 'ACT-011',
        activityName: 'Pemanduan Wisatawan Internasional Sendratari Ramayana Prambanan',
        date: '20 Desember 2025',
        location: 'Panggung Terbuka Candi Prambanan, Sleman, DIY',
        role: 'Lead Heritage Guide & Hospitality Officer',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'ACT-012',
        activityName: 'Lava Tour Merapi Edukasi Geologi & Mitigasi Kebencanaan',
        date: '10 Oktober 2025',
        location: 'Kawasan Lereng Gunung Merapi, Sleman',
        role: 'Pemandu Wisata Petualangan & Ranger SAKA',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b8', badgeCode: 'BDG-UTAMA', badgeName: 'Lencana Utama', category: 'Tingkatan', description: 'Tingkatan Utama SKK SAKA', icon: 'Award', color: '#6A1B9A', earnedAt: 'Sep 2025' },
      { id: 'b9', badgeCode: 'BDG-HERITAGE', badgeName: 'Kurator Cagar Budaya', category: 'Spesialis', description: 'Interpretasi Cagar Budaya UNESCO', icon: 'ShieldCheck', color: '#F7941D', earnedAt: 'Okt 2025' },
    ],
  },
  {
    id: 'NAT-MEM-006',
    memberId: '00.51.71.020.000216',
    nama: 'Ni Luh Made Suartini',
    nomorKta: '00.51.71.020.000216',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan SMA Negeri 1 Denpasar',
    kwarcab: 'KOTA DENPASAR',
    kwarda: 'BALI',
    kridaUtamaId: 'pemandu',
    kridaUtamaNama: 'Krida Pemandu',
    tingkatan: 'Anggota',
    level: 'MADYA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '20 Maret 2024',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 11,
      inProgressSkk: 5,
      notStartedSkk: 7,
      progressPercent: 47.8,
      totalBadges: 4,
      totalActivities: 4,
      averageScore: 90.2,
    },
    skkMatrix: generate23SkkMatrix(4, 3, 2, 2, 'MADYA', 'Kak Ida Bagus Putra'),
    activities: [
      {
        id: 'ACT-013',
        activityName: 'Aksi Bersih Terumbu Karang & Konservasi Penyu Serangan',
        date: '14 - 15 November 2025',
        location: 'Pulau Serangan, Denpasar Selatan, Bali',
        role: 'Pemandu Bahari & Duta Ekowisata Pesisir',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b10', badgeCode: 'BDG-BAHARI', badgeName: 'Pemandu Bahari Mahir', category: 'Krida', description: 'Lulus SKK Wisata Bahari & Pesisir', icon: 'Compass', color: '#0066B3', earnedAt: 'Nov 2025' },
    ],
  },
  {
    id: 'NAT-MEM-007',
    memberId: '00.35.78.010.000411',
    nama: 'Dimas Arya Pamungkas',
    nomorKta: '00.35.78.010.000411',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan SMAN 5 Surabaya',
    kwarcab: 'KOTA SURABAYA',
    kwarda: 'JAWA TIMUR',
    kridaUtamaId: 'mice',
    kridaUtamaNama: 'Krida Mice & Event',
    tingkatan: 'Anggota',
    level: 'PURWA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '20 Februari 2025',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 7,
      inProgressSkk: 4,
      notStartedSkk: 12,
      progressPercent: 30.4,
      totalBadges: 2,
      totalActivities: 3,
      averageScore: 82.0,
    },
    skkMatrix: generate23SkkMatrix(2, 2, 2, 1, 'PURWA', 'Kak H. Bambang Sudarsono'),
    activities: [
      {
        id: 'ACT-014',
        activityName: 'Surabaya Cross Culture International Folk Art Festival',
        date: '18 - 21 Agustus 2025',
        location: 'Balai Pemuda, Surabaya, Jawa Timur',
        role: 'Liaison Officer (LO) Delegasi Mancanegara',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b11', badgeCode: 'BDG-PURWA', badgeName: 'Lencana Purwa', category: 'Tingkatan', description: 'Tingkatan Purwa SAKA', icon: 'Award', color: '#009B4D', earnedAt: 'Sep 2025' },
    ],
  },
  {
    id: 'NAT-MEM-008',
    memberId: '00.12.17.010.000521',
    nama: 'Muhammad Taufik Hidayat',
    nomorKta: '00.12.17.010.000521',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan Danau Toba Super Prioritas',
    kwarcab: 'KABUPATEN SAMOSIR',
    kwarda: 'SUMATERA UTARA',
    kridaUtamaId: 'pemandu',
    kridaUtamaNama: 'Krida Pemandu',
    tingkatan: 'Dewan Saka',
    level: 'MADYA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '10 Mei 2024',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 13,
      inProgressSkk: 4,
      notStartedSkk: 6,
      progressPercent: 56.5,
      totalBadges: 4,
      totalActivities: 5,
      averageScore: 89.8,
    },
    skkMatrix: generate23SkkMatrix(4, 3, 3, 3, 'MADYA', 'Kak Suryo Pratama'),
    activities: [
      {
        id: 'ACT-015',
        activityName: 'F1 Powerboat World Championship Hospitality Support',
        date: '01 - 03 Maret 2025',
        location: 'Balige & Pangururan, Kawasan Danau Toba, Sumut',
        role: 'Koordinator Tourist Information Center SAKA',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b12', badgeCode: 'BDG-GEOPARK', badgeName: 'Pemandu Geopark Kaldera', category: 'Spesialis', description: 'Sertifikasi Geopark UNESCO Kaldera Toba', icon: 'Compass', color: '#009B4D', earnedAt: 'Jul 2025' },
    ],
  },
  {
    id: 'NAT-MEM-009',
    memberId: '00.73.18.010.000632',
    nama: 'Andi Nurul Magfirah',
    nomorKta: '00.73.18.010.000632',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan Saka Pariwisata Toraja Heritage',
    kwarcab: 'KABUPATEN TANA TORAJA',
    kwarda: 'SULAWESI SELATAN',
    kridaUtamaId: 'kuliner',
    kridaUtamaNama: 'Krida Kuliner & Cinderamata',
    tingkatan: 'Pamong Saka',
    level: 'UTAMA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '15 April 2023',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 19,
      inProgressSkk: 3,
      notStartedSkk: 1,
      progressPercent: 82.6,
      totalBadges: 6,
      totalActivities: 7,
      averageScore: 93.2,
    },
    skkMatrix: generate23SkkMatrix(4, 5, 4, 6, 'UTAMA', 'Kak Dr. H. Bambang Soedirman'),
    activities: [
      {
        id: 'ACT-016',
        activityName: 'Festival Kopi Arabika Toraja & Cinderamata Tenun Sa’dan',
        date: '24 - 26 Juli 2025',
        location: 'Rantepao & Makale, Tana Toraja, Sulawesi Selatan',
        role: 'Kurator Gastronomi & Pameran Cinderamata Adat',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b13', badgeCode: 'BDG-KULINER-AHLI', badgeName: 'Master Gastronomi Adat', category: 'Krida', description: 'Tuntas 6 SKK Kuliner & Cinderamata Nilai A', icon: 'Award', color: '#F7941D', earnedAt: 'Agt 2025' },
    ],
  },
  {
    id: 'NAT-MEM-010',
    memberId: '00.52.02.010.000743',
    nama: 'Baiq Rinjani Safitri',
    nomorKta: '00.52.02.010.000743',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    pangkalan: 'Pangkalan Mandalika Sadar Wisata',
    kwarcab: 'KABUPATEN LOMBOK TENGAH',
    kwarda: 'NUSA TENGGARA BARAT',
    kridaUtamaId: 'penyuluh',
    kridaUtamaNama: 'Krida Penyuluh',
    tingkatan: 'Dewan Saka',
    level: 'MADYA',
    statusKta: 'ACTIVE',
    tanggalBergabung: '11 Agustus 2024',
    summary: {
      totalSkkAvailable: 23,
      completedSkk: 12,
      inProgressSkk: 4,
      notStartedSkk: 7,
      progressPercent: 52.2,
      totalBadges: 4,
      totalActivities: 4,
      averageScore: 88.5,
    },
    skkMatrix: generate23SkkMatrix(3, 4, 3, 2, 'MADYA', 'Kak Suryo Pratama'),
    activities: [
      {
        id: 'ACT-017',
        activityName: 'Aksi Bersih Pantai Kuta Mandalika Jelang Indonesian MotoGP',
        date: '25 - 27 September 2025',
        location: 'Kawasan Mandalika, Lombok Tengah, NTB',
        role: 'Koordinator Gerakan Bersih Sadar Wisata',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
      },
    ],
    badges: [
      { id: 'b14', badgeCode: 'BDG-MADYA', badgeName: 'Lencana Madya', category: 'Tingkatan', description: 'Tingkatan Madya SAKA', icon: 'Award', color: '#0066B3', earnedAt: 'Okt 2025' },
    ],
  },
];
