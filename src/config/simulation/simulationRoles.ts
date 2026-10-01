/**
 * SPWN Apps 2.0
 * Simulation Roles
 */

export const SIMULATION_ROLES = {
  MEMBER: {
    role: "MEMBER",
    permissions: [
      "profile.view",
      "kta.view",
      "achievement.view",
      "portfolio.view"
    ]
  },

  PANGKALAN: {
    role: "PANGKALAN",
    permissions: [
      "member.manage",
      "activity.manage"
    ]
  },

  ADMIN_WILAYAH: {
    role: "ADMIN_WILAYAH",
    permissions: [
      "region.view",
      "member.monitor",
      "approval.manage"
    ]
  },

  ADMIN_PUSAT: {
    role: "ADMIN_PUSAT",
    permissions: [
      "national.view",
      "member.monitor"
    ]
  },

  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    permissions: ["*"]
  }
};
