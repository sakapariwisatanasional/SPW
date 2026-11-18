import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, MonitorSmartphone } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches ||
  Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

export const InstallAppPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const ios = typeof window !== 'undefined' && isIOS();

  useEffect(() => {
    if (isStandalone() || sessionStorage.getItem('spwn-install-dismissed') === '1') return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      window.setTimeout(() => setVisible(true), 1800);
    };
    const onInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // iOS Safari has no beforeinstallprompt event; show manual Add to Home Screen steps.
    if (isIOS()) window.setTimeout(() => setVisible(true), 2500);

    // Browsers without a native install prompt still get a manual install guide.
    const fallback = window.setTimeout(() => {
      if (!isStandalone() && !sessionStorage.getItem('spwn-install-dismissed')) setVisible(true);
    }, 9000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(fallback);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('spwn-install-dismissed', '1');
  };

  const install = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') setVisible(false);
      setInstallEvent(null);
      return;
    }
    setShowHelp(true);
  };

  if (!visible || isStandalone()) return null;

  return (
    <>
      <section className="spwn-install-card" role="dialog" aria-label="Install SPWN Apps">
        <div className="spwn-install-icon"><img src="/logo.png" alt="SPWN" /></div>
        <div className="spwn-install-copy">
          <strong>Pasang SPWN di perangkat Anda</strong>
          <span>Akses lebih cepat langsung dari layar utama, seperti aplikasi.</span>
        </div>
        <button className="spwn-install-action" onClick={install}>
          <Download size={16} /> Install
        </button>
        <button className="spwn-install-close" onClick={dismiss} aria-label="Tutup tawaran instalasi"><X size={17} /></button>
      </section>

      {showHelp && (
        <div className="spwn-install-backdrop" onClick={() => setShowHelp(false)}>
          <div className="spwn-install-help" role="dialog" aria-modal="true" aria-labelledby="spwn-install-title" onClick={(e) => e.stopPropagation()}>
            <button className="spwn-install-help-close" onClick={() => setShowHelp(false)} aria-label="Tutup"><X size={20} /></button>
            <div className="spwn-install-icon spwn-install-icon-large"><img src="/logo.png" alt="SPWN" /></div>
            <h2 id="spwn-install-title">Tambahkan SPWN ke layar utama</h2>
            {ios ? (
              <ol>
                <li><Share size={18} /> Ketuk tombol <b>Share / Bagikan</b> di Safari.</li>
                <li><PlusSquare size={18} /> Pilih <b>Add to Home Screen / Tambahkan ke Layar Utama</b>.</li>
                <li>Ketuk <b>Add / Tambahkan</b> untuk menyelesaikan.</li>
              </ol>
            ) : (
              <ol>
                <li><MonitorSmartphone size={18} /> Buka menu browser (ikon tiga titik).</li>
                <li>Pilih <b>Install app</b>, <b>Install SPWN</b>, atau <b>Add to Home Screen</b>.</li>
                <li>Konfirmasi pemasangan. Pada PC, gunakan Chrome atau Microsoft Edge.</li>
              </ol>
            )}
            {ios && <p className="spwn-install-note">Pastikan halaman ini dibuka menggunakan Safari, bukan browser dalam aplikasi lain.</p>}
            <button className="spwn-install-action spwn-install-done" onClick={() => setShowHelp(false)}>Mengerti</button>
          </div>
        </div>
      )}
    </>
  );
};
