export const DEFAULT_IMAGE_MAX_SIZE_MB = 5;
export const DEFAULT_PDF_MAX_SIZE_MB = 5;

export function normalizeFileName(fileName, fallback = "") {
  return String(fileName || fallback || "").replace(/\s+/g, "-");
}

export function getFirstAcceptedFile(acceptedFiles) {
  return Array.isArray(acceptedFiles) ? acceptedFiles[0] : null;
}

export function getUploadCod(...candidates) {
  const cod = candidates.find(
    (value) => value !== undefined && value !== null && value !== "" && value !== "undefined" && value !== "null"
  );

  return cod || "";
}

export function getFileRejectionMessage(fileRejections, maxSizeMb = DEFAULT_IMAGE_MAX_SIZE_MB) {
  const rejection = Array.isArray(fileRejections) ? fileRejections[0] : null;
  const error = rejection?.errors?.[0];

  if (!error) return null;

  if (error.code === "file-invalid-type") {
    return "Formato inválido! Apenas PNG e JPEG são permitidos.";
  }

  if (error.code === "file-too-large") {
    return `Imagem atingiu o limite, por favor insira uma imagem de até ${maxSizeMb}MB`;
  }

  return error.message || "Arquivo inválido.";
}

export async function uploadImageFile({ apiUrl, file, cod = "", local = "descImagem" }) {
  const formData = new FormData();
  formData.append("image", file);

  const token = sessionStorage.getItem("userTokenAccess");
  const headers = token ? { authorization: `Bearer ${token}` } : undefined;
  const params = new URLSearchParams({
    cod: cod || "",
    local: local || "descImagem",
  });

  const response = await fetch(`${apiUrl}/upload-image?${params.toString()}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false || data?.erro === true) {
    throw new Error(data?.mensagem || "Erro ao enviar imagem.");
  }

  return data;
}

export function getPdfRejectionMessage(fileRejections, maxSizeMb = DEFAULT_PDF_MAX_SIZE_MB) {
  const rejection = Array.isArray(fileRejections) ? fileRejections[0] : null;
  const error = rejection?.errors?.[0];

  if (!error) return null;

  if (error.code === "file-invalid-type") {
    return "Formato inválido! Apenas PDF é permitido.";
  }

  if (error.code === "file-too-large") {
    return `Arquivo atingiu o limite, por favor insira um PDF de até ${maxSizeMb}MB`;
  }

  return error.message || "Arquivo inválido.";
}

export async function uploadPdfFile({ apiUrl, file, cod = "", id = "" }) {
  const formData = new FormData();
  formData.append("file", file);

  const token = sessionStorage.getItem("userTokenAccess");
  const headers = token ? { authorization: `Bearer ${token}` } : undefined;
  const params = new URLSearchParams({
    cod: cod || "",
    local: "promocao",
    id: id || "",
  });

  const response = await fetch(`${apiUrl}/upload-pdf?${params.toString()}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false || data?.erro === true) {
    throw new Error(data?.mensagem || "Erro ao enviar PDF.");
  }

  return data;
}
