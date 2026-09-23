const MAX_ICON_FILE_BYTES = 2 * 1024 * 1024;
const ICON_MAX_DIMENSION = 96;

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const scale = Math.min(1, ICON_MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível processar a imagem."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function handleIconFileSelect(
  file: File | undefined,
  onSuccess: (dataUrl: string) => void,
  onError: (message: string) => void
) {
  if (!file) return;
  if (file.size > MAX_ICON_FILE_BYTES) {
    onError("Imagem muito grande. O limite é 2MB.");
    return;
  }
  try {
    const dataUrl = await resizeImageToDataUrl(file);
    onSuccess(dataUrl);
  } catch {
    onError("Não foi possível processar essa imagem.");
  }
}
