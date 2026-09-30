/**
 * SPWN Apps 2.0
 * SuperAdmin Simulation Users
 *
 * Dummy data untuk testing seluruh role aplikasi
 * Tidak terhubung dengan GAS / database produksi
 */


export const SIMULATION_USERS = {


  MEMBER_AKTIF: {

    id: "SIM-MEMBER-001",

    memberId: "SIM-MEMBER-001",

    role: "MEMBER",

    nama: "Fajar Pratama",

    full_name: "Fajar Pratama",

    no_kta: "SIM-KTA-001",

    province: "Jawa Timur",

    level: "MADYA",


    summary: {

      completedSkk: 12,

      inProgressSkk: 3,

      progressPercent: 75,

      totalSkk: 15

    },


    achievement: {

      level: "MADYA",

      completedSkk: 12,

      averageScore: 88

    },


    badges: [

      {
        id: "BADGE-001",
        name: "SKK Purwa",
        status: "VERIFIED"
      },

      {
        id: "BADGE-002",
        name: "Pelatih Dasar",
        status: "VERIFIED"
      }

    ],


    activities: [

      {
        id:"ACT-001",
        title:"Kemah Bakti Wisata",
        year:2026,
        status:"SELESAI"
      },

      {
        id:"ACT-002",
        title:"Pelatihan Pariwisata",
        year:2026,
        status:"SELESAI"
      }

    ],


    skkItems:[

      {
        id:"SKK-001",
        name:"Pemandu Wisata",
        status:"DONE"
      },

      {
        id:"SKK-002",
        name:"Kewirausahaan",
        status:"PROCESS"
      }

    ]

  },


  MEMBER_BARU: {


    id:"SIM-MEMBER-002",

    memberId:"SIM-MEMBER-002",

    role:"MEMBER",

    nama:"Anggota Baru",

    full_name:"Anggota Baru",

    no_kta:"SIM-KTA-002",

    province:"DKI Jakarta",

    level:"PURWA",


    summary:{

      completedSkk:0,

      inProgressSkk:0,

      progressPercent:0,

      totalSkk:0

    },


    achievement:{

      level:"PURWA",

      completedSkk:0,

      averageScore:0

    },


    badges:[],

    activities:[],

    skkItems:[]

  },


  PEMBINA_SAKA: {


    id:"SIM-PEMBINA-001",

    role:"PEMBINA",

    nama:"Pembina SAKA Demo",

    province:"Bali",


    dashboard:{

      anggota:45,

      kegiatan:12,

      validasi:20

    }

  },


  PENGURUS_PROVINSI:{


    id:"SIM-PENGURUS-001",

    role:"PENGURUS_PROVINSI",

    nama:"Pengurus Provinsi Demo",

    province:"Jawa Barat",


    dashboard:{

      anggota:250,

      pangkalan:35,

      kegiatan:45

    }

  },


  ADMIN_PUSAT:{


    id:"SIM-ADMIN-001",

    role:"ADMIN_PUSAT",

    nama:"Admin Pusat Demo"


  }


};


export type SimulationUser =
typeof SIMULATION_USERS[
 keyof typeof SIMULATION_USERS
];
