/**
 * PATCH:
 * SPWN Apps 2.0 API Client
 *
 * Fix:
 * - Do NOT call Google Apps Script directly from browser
 * - Always use Vercel proxy /api/spwn
 */

import { SpwnApiError, handleApiError } from './apiError';

export interface RequestOptions {
  headers?: Record<string, string>;
  token?: string | null;
  signal?: AbortSignal;
}

class SpwnApiClient {

  private baseUrl:string;
  private tokenGetter:(()=>string|null)|null = null;


  constructor(){

    // Production frontend MUST use Vercel Proxy
    this.baseUrl =
      import.meta.env.VITE_SPWN_API_URL ||
      '/api/spwn';


    // Prevent accidental direct GAS call
    if(
      this.baseUrl.includes('script.google.com') ||
      this.baseUrl.includes('script.googleusercontent.com')
    ){

      this.baseUrl = '/api/spwn';

    }

  }



  public registerTokenGetter(
    getter:()=>string|null
  ){

    this.tokenGetter = getter;

  }



  private getToken(
    override?:string|null
  ){

    if(override)
      return override;


    if(this.tokenGetter){

      const token =
        this.tokenGetter();

      if(token)
        return token;

    }


    try{

      return localStorage.getItem(
        'spwn_session_token'
      );

    }catch{

      return null;

    }

  }



  private buildUrl(
    action:string,
    params?:Record<string,any>,
    token?:string|null
  ){

    const url =
      new URL(
        this.baseUrl,
        window.location.origin
      );


    url.searchParams.set(
      'action',
      action
    );


    if(token){

      url.searchParams.set(
        'token',
        token
      );

    }


    if(params){

      Object.entries(params)
      .forEach(([k,v])=>{

        if(v!==undefined && v!==null){

          url.searchParams.set(
            k,
            String(v)
          );

        }

      });

    }


    return url.toString();

  }



  async post<T>(
    action:string,
    body:Record<string,unknown>={},
    params?:Record<string,any>,
    options?:RequestOptions
  ):Promise<any>{


    try{


      const token =
        this.getToken(
          options?.token
        );


      const response =
        await fetch(
          this.buildUrl(
            action,
            params,
            token
          ),
          {
            method:'POST',
            headers:{
              'Content-Type':'application/json',
              'Accept':'application/json',
              ...(options?.headers || {})
            },
            body:JSON.stringify({
              ...body,
              action,
              token
            }),
            signal:options?.signal
          }
        );


      const json =
        await response.json();


      if(!json.success){

        throw new SpwnApiError(
          json.message || 'API Error',
          response.status,
          json.error?.code || 'SPWN_ERROR',
          action
        );

      }


      return json;


    }catch(err){

      throw handleApiError(
        err,
        action
      );

    }

  }



  async get<T>(
    action:string,
    params?:Record<string,any>,
    options?:RequestOptions
  ):Promise<any>{


    const token =
      this.getToken(
        options?.token
      );


    const response =
      await fetch(
        this.buildUrl(
          action,
          params,
          token
        ),
        {
          method:'GET',
          headers:{
            Accept:'application/json'
          }
        }
      );


    return response.json();

  }

}


export const apiClient =
  new SpwnApiClient();
