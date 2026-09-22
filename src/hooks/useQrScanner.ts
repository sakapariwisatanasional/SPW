/**
 * SPWN Apps 2.0 - useQrScanner Hook
 * Location: src/hooks/useQrScanner.ts
 * -----------------------------------------------------------------
 * Abstraksi logika pemindai QR dan Camera MediaDevices API.
 * Memisahkan kontrol hardware kamera, status stream, izin peramban,
 * dan penanganan error dari komponen presentasional.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export interface QrScannerState {
  isActive: boolean;
  hasPermission: boolean | null;
  error: string | null;
  facingMode: 'environment' | 'user';
  availableCameras: MediaDeviceInfo[];
  activeCameraId: string | null;
  isTorchSupported: boolean;
  isTorchOn: boolean;
}

export interface UseQrScannerOptions {
  onScanSuccess?: (decodedText: string) => void;
  preferredFacingMode?: 'environment' | 'user';
}

export function useQrScanner(options: UseQrScannerOptions = {}) {
  const { onScanSuccess, preferredFacingMode = 'environment' } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<QrScannerState>({
    isActive: false,
    hasPermission: null,
    error: null,
    facingMode: preferredFacingMode,
    availableCameras: [],
    activeCameraId: null,
    isTorchSupported: false,
    isTorchOn: false,
  });

  // Hentikan stream dan matikan lampu kamera
  const stopScanner = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState((prev) => ({
      ...prev,
      isActive: false,
      isTorchOn: false,
    }));
  }, []);

  // Mulai stream kamera
  const startScanner = useCallback(async (facing: 'environment' | 'user' = state.facingMode) => {
    // 1. Validasi ketersediaan MediaDevices di browser
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setState((prev) => ({
        ...prev,
        error: 'Peramban web tidak mendukung akses kamera langsung (MediaDevices API).',
        hasPermission: false,
        isActive: false,
      }));
      return;
    }

    // Hentikan stream lama jika sedang berjalan
    stopScanner();

    try {
      setState((prev) => ({ ...prev, error: null, isActive: true }));

      // Coba dapatkan stream dengan facing mode yang diinginkan
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Cek ketersediaan torch/flashlight pada video track
      const videoTrack = stream.getVideoTracks()[0];
      let torchSupported = false;
      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        const capabilities = videoTrack.getCapabilities() as { torch?: boolean };
        torchSupported = !!capabilities.torch;
      }

      // Daftar perangkat kamera yang tersedia
      let cameras: MediaDeviceInfo[] = [];
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter((device) => device.kind === 'videoinput');
      } catch {
        // Enumerate devices may be restricted in some sandboxes
      }

      const activeCameraId = videoTrack ? videoTrack.getSettings().deviceId || null : null;

      // Pasang stream ke elemen video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {
          // Auto-play was prevented; ignore or wait for user touch
        });
      }

      setState((prev) => ({
        ...prev,
        isActive: true,
        hasPermission: true,
        error: null,
        facingMode: facing,
        isTorchSupported: torchSupported,
        availableCameras: cameras,
        activeCameraId,
      }));
    } catch (err: unknown) {
      let friendlyMessage = 'Gagal mengakses kamera perangkat.';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          friendlyMessage = 'Izin akses kamera ditolak oleh pengguna atau pengaturan browser.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          friendlyMessage = 'Tidak ditemukan perangkat kamera aktif di sistem ini.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          friendlyMessage = 'Kamera sedang digunakan oleh aplikasi lain atau dibatasi sistem operasi.';
        } else if (err.name === 'OverconstrainedError') {
          friendlyMessage = 'Kamera tidak mendukung resolusi atau mode yang diminta.';
        } else {
          friendlyMessage = err.message || friendlyMessage;
        }
      }

      setState((prev) => ({
        ...prev,
        error: friendlyMessage,
        hasPermission: false,
        isActive: false,
      }));
    }
  }, [state.facingMode, stopScanner]);

  // Alihkan kamera (Depan <-> Belakang)
  const switchCamera = useCallback(async () => {
    const nextMode: 'environment' | 'user' = state.facingMode === 'environment' ? 'user' : 'environment';
    await startScanner(nextMode);
  }, [state.facingMode, startScanner]);

  // Toggle lampu flash (Torch)
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !state.isTorchSupported) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const nextTorch = !state.isTorchOn;
        await (videoTrack as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setState((prev) => ({ ...prev, isTorchOn: nextTorch }));
      }
    } catch {
      // Torch not supported on current platform
    }
  }, [state.isTorchSupported, state.isTorchOn]);

  // Trigger hasil scan (dapat dipanggil dari frame reader atau simulasi payload)
  const triggerScanResult = useCallback((decodedText: string) => {
    if (onScanSuccess) {
      onScanSuccess(decodedText);
    }
  }, [onScanSuccess]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return {
    videoRef,
    isActive: state.isActive,
    hasPermission: state.hasPermission,
    error: state.error,
    facingMode: state.facingMode,
    availableCameras: state.availableCameras,
    isTorchSupported: state.isTorchSupported,
    isTorchOn: state.isTorchOn,
    startScanner,
    stopScanner,
    switchCamera,
    toggleTorch,
    triggerScanResult,
  };
}
