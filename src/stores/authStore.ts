/**
 * SPWN Apps 2.0
 * AuthStore Profile Update Extension
 *
 * Add this function inside AuthState:
 *
 * updateCurrentUserProfile
 *
 */


updateCurrentUserProfile:
async(profileData:any)=>{


  const user =
    get().currentUser;


  if(!user){

    throw new Error(
      "User belum login"
    );

  }


  const memberId =
    user.memberProfile?.id ||
    user.memberId;



  if(!memberId){

    throw new Error(
      "Member ID tidak ditemukan"
    );

  }



  const result =
    await memberApi.updateProfile({

      member_id:
        memberId,


      data:{

        full_name:
          profileData.fullName,


        phone:
          profileData.phone,


        province:
          profileData.province,


        city:
          profileData.cityName,


        district:
          profileData.districtName,


        krida:
          profileData.kridaName,


        photo_url:
          profileData.avatarUrl

      },


      actor:
        user.id

    });



  if(!result.success){

    throw new Error(
      result.message ||
      "Gagal memperbarui profil"
    );

  }



  const updatedUser = {

    ...user,

    memberProfile:{

      ...user.memberProfile,

      full_name:
        profileData.fullName,

      phone:
        profileData.phone,

      province:
        profileData.province,

      city:
        profileData.cityName,

      district:
        profileData.districtName,

      krida:
        profileData.kridaName,

      photo_url:
        profileData.avatarUrl

    }

  };



  localStorage.setItem(

    'spwn_session_user',

    JSON.stringify(updatedUser)

  );



  set({

    currentUser:
      updatedUser

  });



  return result;


}
