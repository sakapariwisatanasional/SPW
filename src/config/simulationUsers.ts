/**
 * SPWN Apps 2.0
 * SuperAdmin Role Simulation Data
 *
 * Dummy user untuk testing semua level akses
 * Tidak terhubung ke GAS
 */

export const SIMULATION_USERS = {

  MEMBER_AKTIF: {

    id: "SIM-MEMBER-001",

    memberId: "SIM-MEMBER-001",

    role: "MEMBER",

    nama:
      "Fajar Pratama",

    no_kta:
      "SIM-KTA-001",

    province:
      "Jawa Timur",

    level:
      "MADYA",


    summary: {

      completedSkk: 12,

      inProgressSkk: 3,

      progressPercent: 75

    },


    badges: [

      {
        id:"badge-001",
        name:"SKK Purwa",
        status:"VERIFIED"
      }

    ],


    activities:[

      {
        id:"act-001",
        title:"Kemah Bakti Wisata",
        year:2026
      },

      {
        id:"act-002",
        title:"Pelatihan Pariwisata",
        year:2026
      }

    ]

  },


  MEMBER_BARU: {

    id:"SIM-MEMBER-002",

    memberId:"SIM-MEMBER-002",

    role:"MEMBER",

    nama:
      "Anggota Baru",

    no_kta:
      "SIM-KTA-002",

    province:
      "DKI Jakarta",

    level:
      "PURWA",


    summary: {

      completedSkk:0,

      inProgressSkk:0,

      progressPercent:0

    },


    badges:[],

    activities:[]

  },


  PEMBINA_SAKA: {

    id:"SIM-PEMBINA-001",

    role:"PEMBINA",

    nama:
      "Pembina SAKA Demo",

    province:
      "Bali",


    dashboard:{

      anggota:45,

      kegiatan:12,

      validasi:20

    }

  },


  PENGURUS_PROVINSI: {

    id:"SIM-PENGURUS-001",

    role:"PENGURUS_PROVINSI",

    nama:
      "Pengurus Provinsi Demo",

    province:
      "Jawa Barat",


    dashboard:{

      anggota:250,

      pangkalan:35,

      kegiatan:45

    }

  },


  ADMIN_PUSAT: {

    id:"SIM-ADMIN-001",

    role:"ADMIN_PUSAT",

    nama:
      "Admin Pusat Demo"

  }


};


export type SimulationUser =
  typeof SIMULATION_USERS[keyof typeof SIMULATION_USERS];