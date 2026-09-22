/**
 * SPWN Apps 2.0 - Password Hasher Abstraction Layer
 * Location: backend/google-apps-script/services/password.hasher.gs
 * ---------------------------------------------------------------
 * Abstraksi modular untuk hashing dan verifikasi kata sandi.
 * Memisahkan algoritma kriptografis dari AuthService sehingga memudahkan
 * migrasi di masa depan ke bcrypt, Argon2, atau External Auth Provider.
 * 
 * FUNGSI UTAMA:
 * 1. hash(password, salt) -> Menghasilkan hash kata sandi ter-enkripsi
 * 2. verify(password, expectedHash, salt) -> Verifikasi kecocokan kata sandi
 * 3. generateSalt() -> Pembuatan garam acak unik
 */

var PasswordHasher = (function() {

  // Provider Default: Google Apps Script Native SHA-256 + Salt
  var _provider = {
    name: 'SHA256_SALTED',

    hash: function(password, salt) {
      if (!password) return '';
      salt = salt || 'SPWN_DEFAULT_SALT_2026';
      var saltedInput = password + ':' + salt;
      var digest = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        saltedInput,
        Utilities.Charset.UTF_8
      );

      var hex = '';
      for (var i = 0; i < digest.length; i++) {
        var byteVal = (digest[i] < 0) ? (digest[i] + 256) : digest[i];
        var str = byteVal.toString(16);
        hex += (str.length === 1 ? '0' : '') + str;
      }
      return hex;
    },

    verify: function(password, expectedHash, salt) {
      if (!password || !expectedHash) return false;
      var computed = this.hash(password, salt);
      return computed === expectedHash;
    },

    generateSalt: function() {
      return Utilities.getUuid().replace(/-/g, '').substring(0, 16);
    }
  };

  return {
    /**
     * Menghasilkan hash kata sandi terenkripsi.
     * @param {string} password 
     * @param {string} salt 
     * @returns {string}
     */
    hash: function(password, salt) {
      return _provider.hash(password, salt);
    },

    /**
     * Memverifikasi kata sandi terhadap hash yang tersimpan.
     * @param {string} password 
     * @param {string} expectedHash 
     * @param {string} salt 
     * @returns {boolean}
     */
    verify: function(password, expectedHash, salt) {
      return _provider.verify(password, expectedHash, salt);
    },

    /**
     * Membuat string garam (salt) baru.
     * @returns {string}
     */
    generateSalt: function() {
      return _provider.generateSalt();
    },

    /**
     * Opsi registrasi custom provider (misal saat migrasi ke Node/Bcrypt/Argon2)
     * @param {Object} customProvider 
     */
    setProvider: function(customProvider) {
      if (customProvider && typeof customProvider.hash === 'function' && typeof customProvider.verify === 'function') {
        _provider = customProvider;
      }
    }
  };
})();
