/**
 * SPWN Apps 2.0
 * Admin Achievement Types
 */


export interface AdminAchievementDashboard {

 totalMember:number;

 achievementMember:number;

 validatedMember:number;

 validatedSkk:number;

 pendingValidationSkk:number;

 notAchievedMember:number;

 levelDistribution:{
  PURWA:number;
  MADYA:number;
  UTAMA:number;
 };

 averageScore:number;

}


export interface AdminAchievementSummary {

 validatedSkkCount:number;

 pendingValidationCount:number;

}
