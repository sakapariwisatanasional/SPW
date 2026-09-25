/**
 * SPWN Apps 2.0 - Member Digital KTA Experience FINAL API SYNC
 *
 * Integrasi:
 * Frontend MemberKtaView
 *        |
 *        ↓
 * GAS Action: member.kta.detail
 *        |
 *        ↓
 * DigitalMemberCard Dynamic Renderer
 */

import React, { useEffect, useMemo, useState } from 'react';
import { DigitalMemberCard } from '../../admin/components/DigitalMemberCard';
import { KtaCardSide, KtaMemberBindingData } from '../../../types/kta.types';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';


export const MemberKtaView: React.FC = () => {

  const { currentUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [cardSide, setCardSide] = useState<KtaCardSide>('FRONT');
  const [ktaData, setKtaData] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    loadKta();

  }, []);



  async function loadKta(){

    try{

      setLoading(true);


      const response =
        await fetch(
          "/api?action=member.kta.detail&member_id=" +
          currentUser.memberId
        );


      const result =
        await response.json();


      if(!result.success){

        throw new Error(
          "Data KTA tidak ditemukan"
        );

      }


      setKtaData(
        result.member
      );


      setTemplate(
        result.template
      );


    }catch(e:any){

      addToast({
        type:"error",
        title:"Gagal Memuat KTA",
        message:e.message
      });

    }finally{

      setLoading(false);

    }

  }



  const memberBinding:KtaMemberBindingData | null =
    useMemo(()=>{

      if(!ktaData) return null;


      return {

        id:
          ktaData.id,


        nationalMemberNumber:
          ktaData.noKta,


        fullName:
          ktaData.fullName,


        membershipLevel:
          ktaData.position || "Anggota",


        currentPosition:
          ktaData.position || "Anggota",


        provinceName:
          ktaData.province,


        regencyName:
          ktaData.city,


        districtName:
          ktaData.district,


        kwartirName:
          ktaData.city ? `Kwarcab ${ktaData.city}` : 'Kwarcab SAKA Pariwisata',


        kwartirHierarchy:
          [ktaData.province ? `Kwarda ${ktaData.province}` : '', ktaData.city ? `Kwarcab ${ktaData.city}` : '', ktaData.district ? `Kwarran ${ktaData.district}` : ''].filter(Boolean).join(' • ') || 'Kwartir Nasional',


        krida:
          ktaData.krida,


        phone:
          ktaData.phone,


        email:
          ktaData.email,


        status:
          ktaData.status,


        photoUrl:
          ktaData.photoUrl,


        qrUrl:
          ktaData.verificationUrl,


        qrToken:
          ktaData.noKta

      };


    },[ktaData]);



  if(loading){

    return (
      <div className="p-8 text-center">
        Memuat Kartu Tanda Anggota...
      </div>
    );

  }



  if(!memberBinding){

    return (
      <div className="p-8 text-center">
        Data KTA tidak tersedia
      </div>
    );

  }



  return (

    <div className="space-y-6">

      <div className="bg-white rounded-3xl border p-6">

        <h2 className="text-xl font-black">
          Kartu Tanda Anggota (KTA) Digital
        </h2>

        <p className="text-sm text-slate-500">
          KTA dinamis terhubung langsung dengan database SPWN.
        </p>

      </div>


      <div className="flex justify-center">

        <DigitalMemberCard

          member={memberBinding}

          side={cardSide}

          onSideChange={
            setCardSide
          }

          showControls={true}

        />

      </div>


    </div>

  );


};
