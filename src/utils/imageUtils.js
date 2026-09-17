/**
 * Utility for client-side image compression and Data URL generation
 * Ensures photos are high visual quality (~1200px max) but lightweight (~80-180 KB)
 * Safe for cloud database storage, eliminates 413 payload errors, memory lag, and dead blob: URLs
 */

export const FALLBACK_EVIDENCE_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect fill='%230f172a' width='800' height='500'/><rect x='20' y='20' width='760' height='460' rx='16' fill='%231e293b' stroke='%23334155' stroke-width='2'/><circle cx='400' cy='210' r='50' fill='%230284c7' opacity='0.2'/><path d='M380 200 L400 180 L420 200 L410 200 L410 230 L390 230 L390 200 Z' fill='%2338bdf8'/><text fill='%23f1f5f9' font-family='sans-serif' font-size='20' font-weight='bold' x='400' y='295' text-anchor='middle'>ภาพถ่ายหลักฐานการปฏิบัติราชการ</text><text fill='%2394a3b8' font-family='sans-serif' font-size='14' x='400' y='325' text-anchor='middle'>ระบบปฏิทินภาระงานและจัดเก็บหลักฐานอัจฉริยะ UniWorkload AI</text></svg>";

export async function compressImageFile(fileOrBlob, maxWidth = 1200, maxHeight = 1200, quality = 0.75) {
  if (!fileOrBlob) return null;

  // If already a URL string
  if (typeof fileOrBlob === 'string') {
    // If it's a blob URL, convert it to a real blob then compress
    if (fileOrBlob.startsWith('blob:')) {
      try {
        const resp = await fetch(fileOrBlob);
        const blob = await resp.blob();
        return compressImageFile(blob, maxWidth, maxHeight, quality);
      } catch (err) {
        console.warn('[compressImageFile] Failed to fetch blob URL:', err);
        return {
          dataUrl: fileOrBlob,
          size: '1.2 MB',
          type: 'photo'
        };
      }
    }

    // If it's an external HTTP/HTTPS URL (e.g. Unsplash), keep as-is
    if (fileOrBlob.startsWith('http://') || fileOrBlob.startsWith('https://')) {
      return {
        dataUrl: fileOrBlob,
        size: '1.2 MB',
        type: 'photo'
      };
    }

    // If it's already a small dataUrl (< 350KB), no recompression needed
    if (fileOrBlob.startsWith('data:image/') && fileOrBlob.length < 350000) {
      const approxKb = Math.round(fileOrBlob.length * 0.75 / 1024);
      return {
        dataUrl: fileOrBlob,
        size: `${approxKb} KB`,
        type: 'photo'
      };
    }
  }

  const fileName = fileOrBlob.name || 'image.jpg';
  const isImage = fileOrBlob.type ? fileOrBlob.type.startsWith('image/') : true;

  if (!isImage) {
    // Non-image file (e.g. PDF)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const sizeFormatted = fileOrBlob.size > 1024 * 1024
          ? `${(fileOrBlob.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(fileOrBlob.size / 1024).toFixed(0)} KB`;
        resolve({
          dataUrl: reader.result,
          name: fileName,
          size: sizeFormatted,
          type: 'document'
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrBlob);
    });
  }

  // Use Image & HTML5 Canvas to downscale and compress to lightweight JPEG DataURL
  return new Promise((resolve) => {
    const processImgSrc = (src) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Scale down while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Output as compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Calculate approximate base64 payload size
          const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
          const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383612;
          const sizeFormatted = sizeInBytes > 1024 * 1024
            ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(sizeInBytes / 1024)} KB`;

          resolve({
            dataUrl,
            name: fileName.replace(/\.[^/.]+$/, '') + '.jpg',
            size: sizeFormatted,
            type: 'photo',
            width,
            height
          });
        } catch (canvasErr) {
          console.warn('[compressImageFile] Canvas compression failed, falling back to original dataURL:', canvasErr);
          resolve({
            dataUrl: src,
            name: fileName,
            size: '1.2 MB',
            type: 'photo'
          });
        }
      };

      img.onerror = () => {
        console.warn('[compressImageFile] Image decode failed, falling back to source');
        resolve({
          dataUrl: src,
          name: fileName,
          size: '1.2 MB',
          type: 'photo'
        });
      };

      img.src = src;
    };

    if (typeof fileOrBlob === 'string') {
      processImgSrc(fileOrBlob);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => processImgSrc(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrBlob);
    }
  });
}
