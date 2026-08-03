import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { InfoIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip.tsx";
import { masterPath } from "../../config/config";
import { validarDimensaoImagem } from "../../globalFunctions/functions";
import {
  DEFAULT_IMAGE_MAX_SIZE_MB,
  getFileRejectionMessage,
  getFirstAcceptedFile,
  getUploadCod,
  normalizeFileName,
  uploadImageFile,
} from "./uploadUtils";

function UploadField({
  label = "Inserir arte do perfil (600x300)",
  cod,
  local = "descImagem",
  origin,
  value,
  preview = true,
  miniPreview,
  className = "",
  maxSizeMb = DEFAULT_IMAGE_MAX_SIZE_MB,
  maxWidth,
  maxHeight,
  onUploaded,
  onClear,
  onFileSelected,
}) {
  const [file, setFile] = useState(null);
  const [showLabel, setShowLabel] = useState(!value);
  const [showMiniPreview, setShowMiniPreview] = useState(miniPreview ?? !value);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const clearFile = useCallback(() => {
    setFile(null);
    setShowLabel(true);
    setShowMiniPreview(true);
    onClear?.();
  }, [onClear]);

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    const rejectionMessage = getFileRejectionMessage(fileRejections, maxSizeMb);
    if (rejectionMessage) {
      alert(rejectionMessage);
      return;
    }

    const selectedFile = getFirstAcceptedFile(acceptedFiles);
    if (!selectedFile) return;

    if (maxWidth && maxHeight) {
      const approved = await validarDimensaoImagem(selectedFile, maxWidth, maxHeight);
      if (!approved) {
        alert(`A imagem deve ter até ${maxWidth}x${maxHeight} pixels.`);
        return;
      }
    }

    setFile(selectedFile);
    setShowLabel(false);
    onFileSelected?.(selectedFile);

    try {
      const response = await uploadImageFile({
        apiUrl: masterPath.url,
        file: selectedFile,
        cod: getUploadCod(cod),
        local,
      });

      const fileName = normalizeFileName(response?.fileName, selectedFile.name);
      onUploaded?.({ fileName, response, file: selectedFile, origin });
      setShowLabel(false);
      setShowMiniPreview(true);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert(error?.message || "Erro ao enviar imagem.");
      setFile(null);
      setShowLabel(true);
    }
  }, [cod, local, maxHeight, maxSizeMb, maxWidth, onFileSelected, onUploaded, origin]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [] },
    maxSize: maxSizeMb * 1024 * 1024,
  });

  const hasExistingValue = value && !showMiniPreview;
  const existingUrl = value ? `${masterPath.url}/files/${local}/${value}` : null;
  const showRemoveButton = !showLabel && (file || hasExistingValue);

  return (
    <div className={`row webcard choose-main ${className}`}>
      <div className="col-md-12">
        <div className="d-flex justify-content-between align-items-center gap-2 input-icon margin-top-10 form-control descImagem pl-0" style={{ paddingLeft: "0px" }}>
          <i className="fa fa-paperclip" style={{ position: "absolute", left: "0", marginTop: "unset" }}></i>

          <span
            className="cursor-pointer d-flex justify-content-around align-items-center"
            style={{ marginLeft: "40px", color: "#4f4f4f!important" }}
          >
            {preview && previewUrl && (
              <>
                <img alt="" src={previewUrl} width={50} style={{ fontSize: "15px" }} />
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="pull-right d-flex mx-2" id="btnVerImagem" title="verimagem">
                  Ver imagem
                </a>
              </>
            )}

            {hasExistingValue && existingUrl && (
              <>
                <img alt="" src={existingUrl} width={50} style={{ fontSize: "15px" }} />
                <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="pull-right d-flex mx-2" id="btnVerImagem" title="verimagem">
                  Ver imagem
                </a>
              </>
            )}

            {showLabel && <span {...getRootProps()}>{label}</span>}
          </span>

          {showRemoveButton && (
            <a href="javascript:;" className="pull-right" id="btnDeleteImagem" title="Remover arquivo" onClick={clearFile}>
              <i className="fa fa-times-circle"></i>
            </a>
          )}

          {showLabel && (
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon />
              </TooltipTrigger>
              <TooltipContent
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-400 max-w-xs break-words whitespace-normal"
                align="center"
              >
                <p>A imagem deve ser no formato PNG, JPEG e ter no máximo {maxSizeMb}MB.</p>
              </TooltipContent>
            </Tooltip>
          )}

          <input {...getInputProps({ name: "imagem", title: origin || "descImagem" })} />
        </div>
      </div>
    </div>
  );
}

export default UploadField;
