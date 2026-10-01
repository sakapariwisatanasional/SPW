/**
 * SPWN Apps 2.0
 * Shared Simulation Member FINAL
 *
 * Prinsip:
 * - Semua level user tetap memakai anggota yang sama.
 * - Role hanya mengubah hak akses.
 * - Member ID mengikuti database SPWN asli.
 */

export const DEMO_MEMBER = {

  id: "SPW-750712",

  memberId: "SPW-750712",

  noKta: "00.00.000.000003",

  fullName: "ROHADI WIJAYA",

  nama: "ROHADI WIJAYA",

  email: "scoutpreneur@gmail.com",

  level: "MADYA",

  simulationMode: true,


  // data organisasi
  province: "",
  city: "",
  district: "",

  pangkalan: "",


  krida: [],


  // flag agar adapter mengetahui
  source: "MEMBER_LIST_DATABASE"

};
