/**
 * SPWN Apps 2.0
 * Frontend API Client
 *
 * Function:
 * - Connect Frontend Web to Google Apps Script API Gateway
 * - Get Member List
 * - Get Member Detail
 * - Verify QR KTA
 * - Verify Nomor KTA
 */


const SPWN_API_URL =
  "https://script.google.com/macros/s/AKfycbzuR8k2KbXHb6om2eNaIGM3yBBBsZtEFoLKji1H2dAWp4a6v8nrBAbwQj_S5S-SPBtXOg/exec";



async function spwnRequest(action, payload) {


  const response = await fetch(

    SPWN_API_URL,

    {

      method: "POST",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify({

        action: action,

        ...(payload || {})

      })

    }

  );



  const result =
    await response.json();



  if (!result.success) {

    throw new Error(

      result.message ||
      "API Request Failed"

    );

  }



  return result;

}





/**
 * MEMBER LIST
 */

async function getMembers() {


  const result =
    await spwnRequest(

      "member.list",

      {

        query:{}

      }

    );



  return result.data.items;


}





/**
 * MEMBER DETAIL
 */

async function getMemberDetail(id) {


  const result =
    await spwnRequest(

      "member.detail",

      {

        query:{

          id:id

        }

      }

    );



  return result.data;


}





/**
 * QR VERIFICATION
 */

async function verifyQR(token) {


  const result =
    await spwnRequest(

      "verification.qr",

      {

        body:{

          token:token

        }

      }

    );



  return result.data;


}





/**
 * KTA VERIFICATION
 */

async function verifyKTA(nomorKTA) {


  const result =
    await spwnRequest(

      "verification.kta",

      {

        body:{

          nomor_kta:
            nomorKTA

        }

      }

    );



  return result.data;


}