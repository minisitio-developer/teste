import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { InfoIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip.tsx";
import { masterPath } from "../../config/config";
import {
  DEFAULT_PDF_MAX_SIZE_MB,
  getPdfRejectionMessage,
  getUploadCod,
  uploadPdfFile,
} from "./uploadUtils";

function PdfUploadField({
  label = "Inserir cartão digital interativo (PDF)",
  cod,
  value,
  currentId,
  miniPreview,
  className = "",
  maxSizeMb = DEFAULT_PDF_MAX_SIZE_MB,
  onUploaded,
  onClear,
  onFileSelected,
}) {
  const [fileName, setFileName] = useState("");
  const [showLabel, setShowLabel] = useState(!value);
  const [showMiniPreview, setShowMiniPreview] = useState(miniPreview ?? !value);

  const clearFile = useCallback(() => {
    setFileName("");
    setShowLabel(true);
    setShowMiniPreview(true);
    onClear?.();
  }, [onClear]);

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    const rejectionMessage = getPdfRejectionMessage(fileRejections, maxSizeMb);
    if (rejectionMessage) {
      alert(rejectionMessage);
      return;
    }

    const selectedFile = Array.isArray(acceptedFiles) ? acceptedFiles[0] : null;
    if (!selectedFile) return;

    setShowLabel(false);
    onFileSelected?.(selectedFile);

    try {
      const response = await uploadPdfFile({
        apiUrl: masterPath.url,
        file: selectedFile,
        cod: getUploadCod(cod),
        id: currentId,
      });

      const uploadedName = response?.name || selectedFile.name;
      setFileName(uploadedName);
      setShowMiniPreview(true);
      onUploaded?.({ fileName: uploadedName, response, file: selectedFile });
    } catch (error) {
      console.error("Erro ao enviar PDF:", error);
      alert(error?.message || "Erro ao enviar PDF.");
      setFileName("");
      setShowLabel(true);
    }
  }, [cod, currentId, maxSizeMb, onFileSelected, onUploaded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [] },
    maxFiles: 1,
    maxSize: maxSizeMb * 1024 * 1024,
  });

  const existingFile = value && !showMiniPreview ? value : "";
  const visibleFile = fileName || existingFile;
  const fileUrl = visibleFile ? `${masterPath.url}/files/3/${visibleFile}` : "";
  const showRemoveButton = !showLabel && visibleFile;

  return (
    <div className={`webcard choose-main ${className}`}>
      <div className="col-md-12">
        <div className="d-flex justify-content-between align-items-center gap-2 input-icon margin-top-10 form-control descImagem pl-0" style={{ paddingLeft: "0px" }}>
          <i className="fa fa-paperclip" style={{ position: "absolute", left: "0", marginTop: "unset" }}></i>

          <span
            className="cursor-pointer d-flex justify-content-around align-items-center"
            style={{ marginLeft: "40px", color: "#4f4f4f!important" }}
          >
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="pull-right d-flex" id="btnVerImagem" title="ver-pdf">
                Ver cartão digital
              </a>
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
                <p>O cartão digital interativo deve ser PDF e ter no máximo {maxSizeMb}MB.</p>
              </TooltipContent>
            </Tooltip>
          )}

          <input {...getInputProps({ name: "file", title: "cartao_digital" })} />
        </div>
      </div>
    </div>
  );
}

export default PdfUploadField;
