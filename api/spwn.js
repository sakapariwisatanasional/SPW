/**
 * SPWN Apps 2.0
 * Vercel Proxy Gateway - FINAL v4
 *
 * Purpose:
 * - Frontend endpoint: /api/spwn
 * - Backend: Google Apps Script Web App MAIN
 * - Transparently forwards GET/POST requests
 * - Preserves action, query parameters, JSON body and token
 * - Returns GAS response without converting it to an HTML page
 *
 * MAIN GAS DEPLOYMENT:
 * https://script.google.com/macros/s/AKfycbzuR8k2KbXHb6om2eNaIGm3yBBBsZtEFoLKji1H2dAWp4a6v8nrBAbwQj_S5S-SPBtXOg/exec
 */

const SPW_GAS_URL =
  "https://script.google.com/macros/s/AKfycbzuR8k2KbXHb6om2eNaIGm3yBBBsZtEFoLKji1H2dAWp4a6v8nrBAbwQj_S5S-SPBtXOg/exec";


/* =========================================================
   CORS
========================================================= */

function setCors(res) {

  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Type"
  );

}


/* =========================================================
   BODY READER
========================================================= */

async function readBody(req) {

  if (!req || req.body == null) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {

    if (!req.body.trim()) {
      return {};
    }

    try {
      return JSON.parse(req.body);
    } catch (err) {

      return {
        _rawBody: req.body
      };

    }

  }

  return {};

}


/* =========================================================
   QUERY BUILDER
========================================================= */

function buildTargetUrl(req, body) {

  const incomingUrl =
    req.url ||
    "/api/spwn";

  const parsed =
    new URL(
      incomingUrl,
      "https://spwn-proxy.local"
    );

  const target =
    new URL(SPW_GAS_URL);

  /*
   * Preserve every query parameter sent by frontend.
   * This includes:
   * action
   * token
   * pagination
   * search
   * filter
   * etc.
   */

  parsed.searchParams.forEach(
    (value, key) => {

      if (
        key !== "action" ||
        !target.searchParams.has("action")
      ) {

        target.searchParams.append(
          key,
          value
        );

      }

    }
  );

  /*
   * For POST requests action/token are also
   * available in JSON body. Add them to query
   * as a compatibility fallback for GAS.
   */

  if (
    body &&
    typeof body === "object"
  ) {

    if (
      body.action &&
      !target.searchParams.has("action")
    ) {

      target.searchParams.set(
        "action",
        String(body.action)
      );

    }

    if (
      body.token &&
      !target.searchParams.has("token")
    ) {

      target.searchParams.set(
        "token",
        String(body.token)
      );

    }

  }

  return target.toString();

}


/* =========================================================
   SAFE RESPONSE
========================================================= */

async function relayGasResponse(
  response,
  res
) {

  const contentType =
    response.headers.get(
      "content-type"
    ) ||
    "application/json; charset=utf-8";

  const text =
    await response.text();

  /*
   * Always relay the actual GAS payload.
   * Do not replace a GAS JSON error with an
   * unrelated proxy-generated HTML page.
   */

  res.status(
    response.status
  );

  res.setHeader(
    "Content-Type",
    contentType
  );

  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  res.send(text);

}


/* =========================================================
   MAIN HANDLER
========================================================= */

export default async function handler(
  req,
  res
) {

  setCors(res);

  /* -----------------------------------------------
     OPTIONS / PREFLIGHT
  ----------------------------------------------- */

  if (
    req.method === "OPTIONS"
  ) {

    res.status(204).end();

    return;

  }


  /* -----------------------------------------------
     Allow only GET and POST
  ----------------------------------------------- */

  if (
    req.method !== "GET" &&
    req.method !== "POST"
  ) {

    res.status(405).json({

      success:false,

      statusCode:405,

      message:
        "Method tidak didukung",

      action:
        "",

      data:null,

      pagination:null,

      error:{
        code:
          "SPWN_METHOD_NOT_ALLOWED"
      }

    });

    return;

  }


  try {

    const body =
      req.method === "POST"
        ? await readBody(req)
        : {};


    const targetUrl =
      buildTargetUrl(
        req,
        body
      );


    /*
     * Forward only the headers that are
     * meaningful to the GAS Web App.
     */

    const headers = {

      "Accept":
        "application/json",

      "Content-Type":
        "application/json"

    };


    if (
      req.headers &&
      req.headers.authorization
    ) {

      headers.Authorization =
        req.headers.authorization;

    }


    let gasResponse;


    /* -----------------------------------------------
       GET
    ----------------------------------------------- */

    if (
      req.method === "GET"
    ) {

      gasResponse =
        await fetch(
          targetUrl,
          {
            method:"GET",
            headers,
            redirect:"follow"
          }
        );

    }


    /* -----------------------------------------------
       POST
    ----------------------------------------------- */

    else {

      /*
       * Ensure action is present in body even when
       * frontend only supplied it as query parameter.
       */

      const url =
        new URL(targetUrl);

      const action =
        url.searchParams.get(
          "action"
        );

      const token =
        url.searchParams.get(
          "token"
        );


      const forwardedBody = {

        ...(body || {}),

        ...(action &&
        !body.action
          ? { action }
          : {}),

        ...(token &&
        !body.token
          ? { token }
          : {})

      };


      gasResponse =
        await fetch(
          targetUrl,
          {
            method:"POST",

            headers,

            body:
              JSON.stringify(
                forwardedBody
              ),

            redirect:"follow"
          }
        );

    }


    await relayGasResponse(
      gasResponse,
      res
    );

  } catch (error) {

    console.error(
      "[SPWN_PROXY_ERROR]",
      error
    );


    res.status(502).json({

      success:false,

      statusCode:502,

      message:
        error instanceof Error
          ? error.message
          : "Gagal menghubungi backend GAS",

      action:
        "",

      data:null,

      pagination:null,

      error:{
        code:
          "SPWN_PROXY_GAS_UNAVAILABLE",

        details:
          String(error)
      },

      meta:{
        proxy:true,

        timestamp:
          new Date().toISOString()
      }

    });

  }

}
