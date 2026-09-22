/**
 * SPWN Apps 2.0 - Generic Spreadsheet Repository Engine
 * Location: backend/google-apps-script/repositories/spreadsheet.repository.gs
 * -------------------------------------------------------------------------
 * Abstraksi akses basis data Spreadsheet berbasis Repository & Factory Pattern.
 * 
 * PRINSIP & ATURAN UTAMA:
 * 1. GENERIC: Tidak mengandung logika bisnis domain tertentu (Member, Tourism, dll).
 * 2. ZERO HARDCODE: Mengakses spreadsheet secara eksklusif melalui database.config.gs (openSheet).
 * 3. DYNAMIC HEADER MAPPING: Menyesuaikan kolom baris 1 secara otomatis.
 * 4. CONCURRENCY SAFE: Seluruh mutasi (insert, update, delete) wajib menggunakan executeWithLock().
 * 5. CACHE ACCELERATED: Operasi pembacaan (findAll, findById, findOne, count) diakselerasi CacheManager.
 * 6. SOFT DELETE DEFAULT: Menandai status='DELETED' secara default, kecuali forceDelete=true.
 * 7. STANDARDIZED ERRORS: Menggunakan error code berawalan SPWN_*.
 */

var SpreadsheetRepository = (function() {
  // Daftar kode error standar repository
  var ERRORS = {
    NOT_FOUND: 'SPWN_REPOSITORY_NOT_FOUND',
    INVALID_COLUMN: 'SPWN_INVALID_COLUMN',
    DUPLICATE_ID: 'SPWN_DUPLICATE_ID',
    DATABASE_ERROR: 'SPWN_DATABASE_ERROR',
    LOCK_TIMEOUT: 'SPWN_LOCK_TIMEOUT'
  };

  /**
   * Helper internal pembuat Error terstandarisasi.
   * 
   * @param {string} code 
   * @param {string} message 
   * @param {*} [details] 
   * @returns {Error}
   */
  function createRepositoryError(code, message, details) {
    var err = new Error('[' + code + '] ' + message);
    err.name = code;
    err.code = code;
    if (details) err.details = details;
    return err;
  }

  /**
   * Factory function untuk membuat instance generic repository bagi tabel tertentu.
   * 
   * @param {string} domainKey - Domain pada SPWN_DATABASE ('MEMBER', 'CONTENT', 'TRAVEL', 'COMMERCE')
   * @param {string} tableKey  - Key tabel ('ANGGOTA', 'USERS', 'BERITA', 'DESTINASI', dll)
   * @param {Object} [options] - Opsi kustomisasi instance
   * @param {string} [options.primaryKey='id'] - Kolom identitas unik utama
   * @param {string} [options.statusColumn='status'] - Kolom penanda status aktif/delete
   * @param {string} [options.deletedValue='DELETED'] - Nilai penanda baris terhapus (soft delete)
   * @param {boolean} [options.enableCache=true] - Aktifkan caching pembacaan
   * @returns {Object} Instance Repository
   */
  function create(domainKey, tableKey, options) {
    if (!domainKey || !tableKey) {
      throw createRepositoryError(
        ERRORS.DATABASE_ERROR,
        'domainKey dan tableKey wajib disediakan saat inisialisasi Repository!'
      );
    }

    options = options || {};
    var primaryKey = options.primaryKey || 'id';
    var statusColumn = options.statusColumn || 'status';
    var deletedValue = options.deletedValue || 'DELETED';
    var enableCache = options.enableCache !== undefined ? options.enableCache : true;

    // Cache internal untuk kamus header sheet agar tidak berulang kali membaca baris 1
    var _cachedHeaders = null;
    var _cachedHeaderMap = null;

    /**
     * Membuka sheet fisik dari database.config.gs
     * 
     * @returns {GoogleAppsScript.Spreadsheet.Sheet}
     */
    function _getSheet() {
      try {
        return openSheet(domainKey, tableKey);
      } catch (e) {
        throw createRepositoryError(
          ERRORS.DATABASE_ERROR,
          'Gagal mengakses sheet [' + domainKey + '.' + tableKey + ']: ' + e.message,
          e
        );
      }
    }

    /**
     * Membaca dan memetakan header baris pertama sheet secara dinamis.
     * Mengembalikan kamus { normalizedColumnName: columnIndex (0-indexed) }
     * 
     * @param {boolean} [forceRefresh=false]
     * @returns {{ headers: Array<string>, headerMap: Object }}
     */
    function _getHeaders(forceRefresh) {
      if (!forceRefresh && _cachedHeaders && _cachedHeaderMap) {
        return { headers: _cachedHeaders, headerMap: _cachedHeaderMap };
      }

      var sheet = _getSheet();
      var lastColumn = sheet.getLastColumn();

      if (lastColumn < 1) {
        _cachedHeaders = [];
        _cachedHeaderMap = {};
        return { headers: [], headerMap: {} };
      }

      var rawHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      var headerMap = {};
      var headers = [];

      for (var i = 0; i < rawHeaders.length; i++) {
        var colName = (rawHeaders[i] !== null && rawHeaders[i] !== undefined)
          ? rawHeaders[i].toString().trim()
          : '';

        headers.push(colName);
        if (colName !== '') {
          headerMap[colName] = i;
          headerMap[colName.toLowerCase()] = i; // Mendukung case-insensitive matching
        }
      }

      _cachedHeaders = headers;
      _cachedHeaderMap = headerMap;
      return { headers: headers, headerMap: headerMap };
    }

    /**
     * Mengonversi satu baris array nilai spreadsheet menjadi Object JSON.
     * 
     * @param {Array<*>} rowValues 
     * @param {Array<string>} headers 
     * @param {number} rowIndex - Baris fisik spreadsheet (1-indexed)
     * @returns {Object}
     */
    function _rowToObject(rowValues, headers, rowIndex) {
      var entity = {};
      for (var colIdx = 0; colIdx < headers.length; colIdx++) {
        var key = headers[colIdx];
        if (key) {
          var val = rowValues[colIdx];
          // Handle Date formatting
          if (val instanceof Date) {
            val = val.toISOString();
          }
          entity[key] = (val !== undefined && val !== null) ? val : '';
        }
      }
      // Sematkan metadata baris fisik untuk keperluan update/delete efisien
      entity.__rowIndex = rowIndex;
      return entity;
    }

    /**
     * Mengonversi Object JSON menjadi Array nilai baris sesuai urutan header fisik.
     * Menjamin pergeseran atau penambahan urutan kolom tidak merusak data.
     * 
     * @param {Object} entity 
     * @param {Array<string>} headers 
     * @param {Array<*>} [existingRowValues] - Nilai baris lama saat update parsial
     * @returns {Array<*>}
     */
    function _objectToRow(entity, headers, existingRowValues) {
      var row = [];
      for (var i = 0; i < headers.length; i++) {
        var key = headers[i];
        var keyLower = key.toLowerCase();

        // Cari kecocokan key (exact atau lowercase)
        var hasKey = entity.hasOwnProperty(key);
        var targetVal = hasKey ? entity[key] : (entity.hasOwnProperty(keyLower) ? entity[keyLower] : undefined);

        if (targetVal !== undefined) {
          row.push(targetVal);
        } else if (existingRowValues && existingRowValues[i] !== undefined) {
          // Pertahankan nilai lama jika update parsial tidak mengirim kolom ini
          row.push(existingRowValues[i]);
        } else {
          row.push('');
        }
      }
      return row;
    }

    /**
     * Membaca seluruh data mentah dari sheet (melewati baris header 1).
     * 
     * @returns {{ sheet: GoogleAppsScript.Spreadsheet.Sheet, headers: Array<string>, entities: Array<Object> }}
     */
    function _readAllEntities() {
      var sheet = _getSheet();
      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();

      var headerInfo = _getHeaders();
      var headers = headerInfo.headers;

      if (lastRow <= 1 || lastCol < 1 || headers.length === 0) {
        return { sheet: sheet, headers: headers, entities: [] };
      }

      var rangeValues = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      var entities = [];

      for (var r = 0; r < rangeValues.length; r++) {
        var rowIndex = r + 2; // Baris fisik spreadsheet (header baris 1)
        var rowObj = _rowToObject(rangeValues[r], headers, rowIndex);

        // Abaikan baris kosong total
        var hasData = false;
        for (var k in rowObj) {
          if (k !== '__rowIndex' && rowObj[k] !== '') {
            hasData = true;
            break;
          }
        }

        if (hasData) {
          entities.push(rowObj);
        }
      }

      return { sheet: sheet, headers: headers, entities: entities };
    }

    // =========================================================================
    // PUBLIC CRUD OPERATIONS
    // =========================================================================

    /**
     * Mengambil daftar data dengan fitur:
     * - Filter kondisi objek atau fungsi predikat kustom
     * - Keyword search pada kolom teks
     * - Sorting field asc/desc
     * - Pagination: page, limit
     * - Integrasi CacheManager (jika useCache=true)
     * 
     * CATATAN: Operasi pembacaan TIDAK menggunakan lock.
     * 
     * @param {Object} [options]
     * @param {number} [options.page=1]
     * @param {number} [options.limit=50]
     * @param {Object|Function} [options.filter]
     * @param {string} [options.search]
     * @param {Array<string>} [options.searchColumns]
     * @param {string} [options.sortBy]
     * @param {string} [options.sortOrder='asc'] - 'asc' | 'desc'
     * @param {boolean} [options.includeDeleted=false] - Sertakan data yang di-soft-delete
     * @param {boolean} [options.useCache=true]
     * @returns {{ data: Array<Object>, pagination: { page: number, limit: number, total: number, totalPages: number } }}
     */
    function findAll(options) {
      options = options || {};
      var page = parseInt(options.page, 10) || 1;
      var limit = parseInt(options.limit, 10) || 50;
      var search = (options.search || '').toString().toLowerCase().trim();
      var sortBy = options.sortBy;
      var sortOrder = (options.sortOrder || 'asc').toLowerCase();
      var includeDeleted = options.includeDeleted === true;
      var useCache = (options.useCache !== false) && enableCache;

      // Cek Cache jika aktif
      var cacheKey = null;
      if (useCache) {
        var queryHash = Utilities.base64EncodeWebSafe(
          JSON.stringify({
            p: page, l: limit, f: options.filter, s: search, sb: sortBy, so: sortOrder, idel: includeDeleted
          })
        );
        cacheKey = generateCacheKey(domainKey, tableKey + '_LIST', queryHash);
        var cached = getFromCache(cacheKey);
        if (cached) {
          return cached;
        }
      }

      var result = _readAllEntities();
      var rawList = result.entities;

      // 1. Filter baris terhapus (Soft Delete Guard)
      var filtered = rawList.filter(function(item) {
        if (!includeDeleted && item[statusColumn] === deletedValue) {
          return false;
        }
        return true;
      });

      // 2. Filter kondisi (Object atau Callback Predicate)
      if (options.filter) {
        if (typeof options.filter === 'function') {
          filtered = filtered.filter(options.filter);
        } else if (typeof options.filter === 'object') {
          filtered = filtered.filter(function(item) {
            for (var fKey in options.filter) {
              if (options.filter.hasOwnProperty(fKey)) {
                var targetVal = options.filter[fKey];
                if (targetVal !== undefined && targetVal !== null && targetVal !== '') {
                  var itemVal = item[fKey] !== undefined ? item[fKey] : item[fKey.toLowerCase()];
                  if (itemVal != targetVal) { // loose comparison untuk angka/string id
                    return false;
                  }
                }
              }
            }
            return true;
          });
        }
      }

      // 3. Keyword Search
      if (search !== '') {
        var searchCols = options.searchColumns;
        filtered = filtered.filter(function(item) {
          if (searchCols && Array.isArray(searchCols) && searchCols.length > 0) {
            for (var c = 0; c < searchCols.length; c++) {
              var colVal = item[searchCols[c]];
              if (colVal && colVal.toString().toLowerCase().indexOf(search) !== -1) {
                return true;
              }
            }
            return false;
          } else {
            // Search ke seluruh kolom teks jika searchColumns tidak dispesifikasikan
            for (var prop in item) {
              if (prop !== '__rowIndex' && item[prop]) {
                if (item[prop].toString().toLowerCase().indexOf(search) !== -1) {
                  return true;
                }
              }
            }
            return false;
          }
        });
      }

      // 4. Sorting
      if (sortBy) {
        filtered.sort(function(a, b) {
          var valA = a[sortBy] !== undefined ? a[sortBy] : '';
          var valB = b[sortBy] !== undefined ? b[sortBy] : '';

          if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
          if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }

      // 5. Pagination Calculation
      var total = filtered.length;
      var totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
      if (page < 1) page = 1;

      var offset = (page - 1) * limit;
      var paginatedItems = limit > 0 ? filtered.slice(offset, offset + limit) : filtered;

      // Bersihkan metadata internal __rowIndex dari output publik
      var cleanData = paginatedItems.map(function(item) {
        var clone = Object.assign({}, item);
        delete clone.__rowIndex;
        return clone;
      });

      var responsePayload = {
        data: cleanData,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: totalPages
        }
      };

      // Simpan ke Cache jika aktif
      if (useCache && cacheKey) {
        var ttl = CacheManager.getTTLForModule(domainKey);
        setToCache(cacheKey, responsePayload, ttl);
      }

      return responsePayload;
    }

    /**
     * Mengambil 1 baris berdasarkan Primary Key.
     * 
     * @param {string|number} id - Nilai ID yang dicari
     * @param {string} [idColumn] - Nama kolom ID (default: primaryKey instance)
     * @param {boolean} [useCache=true]
     * @returns {Object|null}
     */
    function findById(id, idColumn, useCache) {
      if (id === undefined || id === null || id === '') {
        return null;
      }

      var col = idColumn || primaryKey;
      useCache = (useCache !== false) && enableCache;

      var cacheKey = null;
      if (useCache) {
        cacheKey = generateCacheKey(domainKey, tableKey + '_ID', id.toString());
        var cached = getFromCache(cacheKey);
        if (cached) return cached;
      }

      var res = _readAllEntities();
      var entities = res.entities;

      for (var i = 0; i < entities.length; i++) {
        var item = entities[i];
        var itemVal = item[col] !== undefined ? item[col] : item[col.toLowerCase()];

        if (itemVal != null && itemVal.toString() === id.toString()) {
          // Jangan kembalikan jika berstatus deleted
          if (item[statusColumn] === deletedValue) {
            return null;
          }

          var cleanItem = Object.assign({}, item);
          delete cleanItem.__rowIndex;

          if (useCache && cacheKey) {
            var ttl = CacheManager.getTTLForModule(domainKey);
            setToCache(cacheKey, cleanItem, ttl);
          }

          return cleanItem;
        }
      }

      return null;
    }

    /**
     * Mengambil baris pertama yang cocok dengan kriteria filter.
     * 
     * @param {Object|Function} filterCriteria
     * @returns {Object|null}
     */
    function findOne(filterCriteria) {
      var result = findAll({
        page: 1,
        limit: 1,
        filter: filterCriteria,
        useCache: false
      });

      return (result.data && result.data.length > 0) ? result.data[0] : null;
    }

    /**
     * Menghitung total data aktif sesuai kriteria.
     * 
     * @param {Object|Function} [filterCriteria]
     * @returns {number}
     */
    function count(filterCriteria) {
      var result = findAll({
        page: 1,
        limit: 1,
        filter: filterCriteria,
        useCache: false
      });

      return result.pagination.total;
    }

    /**
     * Menambahkan baris baru ke dalam Spreadsheet.
     * DILINDUNGI SECARA ATOMIK OLEH executeWithLock().
     * Otomatis memicu invalidateAfterMutation(domainKey).
     * 
     * @param {Object} entity - Objek data baru
     * @returns {Object} Data yang berhasil disimpan lengkap dengan ID dan timestamp
     */
    function insert(entity) {
      if (!entity || typeof entity !== 'object') {
        throw createRepositoryError(ERRORS.DATABASE_ERROR, 'Payload insert harus berupa objek data valid');
      }

      // Wajib dijalankan di dalam LockService untuk mencegah race condition
      return executeWithLock(function() {
        var sheet = _getSheet();
        var headerInfo = _getHeaders(true); // Pastikan header mutakhir
        var headers = headerInfo.headers;

        if (headers.length === 0) {
          throw createRepositoryError(ERRORS.DATABASE_ERROR, 'Tabel sheet ' + tableKey + ' belum memiliki kolom header baris 1!');
        }

        var dataToInsert = Object.assign({}, entity);

        // 1. Auto-generate Primary Key jika belum tersedia
        if (!dataToInsert[primaryKey] && !dataToInsert[primaryKey.toLowerCase()]) {
          var autoId = (domainKey.substring(0, 3) + '_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000)).toUpperCase();
          dataToInsert[primaryKey] = autoId;
        }

        // 2. Auto-fill status & timestamp
        var nowIso = new Date().toISOString();
        if (!dataToInsert.created_at && headers.indexOf('created_at') !== -1) {
          dataToInsert.created_at = nowIso;
        }
        if (!dataToInsert.updated_at && headers.indexOf('updated_at') !== -1) {
          dataToInsert.updated_at = nowIso;
        }
        if (!dataToInsert[statusColumn] && headers.indexOf(statusColumn) !== -1) {
          dataToInsert[statusColumn] = 'ACTIVE';
        }

        // 3. Konversi entity menjadi array baris sesuai header fisik
        var rowValues = _objectToRow(dataToInsert, headers);

        // 4. Tulis ke baris terakhir
        sheet.appendRow(rowValues);

        if (SPWN_SYSTEM.DEBUG_MODE) {
          Logger.log('[SpreadsheetRepository] Data baru berhasil di-insert pada ' + domainKey + '.' + tableKey + ' [ID: ' + dataToInsert[primaryKey] + ']');
        }

        // 5. Invalidate Cache Modul Terkait
        invalidateAfterMutation(domainKey);

        return dataToInsert;
      }, { lockContext: 'INSERT_' + domainKey + '_' + tableKey });
    }

    /**
     * Memperbarui kolom baris spesifik (Partial Update).
     * DILINDUNGI SECARA ATOMIK OLEH executeWithLock().
     * Otomatis memicu invalidateAfterMutation(domainKey).
     * 
     * @param {string|number} id - Nilai ID baris yang akan diperbarui
     * @param {Object} partialData - Kolom yang akan diubah
     * @param {string} [idColumn] - Kolom Primary Key
     * @returns {Object} Data lengkap setelah diperbarui
     */
    function update(id, partialData, idColumn) {
      if (id === undefined || id === null || id === '') {
        throw createRepositoryError(ERRORS.INVALID_COLUMN, 'ID baris wajib disertakan untuk operasi update!');
      }

      var col = idColumn || primaryKey;

      return executeWithLock(function() {
        var readResult = _readAllEntities();
        var sheet = readResult.sheet;
        var headers = readResult.headers;
        var entities = readResult.entities;

        // Cari baris target
        var targetEntity = null;
        var targetRowIndex = -1;

        for (var i = 0; i < entities.length; i++) {
          var item = entities[i];
          var itemVal = item[col] !== undefined ? item[col] : item[col.toLowerCase()];

          if (itemVal != null && itemVal.toString() === id.toString()) {
            targetEntity = item;
            targetRowIndex = item.__rowIndex;
            break;
          }
        }

        if (!targetEntity || targetRowIndex === -1) {
          throw createRepositoryError(
            ERRORS.NOT_FOUND,
            'Data dengan ' + col + ' = ' + id + ' tidak ditemukan untuk diperbarui pada ' + tableKey
          );
        }

        // Gabungkan data lama dengan data baru
        var updatedEntity = Object.assign({}, targetEntity, partialData);

        // Update timestamp updated_at jika kolom tersedia
        if (headers.indexOf('updated_at') !== -1) {
          updatedEntity.updated_at = new Date().toISOString();
        }

        // Ambil nilai lama fisik untuk fallback kolom
        var lastCol = headers.length;
        var existingPhysicalRow = sheet.getRange(targetRowIndex, 1, 1, lastCol).getValues()[0];

        // Konversi ke urutan array header
        var updatedRowArray = _objectToRow(updatedEntity, headers, existingPhysicalRow);

        // Tulis kembali ke range baris target
        sheet.getRange(targetRowIndex, 1, 1, lastCol).setValues([updatedRowArray]);

        // Invalidate Cache
        invalidateAfterMutation(domainKey);

        delete updatedEntity.__rowIndex;
        return updatedEntity;
      }, { lockContext: 'UPDATE_' + domainKey + '_' + tableKey });
    }

    /**
     * Menghapus baris data.
     * DEFAULT: SOFT DELETE (Mengubah kolom status menjadi 'DELETED').
     * PHYSICAL DELETE: Hanya jika options.forceDelete === true.
     * 
     * DILINDUNGI SECARA ATOMIK OLEH executeWithLock().
     * Otomatis memicu invalidateAfterMutation(domainKey).
     * 
     * @param {string|number} id 
     * @param {string} [idColumn] 
     * @param {Object} [options] 
     * @param {boolean} [options.forceDelete=false]
     * @returns {boolean} Status keberhasilan
     */
    function deleteRecord(id, idColumn, options) {
      options = options || {};
      var forceDelete = options.forceDelete === true;
      var col = idColumn || primaryKey;

      return executeWithLock(function() {
        var readResult = _readAllEntities();
        var sheet = readResult.sheet;
        var headers = readResult.headers;
        var entities = readResult.entities;

        var targetRowIndex = -1;

        for (var i = 0; i < entities.length; i++) {
          var item = entities[i];
          var itemVal = item[col] !== undefined ? item[col] : item[col.toLowerCase()];

          if (itemVal != null && itemVal.toString() === id.toString()) {
            targetRowIndex = item.__rowIndex;
            break;
          }
        }

        if (targetRowIndex === -1) {
          throw createRepositoryError(
            ERRORS.NOT_FOUND,
            'Data dengan ' + col + ' = ' + id + ' tidak ditemukan untuk dihapus pada ' + tableKey
          );
        }

        if (forceDelete) {
          // Penghapusan Fisik Baris
          sheet.deleteRow(targetRowIndex);
          if (SPWN_SYSTEM.DEBUG_MODE) {
            Logger.log('[SpreadsheetRepository] Physical delete row ' + targetRowIndex + ' pada ' + tableKey);
          }
        } else {
          // Soft Delete Default: Ubah kolom status & deleted_at
          var patch = {};
          patch[statusColumn] = deletedValue;
          if (headers.indexOf('deleted_at') !== -1) {
            patch.deleted_at = new Date().toISOString();
          }

          var headerMap = _getHeaders().headerMap;
          var statusColIdx = headerMap[statusColumn];

          if (statusColIdx !== undefined) {
            sheet.getRange(targetRowIndex, statusColIdx + 1).setValue(deletedValue);
            if (headerMap['deleted_at'] !== undefined) {
              sheet.getRange(targetRowIndex, headerMap['deleted_at'] + 1).setValue(new Date().toISOString());
            }
          } else {
            // Jika sheet tidak memiliki kolom status, lakukan update biasa
            update(id, patch, col);
          }
        }

        // Invalidate Cache Modul
        invalidateAfterMutation(domainKey);

        return true;
      }, { lockContext: 'DELETE_' + domainKey + '_' + tableKey });
    }

    return {
      domainKey: domainKey,
      tableKey: tableKey,
      primaryKey: primaryKey,
      findAll: findAll,
      findById: findById,
      findOne: findOne,
      count: count,
      insert: insert,
      update: update,
      delete: deleteRecord
    };
  }

  return {
    ERRORS: ERRORS,
    create: create
  };
})();
