/**
 * SPWN Apps 2.0
 * Vercel API Proxy Gateway
 *
 * Perbaikan:
 * - Menangani response GAS yang bukan JSON
 * - Menampilkan error backend asli
 * - Mencegah JSON parse crash
 */

export default async function handler(req, res) {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );


  if (req.method === "OPTIONS") {

    return res.status(200).json({
      success: true
    });

  }


  try {

    const SPWN_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbzuR8k2KbXHb6om2eNaIGM3yBBBsZtEFoLKji1H2dAWp4a6v8nrBAbwQj_S5S-SPBtXOg/exec";


    const url =
      new URL(SPWN_SCRIPT_URL);


    Object.entries(
      req.query || {}
    ).forEach(
      ([key, value]) => {

        url.searchParams.set(
          key,
          String(value)
        );

      }
    );


    let body;


    if (req.method === "POST") {

      body =
        JSON.stringify(
          req.body || {}
        );

    }


    const forwardHeaders = {

      "Content-Type":
        "application/json"

    };


    if (
      req.headers &&
      req.headers.authorization
    ) {

      forwardHeaders["Authorization"] =
        req.headers.authorization;

    }


    const response =
      await fetch(
        url.toString(),
        {
          method:req.method,
          headers:forwardHeaders,
          body
        }
      );


    const rawText =
      await response.text();


    let data;


    try {

      data =
        JSON.parse(rawText);


    } catch(error) {


      return res
        .status(502)
        .json({

          success:false,

          error_code:
            "GAS_RESPONSE_INVALID",

          message:
            "Google Apps Script mengembalikan response bukan JSON",

          gas_status:
            response.status,

          gas_response:
            rawText.substring(0,1000)

        });

    }



    return res
      .status(response.status)
      .json(data);



  } catch(error) {


    return res
      .status(500)
      .json({

        success:false,

        error_code:
          "PROXY_ERROR",

        message:
          error.message

      });

  }

}
