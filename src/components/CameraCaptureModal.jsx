import React, { useState, useEffect, useRef } from 'react';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  if (!isOpen) return null;

  const [stream, setStream] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize camera and list devices
  const startCamera = async (deviceId = null) => {
    setLoading(true);
    setError(null);
    
    // Stop any existing tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: { ideal: 'environment' } } // prefer back camera
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      // Enumerate devices after permission is granted to get accurate names
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      // Select the active camera device ID
      const activeTrack = newStream.getVideoTracks()[0];
      if (activeTrack) {
        const settings = activeTrack.getSettings();
        if (settings.deviceId) {
          setSelectedCameraId(settings.deviceId);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Kamera başlatılamadı:', err);
      setError('Kameraya erişilemedi. Lütfen kamera izinlerinizi kontrol edin veya galeriden bir fotoğraf seçin.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleSwitchCamera = (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    startCamera(newId);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size to match the actual video frame size
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw the video frame onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to high-quality JPEG base64 string
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);

      // Stop camera stream to release resources since we captured the photo
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(selectedCameraId);
  };

  const handleUsePhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  // Helper file input fallback for when cameras fail
  const handleFallbackFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onCapture(event.target.result);
      handleClose();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-[#1e0e00]/70 dark:bg-black/85 z-55 flex items-center justify-center p-4 backdrop-blur-[4px] animate-fade-in"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-200/50 dark:border-zinc-800 animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#3d2200] via-[#5c3d11] to-[#b8924a] dark:from-zinc-950 dark:to-zinc-850 p-5 flex justify-between items-center text-white select-none">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <h3 className="font-serif-playfair text-lg font-bold">Fotoğraf Çek</h3>
          </div>
          <button
            onClick={handleClose}
            className="bg-white/10 hover:bg-white/20 transition-all rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Camera View Area */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-stone-300 space-y-4">
              <span className="text-4xl block">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
              <label className="inline-block bg-gradient-to-r from-[#7c5c2e] to-[#b8924a] text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer hover:brightness-105 transition-all shadow-md">
                🖼️ Dosyalardan Seç
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFallbackFileInput}
                  className="hidden"
                />
              </label>
            </div>
          ) : capturedPhoto ? (
            // Photo Preview State
            <div className="w-full h-full flex flex-col justify-between">
              <img
                src={capturedPhoto}
                alt="Captured"
                className="w-full h-auto max-h-[55vh] object-contain bg-zinc-950"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-emerald-400 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full border border-emerald-500/20">
                ✓ Çekildi
              </div>
            </div>
          ) : (
            // Live Video Stream State
            <div className="relative w-full h-full flex items-center justify-center">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-10 text-stone-400 gap-2">
                  <div className="w-8 h-8 border-4 border-[#b8924a] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold">Kamera başlatılıyor...</span>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full max-h-[55vh] object-cover"
              />

              {/* Viewfinder crosshairs Grid Overlay */}
              <div className="absolute inset-0 border-[24px] border-black/30 pointer-events-none flex items-center justify-center">
                <div className="w-full h-full border border-white/20 relative">
                  {/* Corner notches */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/70"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/70"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/70"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/70"></div>
                  
                  {/* Rule of thirds grid lines (subtle) */}
                  <div className="absolute inset-x-0 top-1/3 border-b border-white/10"></div>
                  <div className="absolute inset-x-0 top-2/3 border-b border-white/10"></div>
                  <div className="absolute inset-y-0 left-1/3 border-r border-white/10"></div>
                  <div className="absolute inset-y-0 left-2/3 border-r border-white/10"></div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for capture processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Camera Selector & Actions Footer */}
        <div className="p-5 bg-stone-50 dark:bg-zinc-950 border-t border-stone-150 dark:border-zinc-800 flex flex-col gap-4">
          
          {/* Camera selector if multiple cameras exist and not previewing */}
          {!error && !capturedPhoto && cameras.length > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Kamera:</span>
              <select
                value={selectedCameraId}
                onChange={handleSwitchCamera}
                className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#b8924a]"
              >
                {cameras.map((camera, i) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Kamera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            {capturedPhoto ? (
              // Actions on Photo Captured
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 bg-stone-200 hover:bg-stone-300 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  🔄 Yeniden Çek
                </button>
                <button
                  type="button"
                  onClick={handleUsePhoto}
                  className="flex-[2] bg-gradient-to-r from-emerald-650 to-teal-550 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  ✔️ Fotoğrafı Kullan
                </button>
              </>
            ) : !error ? (
              // Actions while live camera is running
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-stone-150 hover:bg-stone-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={loading}
                  className="flex-[2] bg-gradient-to-r from-[#7c5c2e] to-[#b8924a] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-amber-900/10 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  📸 Fotoğrafı Çek
                </button>
              </>
            ) : (
              // Actions when camera error occurred
              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-stone-200 hover:bg-stone-350 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
              >
                Kapat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
