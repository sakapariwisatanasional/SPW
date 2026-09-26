/**
 * SPWN Apps 2.0
 * Frontend API Client CLEAN
 *
 * Function:
 * - Connect React Frontend -> SPWN API
 * - Centralized request handler
 * - Authentication support
 */


const SPWN_API_URL = "/api/spwn";


async function spwnRequest(action, payload = {}, authToken = null){

  const headers = {
    "Content-Type":"application/json"
  };


  const token =
    authToken ||
    payload.token ||
    null;


  if(token){

    headers["Authorization"] =
      "Bearer " + token;

  }


  const requestBody = {

    action: action,

    ...payload

  };


  const response =
    await fetch(
      SPWN_API_URL,
      {
        method:"POST",
        headers:headers,
        body:JSON.stringify(requestBody)
      }
    );


  const result =
    await response.json();


  if(!result.success){

    throw new Error(
      result.message ||
      "API Error"
    );

  }


  return result;

}





async function login(email,password){

  const result =
    await spwnRequest(
      "auth.login",
      {
        body:{
          email:email,
          password:password
        }
      }
    );


  return result.data;

}





async function getProfile(userId,token){

  const result =
    await spwnRequest(
      "auth.me",
      {
        body:{
          user_id:userId
        }
      },
      token
    );


  return result.data;

}





async function logout(userId,token){

  const result =
    await spwnRequest(
      "auth.logout",
      {
        body:{
          user_id:userId
        }
      },
      token
    );


  return result.data;

}





async function getDashboardSummary(token){

  const result =
    await spwnRequest(
      "admin.dashboard.summary",
      {},
      token
    );


  return result.data;

}





async function getMembers(token,status=""){

  const result =
    await spwnRequest(
      "member.list",
      {
        query:{
          status:status
        }
      },
      token
    );


  return result.data;

}





async function getMemberDetail(memberId,token){

  const result =
    await spwnRequest(
      "member.detail",
      {
        body:{
          member_id:memberId
        }
      },
      token
    );


  return result.data;

}





async function createContent(data,token){

  const result =
    await spwnRequest(
      "content.create",
      {
        body:data
      },
      token
    );


  return result.data;

}





async function getContents(token,status=""){

  const result =
    await spwnRequest(
      "content.list",
      {
        query:{
          status:status
        }
      },
      token
    );


  return result.data;

}





async function getUsers(token,filter={}){

  const result =
    await spwnRequest(
      "user.list",
      {
        query:filter
      },
      token
    );


  return result.data;

}





window.spwnApi = {

  spwnRequest,

  login,

  getProfile,

  logout,

  getDashboardSummary,

  getMembers,

  getMemberDetail,

  createContent,

  getContents,

  getUsers

};
