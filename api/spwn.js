/**
 * SPWN Apps 2.0
 * Vercel API Proxy
 *
 * Browser
 *    ↓
 * Vercel API
 *    ↓
 * Google Apps Script Web App
 *
 * Fungsi:
 * - Mengatasi CORS
 * - Menyembunyikan URL Apps Script
 * - Gateway frontend production
 */


export default async function handler(req, res) {


  // CORS untuk frontend sendiri

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );


  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );


  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );



  // Handle preflight browser

  if (req.method === "OPTIONS") {

    return res.status(200).json({
      success:true
    });

  }



  if (req.method !== "POST") {

    return res.status(405).json({

      success:false,

      message:
        "Method not allowed"

    });

  }



  try {


    const response =
      await fetch(

        process.env.SPWN_SCRIPT_URL,

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },


          body:

            JSON.stringify(
              req.body
            )

        }

      );



    const data =
      await response.json();



    return res.status(200).json(
      data
    );



  } catch(error){


    return res.status(500).json({

      success:false,

      error_code:
        "PROXY_ERROR",

      message:
        error.message

    });


  }


}