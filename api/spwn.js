/**
 * SPWN Apps 2.0
 * Vercel API Proxy Gateway
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
      success:true
    });

  }



  try {


    const SPWN_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzuR8k2KbXHb6om2eNaIGM3yBBBsZtEFoLKji1H2dAWp4a6v8nrBAbwQj_S5S-SPBtXOg/exec";


const url =
  new URL(
    SPWN_SCRIPT_URL
  );



    // teruskan query parameter

    Object.entries(
      req.query || {}
    ).forEach(
      ([key,value]) => {

        url.searchParams.set(
          key,
          value
        );

      }
    );



    let body = undefined;



    if(req.method === "POST") {

      body =
        JSON.stringify(
          req.body
        );

    }



    const response =
      await fetch(
        url.toString(),
        {

          method:req.method,

          headers:{
            "Content-Type":
              "application/json"
          },

          body

        }
      );



    const data =
      await response.json();



    return res
      .status(200)
      .json(data);



  } catch(error){


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
