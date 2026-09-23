import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Eye,
  Sliders,
  FileText,
  User,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Avatar,
  Input,
  Select,
  Modal,
  Drawer,
  Table,
  Tabs,
  Pagination,
  Skeleton,
  Loading,
  EmptyState,
  ErrorState,
} from '../../../components/ui';
import { THEME_CONFIG } from '../../../config/theme.config';
import { useUIStore } from '../../../stores/uiStore';

export const DesignSystemPage: React.FC = () => {
  const { addToast } = useUIStore();
  // Interactive Component States
  const [activeTab, setActiveTab] = useState('components');
  const [subTab, setSubTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('krida-1');
  const [showLoadingDemo, setShowLoadingDemo] = useState(false);

  // Sample Table Data
  const sampleTableData = [
    {
      id: 'MEM-001',
      name: 'Fajar Nugraha Wijaya',
      role: 'Penegak Bantara',
      province: 'Jawa Barat',
      krida: 'Bina Wisata',
      status: 'ACTIVE' as const,
    },
    {
      id: 'MEM-002',
      name: 'Dewi Anjani Kusuma',
      role: 'Pandega',
      province: 'Bali',
      krida: 'Bina Pandu',
      status: 'ACTIVE' as const,
    },
    {
      id: 'MEM-003',
      name: 'Rian Hidayatullah',
      role: 'Penegak Laksana',
      province: 'DI Yogyakarta',
      krida: 'Bina Kuliner',
      status: 'PENDING_VERIFICATION' as const,
    },
    {
      id: 'MEM-004',
      name: 'Aulia Rahmawati',
      role: 'Pembina SAKA',
      province: 'Jawa Tengah',
      krida: 'Bina Pesona',
      status: 'ACTIVE' as const,
    },
  ];

  const tableColumns = [
    { key: 'id', header: 'ID Anggota', width: '120px' },
    {
      key: 'name',
      header: 'Nama Lengkap',
      render: (item: typeof sampleTableData[0]) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={item.name} size="sm" />
          <div>
            <p className="font-semibold text-slate-900 text-xs">{item.name}</p>
            <p className="text-[10px] text-slate-400">{item.role}</p>
          </div>
        </div>
      ),
    },
    { key: 'province', header: 'Provinsi' },
    {
      key: 'krida',
      header: 'Krida',
      render: (item: typeof sampleTableData[0]) => (
        <Badge variant="blue" size="sm">{item.krida}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status KTA',
      render: (item: typeof sampleTableData[0]) => (
        <Badge
          variant={item.status === 'ACTIVE' ? 'green' : 'orange'}
          size="sm"
          dot
        >
          {item.status === 'ACTIVE' ? 'Aktif Terverifikasi' : 'Verifikasi Wilayah'}
        </Badge>
      ),
    },
  ];

  const colorPalette = [
    { name: 'Ocean Blue', hex: '#0066B3', label: 'Primary Brand / Kredibilitas Maritim' },
    { name: 'Tropical Green', hex: '#009B4D', label: 'Secondary Brand / Kesegaran Alam' },
    { name: 'Sunset Orange', hex: '#F7941D', label: 'Accent / Kehangatan Senja Nusantara' },
    { name: 'Culture Purple', hex: '#6A1B9A', label: 'Culture / Warisan Budaya Luhur' },
    { name: 'Festival Magenta', hex: '#D81B60', label: 'Vibrancy / Atraksi & Semarak Festival' },
    { name: 'Indonesia Night', hex: '#0B1F33', label: 'Dark Base / Kontras & Tipografi' },
    { name: 'Background Neutral', hex: '#F5F7FA', label: 'Canvas / Neutral Eye-Safe' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0066B3] via-[#005291] to-[#0B1F33] text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" />
              <span>Wonderful Indonesia Design System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              SPWN 2.0 Component Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
              Fondasi arsitektur UI berstandar enterprise dengan 15+ komponen atomik & molekul,
              token warna Wonderful Indonesia, dan strict accessibility.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setIsModalOpen(true)}
            >
              Uji Modal Dialog
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
            >
              Uji Drawer Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        tabs={[
          { id: 'components', label: 'Semua Komponen UI (15+)', icon: <Layers className="w-4 h-4" /> },
          { id: 'tokens', label: 'Token Warna & Tipografi', icon: <Palette className="w-4 h-4" /> },
          { id: 'guidelines', label: 'Aturan Arsitektur & RBAC', icon: <ShieldCheck className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: UI COMPONENTS */}
      {activeTab === 'components' && (
        <div className="space-y-8">
          {/* Section: Buttons */}
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. Button Component Library</h3>
                  <p className="text-xs text-slate-500">Mendukung varian warna Wonderful Indonesia, sizes, icons, and loading states.</p>
                </div>
                <Badge variant="blue">Atom</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Ocean Blue</Button>
                <Button variant="secondary">Tropical Green</Button>
                <Button variant="warning">Sunset Orange</Button>
                <Button variant="magenta">Festival Magenta</Button>
                <Button variant="outline">Outline Neutral</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="danger">Danger Alert</Button>
                <Button variant="primary" isLoading>Memproses</Button>
                <Button variant="primary" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Kirim Data
                </Button>
                <Button variant="outline" size="lg" rightIcon={<Eye className="w-4 h-4" />}>
                  Lihat Detail
                </Button>
              </div>
            </div>
          </Card>

          {/* Section: Badges & Avatars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">2. Badge & Status Indicators</h3>
                    <p className="text-xs text-slate-500">Semua token warna ekosistem dengan mode dot.</p>
                  </div>
                  <Badge variant="green">Atom</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="blue" dot>Ocean Blue</Badge>
                  <Badge variant="green" dot>Aktif Terverifikasi</Badge>
                  <Badge variant="orange" dot>Pending Review</Badge>
                  <Badge variant="purple" dot>Warisan Budaya</Badge>
                  <Badge variant="magenta" dot>Festival Nusantara</Badge>
                  <Badge variant="neutral">Draft Publikasi</Badge>
                  <Badge variant="red" dot>Ditangguhkan</Badge>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">3. Avatar & Profile Images</h3>
                    <p className="text-xs text-slate-500">Fallback inisial otomatis & status presence.</p>
                  </div>
                  <Badge variant="purple">Atom</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar size="sm" name="Ahmad Fauzan" status="online" />
                  <Avatar size="md" name="Bambang Soedirman" status="online" />
                  <Avatar
                    size="lg"
                    name="Dewi Anjani"
                    status="away"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  />
                  <Avatar size="xl" name="Raden Mas Suryo" status="offline" />
                </div>
              </div>
            </Card>
          </div>

          {/* Section: Form Elements (Input & Select) */}
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">4. Form Elements (Input & Select)</h3>
                  <p className="text-xs text-slate-500">Accessible labels, icons, error handling, helper text.</p>
                </div>
                <Badge variant="orange">Molecule</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nomor KTA Anggota"
                  placeholder="Contoh: SPWN.32.01.2024.089"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  helperText="Format standar KTA nasional"
                />

                <Select
                  label="Pilihan Krida Pariwisata"
                  options={[
                    { value: 'krida-1', label: 'Krida Pemandu' },
                    { value: 'krida-2', label: 'Krida Penyuluh' },
                    { value: 'krida-3', label: 'Krida Mice & Event' },
                    { value: 'krida-4', label: 'Krida Kuliner & Cinderamata' },
                  ]}
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                  helperText="Pilih krida spesialisasi anggota"
                />

                <Input
                  label="Validasi Error State"
                  placeholder="Input salah..."
                  defaultValue="KODE_INVALID_99"
                  error="Format token verifikasi tidak valid"
                />
              </div>
            </div>
          </Card>

          {/* Section: Table & Pagination */}
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">5. Enterprise Table & Pagination</h3>
                  <p className="text-xs text-slate-500">Responsive data grid dengan type-safe columns dan pagination controls.</p>
                </div>
                <Badge variant="blue">Organism</Badge>
              </div>

              <Table
                columns={tableColumns}
                data={sampleTableData}
                keyExtractor={(item) => item.id}
                onRowClick={(item) =>
                  addToast({
                    type: 'info',
                    title: `Pilih: ${item.name}`,
                    message: `ID Anggota: ${item.id} - ${item.role} (${item.province})`,
                  })
                }
              />

              <Pagination
                currentPage={currentPage}
                totalPages={4}
                onPageChange={setCurrentPage}
              />
            </div>
          </Card>

          {/* Section: Feedback States (Skeleton, Loading, EmptyState, ErrorState) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">6. Skeleton Shimmer & Loading</h3>
                    <p className="text-xs text-slate-500">Placeholder saat data Google Apps Script dimuat.</p>
                  </div>
                  <Badge variant="neutral">Feedback</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton variant="text" width="60%" height={14} />
                      <Skeleton variant="text" width="40%" height={10} />
                    </div>
                  </div>
                  <Skeleton variant="rectangular" height={48} />

                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowLoadingDemo(true);
                        setTimeout(() => setShowLoadingDemo(false), 2000);
                      }}
                    >
                      {showLoadingDemo ? 'Menampilkan Loading...' : 'Uji Komponen Loading (2 detik)'}
                    </Button>
                    {showLoadingDemo && <Loading label="Mengambil data dari Google Apps Script..." />}
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">7. Empty & Error Feedback States</h3>
                    <p className="text-xs text-slate-500">Actionable fallback saat data kosong atau jaringan bermasalah.</p>
                  </div>
                  <Badge variant="magenta">Feedback</Badge>
                </div>

                <div className="space-y-4">
                  <EmptyState
                    title="Tidak Ada Paket Wisata"
                    description="Belum ada paket wisata yang terdaftar di wilayah ini."
                    actionLabel="Tambah Paket"
                    onAction={() =>
                      addToast({
                        type: 'info',
                        title: 'Tambah Paket Wisata',
                        message: 'Membuka formulir pendaftaran paket wisata baru.',
                      })
                    }
                  />

                  <ErrorState
                    title="Gagal Menghubungi Spreadsheet"
                    message="Google Apps Script Gateway timeout (504). Tekan tombol coba lagi."
                    onRetry={() =>
                      addToast({
                        type: 'warning',
                        title: 'Mencoba Ulang',
                        message: 'Mengulangi sinkronisasi data dengan Google Apps Script Gateway...',
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: TOKENS & TYPOGRAPHY */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="text-base font-bold text-slate-900 mb-2">Token Warna Resmi Wonderful Indonesia</h3>
            <p className="text-xs text-slate-500 mb-6">
              Palet warna baku yang merefleksikan identitas pariwisata nusantara sesuai standar Kemenparekraf & SAKA Pariwisata Nasional.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {colorPalette.map((c) => (
                <div
                  key={c.hex}
                  className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                >
                  <div className="h-20 w-full" style={{ backgroundColor: c.hex }} />
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-900">{c.name}</p>
                    <p className="text-[11px] font-mono text-slate-500">{c.hex}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{c.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: GUIDELINES & RBAC */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="text-base font-bold text-slate-900 mb-2">Aturan Ekosistem & Matriks RBAC</h3>
            <p className="text-xs text-slate-500 mb-4">
              Setiap tombol, form, dan menu dalam SPWN Apps 2.0 dikontrol secara ketat melalui role-based permission.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0066B3]" />
                  <h4 className="text-xs font-bold text-slate-900">Prinsip Komponen KTA Terkunci (Locked)</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Komponen <code>DigitalKTACard</code> lama adalah aset resmi yang <strong>tidak boleh diubah tata letaknya</strong>. Generator PDF dan QR hashing harus menghasilkan output identik dengan kartu fisik anggota.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#009B4D]" />
                  <h4 className="text-xs font-bold text-slate-900">Privasi Verifikasi Publik (`/verify/:token`)</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Endpoint verifikasi publik <strong>hanya menampilkan data verifikasi resmi</strong>: Nama, No KTA, Status, Foto, Provinsi, Krida, Tanggal Bergabung. Seluruh data internal (NIK, email, password) dihilangkan di level controller.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Interactive Modal Component Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal Dialog Standar SPWN"
        description="Komponen dialog modal interaktif dengan backdrop blur dan keyboard ESC support."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addToast({
                  type: 'success',
                  title: 'Konfirmasi Aksi',
                  message: 'Aksi dialog modal berhasil dikonfirmasi.',
                });
                setIsModalOpen(false);
              }}
            >
              Konfirmasi Aksi
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Modal ini dibangun dengan standard accessiblity, auto-focus prevention, scroll-lock pada body, dan styling clean architecture.
          </p>
          <div className="p-3 rounded-lg bg-[#E6F0F8] border border-[#0066B3]/20 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0066B3] shrink-0" />
            <p className="text-xs text-[#0066B3] font-medium">Status Komponen: Production Ready</p>
          </div>
        </div>
      </Modal>

      {/* Interactive Drawer Component Demo */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Panel Drawer Samping"
        position="right"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Drawer panel digunakan untuk inspeksi detail anggota, filter lanjutan destinasi wisata, atau keranjang belanja pasar UMKM.
          </p>
          <div className="space-y-3 pt-2">
            <Input label="Filter Kata Kunci" placeholder="Cari..." />
            <Select
              label="Filter Wilayah"
              options={[
                { value: 'all', label: 'Semua Wilayah' },
                { value: 'jabar', label: 'Jawa Barat' },
                { value: 'bali', label: 'Bali' },
                { value: 'diy', label: 'DI Yogyakarta' },
              ]}
            />
            <Button className="w-full" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Terapkan Filter
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
