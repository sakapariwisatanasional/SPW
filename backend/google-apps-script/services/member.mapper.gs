/**
 * SPWN Apps 2.0 - Member Data Protection & Security Mappers
 * Location: backend/google-apps-script/services/member.mapper.gs
 * -------------------------------------------------------------
 * Abstraksi transformasi data anggota untuk mencegah circular dependency antara
 * MemberService dan VerificationService, serta memastikan kepatuhan UU PDP.
 * 
 * FUNGSI UTAMA:
 * 1. toPublic(rawMember) -> Memastikan data publik terisolasi dari PII sensitif (NIK, Password, Kontak)
 * 2. toAdmin(rawMember, callerRole) -> Memberikan data administratif relevan tanpa mengekspos hash kredensial
 */

var MemberMapper = (function() {

  /**
   * Mengubah record anggota mentah menjadi format aman publik.
   * Hanya mengekspos identitas resmi yang diperlukan untuk validasi di lapangan.
   * 
   * @param {Object} raw 
   * @returns {Object|null}
   */
  function toPublic(raw) {
    if (!raw) return null;

    var noKta = raw.no_kta || raw.nomor_kta || raw.noKta || raw.nomorKTA || raw['Nomor KTA'] || raw['No. KTA'] || raw['No KTA'] || raw['KTA'] || '';
    var fullName = raw.full_name || raw.fullName || raw.nama_lengkap || raw['Nama Lengkap'] || raw['Nama'] || raw['Nama Anggota'] || raw.nama || 'Anggota SAKA Pariwisata';
    var fotoUrl = raw.foto_url || raw.foto || raw.photoUrl || raw['Foto'] || raw['Foto URL'] || raw['Foto Profil'] || '';
    var level = raw.tingkat_keanggotaan || raw.tingkatan || raw.tingkat || raw.membershipLevel || raw['Tingkat'] || raw['Tingkatan'] || raw['Jabatan'] || 'Penegak';
    var kridaName = raw.krida || raw.krida_nama || raw.kridaName || raw['Krida'] || 'KRIDA PEMANDU';
    var prov = raw.provinsi || raw.provinsi_nama || raw.province || raw['Provinsi'] || '';
    var kab = raw.kabupaten_kota || raw.kota || raw.city || raw.kabupaten_nama || raw['Kabupaten'] || raw['Kabupaten/Kota'] || raw['Kota'] || '';
    var kec = raw.kecamatan || raw.kecamatan_nama || raw['Kecamatan'] || '';
    var status = raw.status || raw.status_anggota || raw['Status'] || 'ACTIVE';

    return {
      id: raw.id || raw.ID || raw['ID'] || noKta,
      no_kta: noKta,
      nomor_kta: noKta,
      noKta: noKta,
      full_name: fullName,
      nama_lengkap: fullName,
      nama: fullName,
      fullName: fullName,
      level_organisasi: raw.level_organisasi || (noKta && noKta.indexOf('.') === 2 && noKta.split('.').length === 2 ? 'KWARTIR_NASIONAL' : 'WILAYAH'),
      foto_url: fotoUrl,
      foto: fotoUrl,
      photoUrl: fotoUrl,
      kode_provinsi: raw.kode_provinsi || raw.provinsi_id || raw['Kode Provinsi'] || '',
      provinsi: prov,
      provinsi_nama: prov,
      kode_kabupaten: raw.kode_kabupaten || raw.kabupaten_id || raw['Kode Kabupaten'] || '',
      kabupaten_kota: kab,
      kabupaten_nama: kab,
      city: kab,
      kode_kecamatan: raw.kode_kecamatan || raw.kecamatan_id || raw['Kode Kecamatan'] || '',
      kecamatan: kec,
      kecamatan_nama: kec,
      krida: kridaName,
      krida_nama: kridaName,
      kridaName: kridaName,
      tingkat_keanggotaan: level,
      membershipLevel: level,
      status: status,
      status_anggota: status,
      tanggal_bergabung: raw.tanggal_bergabung || raw.created_at || raw['Tanggal Bergabung'] || raw['Tanggal Daftar'] || '',
      valid_until: raw.valid_until || 'Seumur Hidup / Aktif',
      is_verified: (status === 'ACTIVE')
    };
  }

  /**
   * Mengubah record anggota mentah menjadi format admin / pengurus berwenang.
   * 
   * @param {Object} raw 
   * @param {string} [callerRole='ADMIN_WILAYAH'] 
   * @returns {Object|null}
   */
  function toAdmin(raw, callerRole) {
    if (!raw) return null;

    var sanitized = Object.assign({}, raw);

    // Kredensial dan token sesi DILARANG ditransmisikan dalam data profil anggota
    delete sanitized.password;
    delete sanitized.password_hash;
    delete sanitized.salt;
    delete sanitized.token;
    delete sanitized.session_token;

    // PRIVACY ENFORCEMENT (UU PDP No. 27/2022):
    // NIK adalah data kependudukan sensitif yang terproteksi permanen.
    // DILARANG diekspos pada List Anggota, Dashboard, Export, Public API, maupun transmisi umum.
    delete sanitized.nik;

    var noKta = sanitized.no_kta || sanitized.nomor_kta || sanitized.noKta || sanitized.nomorKTA || sanitized['Nomor KTA'] || sanitized['No. KTA'] || sanitized['No KTA'] || sanitized['KTA'] || '';
    var fullName = sanitized.full_name || sanitized.fullName || sanitized.nama_lengkap || sanitized['Nama Lengkap'] || sanitized['Nama'] || sanitized['Nama Anggota'] || sanitized.nama || 'Anggota SAKA Pariwisata';

    sanitized.no_kta = noKta;
    sanitized.nomor_kta = noKta;
    sanitized.noKta = noKta;
    sanitized.full_name = fullName;
    sanitized.nama_lengkap = fullName;
    sanitized.nama = fullName;
    sanitized.fullName = fullName;

    return sanitized;
  }

  return {
    toPublic: toPublic,
    toAdmin: toAdmin
  };
})();
