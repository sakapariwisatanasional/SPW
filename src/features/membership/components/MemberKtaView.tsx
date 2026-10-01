/**
 * SPWN Apps 2.0 - Member Digital KTA Experience FINAL API SYNC FIX
 *
 * Fix:
 * - Menghapus route member.kta.detail yang tidak tersedia
 * - Menggunakan member.detail sesuai member.api.ts
 * - Mendukung SuperAdmin simulation member
 */

import React, { useEffect, useMemo, useState } from 'react';
import { DigitalMemberCard } from '../../admin/components/DigitalMemberCard';
import { KtaCardSide, KtaMemberBindingData } from '../../../types/kta.types';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { memberApi } from '../../../services/api/member.api';


export const MemberKtaView: React.FC = () => {

  const { currentUser, getEffectiveUser } = useAuthStore();
  const { addToast } = useUIStore();

  const effectiveUser = getEffectiveUser();

  const [cardSide, setCardSide] = useState<KtaCardSide>('FRONT');
  const [ktaData, setKtaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadKta();
  }, [effectiveUser]);


  async function loadKta(){

    try{

      setLoading(true);

      const memberId =
        effectiveUser?.memberProfile?.id ||
        effectiveUser?.memberProfile?.memberId ||
        effectiveUser?.memberId ||
        '';


      if(!memberId){
        throw new Error("Member ID tidak tersedia");
      }


      const response =
        await memberApi.detail(memberId);


      const member =
        response?.data;


      if(!member){

        throw new Error(
          "Data KTA tidak ditemukan"
        );

      }


      setKtaData(member);


    }catch(e:any){

      console.error(
        "Member KTA loading error:",
        e
      );

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
          ktaData.nationalMemberNumber ||
          ktaData.no_kta,

        fullName:
          ktaData.fullName ||
          ktaData.nama_lengkap,

        membershipLevel:
          ktaData.membershipLevel ||
          ktaData.position ||
          "Anggota",

        currentPosition:
          ktaData.currentPosition ||
          ktaData.position ||
          "Anggota",

        provinceName:
          ktaData.province,

        regencyName:
          ktaData.city,

        districtName:
          ktaData.district,

        kwartirName:
          ktaData.city
            ? `Kwarcab ${ktaData.city}`
            : 'Kwarcab SAKA Pariwisata',

        kwartirHierarchy:
          [
            ktaData.province
              ? `Kwarda ${ktaData.province}`
              : '',
            ktaData.city
              ? `Kwarcab ${ktaData.city}`
              : '',
            ktaData.district
              ? `Kwarran ${ktaData.district}`
              : ''
          ]
          .filter(Boolean)
          .join(' • ')
          ||
          'Kwartir Nasional',

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
          ktaData.nationalMemberNumber ||
          ktaData.no_kta

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

          onSideChange={setCardSide}

          showControls={true}

        />

      </div>


    </div>

  );

};
