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
import { KtaCardSide, KtaMemberBindingData, KtaCardSettings } from '../../../types/kta.types';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { memberApi } from '../../../services/api/member.api';
import { spreadsheetService } from '../../../services/spreadsheetService';
import { mapMemberToKtaBinding } from '../../../utils/ktaMemberMapper';


export const MemberKtaView: React.FC = () => {

  const { currentUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [cardSide, setCardSide] = useState<KtaCardSide>('FRONT');
  const [ktaData, setKtaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templateSettings, setTemplateSettings] = useState<KtaCardSettings | null>(null);


  useEffect(() => {
    void loadKta();
    void loadTemplate();
  }, [currentUser]);

  async function loadTemplate() {
    try {
      const template = await spreadsheetService.refreshKtaSettings('TMPL_DEFAULT');
      setTemplateSettings(template);
    } catch (error) {
      console.error('Member KTA template loading error:', error);
      setTemplateSettings(null);
    }
  }


  async function loadKta(){

    try{

      setLoading(true);

      const memberId =
        currentUser?.memberId ||
        currentUser?.id;


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



  const memberBinding: KtaMemberBindingData | null =
    useMemo(() => {
      if (!ktaData) return null;
      return mapMemberToKtaBinding(ktaData);
    }, [ktaData]);



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

  if(!templateSettings){

    return (
      <div className="p-8 text-center text-amber-700">
        Template KTA TMPL_DEFAULT belum berhasil dimuat dari GAS.
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

          previewSettings={templateSettings}

          side={cardSide}

          onSideChange={setCardSide}

          showControls={true}

        />

      </div>


    </div>

  );

};
