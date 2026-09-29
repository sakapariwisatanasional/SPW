/**
 * SPWN Apps 2.0
 * Admin Achievement Mapper
 *
 * Fungsi:
 * Menggabungkan data member.list dengan
 * admin.achievement.member.detail
 *
 * Tidak mengubah GAS.
 */

export interface AchievementMemberViewModel {

  id:string;

  noKta:string;

  name:string;

  province:string;

  krida:string;

  status:string;

  level:string;

  completedSkk:number;

  score:number;

  validatedSkkCount:number;

  pendingValidationCount:number;

}



export function mapMemberAchievement(
  member:any,
  detail:any
):AchievementMemberViewModel {


 const achievement =
  detail?.achievement || {};


 const summary =
  detail?.summary || {};



 return {

  id:
   member.id || "",


  noKta:
   member.no_kta || "",


  name:
   member.full_name ||
   member.nama_lengkap ||
   "",


  province:
   member.province || "",


  krida:
   member.krida || "",


  status:
   member.status || "",


  level:
   achievement.level || "",


  completedSkk:
   Number(
    achievement.completedSkk || 0
   ),


  score:
   Number(
    achievement.averageScore || 0
   ),


  validatedSkkCount:
   Number(
    summary.validatedSkkCount || 0
   ),


  pendingValidationCount:
   Number(
    summary.pendingValidationCount || 0
   )

 };

}



export function mapMemberListWithAchievement(
 members:any[],
 details:any[]
):AchievementMemberViewModel[]{


 return members.map((member)=>{


  const detail =
   details.find(
    item =>
    item.member?.no_kta === member.no_kta
   ) || {};



  return mapMemberAchievement(
   member,
   detail
  );


 });


}
