'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop, type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const AVATAR_SIZE = 400;

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('No 2d context'));

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropW = crop.width * scaleX;
  const cropH = crop.height * scaleY;

  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.92);
  });
}

export type AvatarSaveProgress = (percent: number) => void;

interface AvatarCropModalProps {
  file: File;
  onSave?: (blob: Blob, onProgress?: AvatarSaveProgress) => Promise<void>;
  onSaveError?: (err: Error) => void;
  onCancel: () => void;
}

export function AvatarCropModal({ file, onCancel, onSave, onSaveError }: AvatarCropModalProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [savingDirect, setSavingDirect] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [savePhase, setSavePhase] = useState<'preparing' | 'uploading' | 'saving' | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getBlobFromCrop = useCallback(async (): Promise<Blob | null> => {
    const img = imgRef.current;
    if (!img) return null;
    const wrapper = img.closest('.ReactCrop__child-wrapper') as HTMLElement | null;
    const wrapperRect = wrapper?.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    if (!wrapperRect || wrapperRect.width <= 0 || wrapperRect.height <= 0 || imgRect.width <= 0 || imgRect.height <= 0) return null;
    const offsetX = imgRect.left - wrapperRect.left;
    const offsetY = imgRect.top - wrapperRect.top;
    let pixelCropInWrapper: PixelCrop;
    if (completedCrop?.width && completedCrop?.height) {
      pixelCropInWrapper = completedCrop;
    } else if (crop?.width && crop?.height) {
      pixelCropInWrapper = convertToPixelCrop(crop, wrapperRect.width, wrapperRect.height);
    } else {
      return null;
    }
    const cropInImage: PixelCrop = {
      unit: 'px',
      x: pixelCropInWrapper.x - offsetX,
      y: pixelCropInWrapper.y - offsetY,
      width: pixelCropInWrapper.width,
      height: pixelCropInWrapper.height,
    };
    if (cropInImage.width <= 0 || cropInImage.height <= 0) return null;
    return getCroppedBlob(img, cropInImage);
  }, [completedCrop, crop]);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        if (cancelled) return;
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setImgSrc(URL.createObjectURL(file));
          return;
        }
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        if (cancelled) return;
        setImgSrc(dataUrl);
      } catch {
        if (!cancelled) setImgSrc(URL.createObjectURL(file));
      }
    })();
    return () => {
      cancelled = true;
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
    };
  }, [file]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (width <= 0 || height <= 0) return;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const SAVE_TIMEOUT_MS = 25000;

  const handleSaveDirect = useCallback(async () => {
    if (!onSave) return;
    setSavingDirect(true);
    setSaveError(null);
    setUploadProgress(null);
    setSavePhase('preparing');
    try {
      const blob = await getBlobFromCrop();
      if (!blob) {
        setSavingDirect(false);
        setSavePhase(null);
        const msg = 'Não foi possível gerar a imagem. Ajuste o recorte e tente novamente.';
        setSaveError(msg);
        onSaveError?.(new Error(msg));
        return;
      }
      setSavePhase('uploading');
      setUploadProgress(0);
      await Promise.race([
        onSave(blob, (percent) => {
          setUploadProgress(percent);
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Tempo esgotado. Tente novamente.')), SAVE_TIMEOUT_MS)
        ),
      ]);
      setSavePhase('saving');
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setSaveError(e.message);
      onSaveError?.(e);
    } finally {
      setSavingDirect(false);
      setUploadProgress(null);
      setSavePhase(null);
    }
  }, [getBlobFromCrop, onSave, onSaveError]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-rich-black/90 p-4" role="dialog" aria-modal="true" aria-label="Recortar foto">
      <div className="bg-steel-900 border border-white/10 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Recortar foto</h3>
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-sm text-steel-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            {onSave && (
              <button
                type="button"
                onClick={handleSaveDirect}
                disabled={savingDirect || !crop}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gold-600 text-gold-950 hover:bg-gold-500 disabled:opacity-50 transition-colors"
              >
                {savingDirect ? 'Salvando...' : saveError ? 'Tentar novamente' : 'Salvar foto'}
              </button>
            )}
          </div>
        </div>
        {savePhase !== null && (
          <div className="px-4 py-2 border-b border-white/10 bg-steel-950/50">
            <p className="text-xs text-steel-300 mb-1.5">
              {savePhase === 'preparing' && 'Preparando imagem...'}
              {savePhase === 'uploading' && `Enviando foto... ${uploadProgress ?? 0}%`}
              {savePhase === 'saving' && 'Atualizando perfil...'}
            </p>
            {savePhase === 'uploading' && (
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gold-500 transition-all duration-300"
                  style={{ width: `${uploadProgress ?? 0}%` }}
                />
              </div>
            )}
          </div>
        )}
        {saveError && !savingDirect && (
          <div className="px-4 py-2 border-b border-red-500/20 bg-red-950/20">
            <p className="text-sm text-red-300">{saveError}</p>
            <p className="text-xs text-red-400/80 mt-0.5">Clique em &quot;Tentar novamente&quot; para enviar de novo.</p>
          </div>
        )}
        <div className="p-4 flex justify-center bg-steel-950">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, c) => setCrop(c)}
              onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
              aspect={1}
              circularCrop
              className="max-h-[60vh]"
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt=""
                onLoad={onImageLoad}
                className="max-w-full max-h-[60vh] block"
                style={{ maxHeight: '60vh' }}
              />
            </ReactCrop>
          )}
        </div>
        <p className="px-4 pb-4 text-xs text-steel-400 text-center">Ajuste a área da foto. Será salva em boa qualidade (400×400).</p>
      </div>
    </div>
  );
}
