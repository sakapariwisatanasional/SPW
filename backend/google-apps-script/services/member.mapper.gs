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

    return {
      no_kta: raw.no_kta || '',
      nama_lengkap: raw.nama_lengkap || raw.nama || 'Anggota SAKA Pariwisata',
      level_organisasi: raw.level_organisasi || (raw.no_kta && raw.no_kta.indexOf('.') === 2 && raw.no_kta.split('.').length === 2 ? 'KWARTIR_NASIONAL' : 'WILAYAH'),
      foto_url: raw.foto_url || raw.foto || '',
      kode_provinsi: raw.kode_provinsi || raw.provinsi_id || '',
      provinsi: raw.provinsi || raw.provinsi_nama || '',
      kode_kabupaten: raw.kode_kabupaten || '',
      kabupaten_kota: raw.kabupaten_kota || raw.kota || '',
      kode_kecamatan: raw.kode_kecamatan || '',
      kecamatan: raw.kecamatan || raw.kecamatan_nama || '',
      krida: raw.krida || raw.krida_nama || 'Belum Terdaftar Krida',
      tingkat_keanggotaan: raw.tingkat_keanggotaan || raw.tingkat || 'Penegak',
      status: raw.status || 'ACTIVE',
      tanggal_bergabung: raw.tanggal_bergabung || raw.created_at || '',
      valid_until: raw.valid_until || 'Seumur Hidup / Aktif',
      is_verified: (raw.status === 'ACTIVE')
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

    return sanitized;
  }

  return {
    toPublic: toPublic,
    toAdmin: toAdmin
  };
})();
