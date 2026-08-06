import UploadField from "../../components/upload/UploadField";

import "../../assets/css/comprar-anuncio.css";

function updateLegacyPreview(file) {
  const previewImg = document.querySelector(".comImagem img");
  const previewSemImagem = document.querySelector(".semImagem");
  const previewComImagem = document.querySelector(".comImagem");

  if (file && previewImg) previewImg.src = URL.createObjectURL(file);
  if (previewSemImagem) previewSemImagem.style.display = file ? "none" : "block";
  if (previewComImagem) previewComImagem.style.display = file ? "block" : "none";
}

function UploadImage(props) {
  const storageKey =
    props.patrocinador > 1 && props.patrocinador < 4
      ? `imgname${props.patrocinador}`
      : "imgname";

  return (
    <UploadField
      label="Inserir arte do perfil (600x300)"
      cod={props.dt?.codAnuncio || props.codigoUser}
      local={props.local || "descImagem"}
      origin={props.origin || "descImagem"}
      value={props.codImg}
      preview={props.preview}
      miniPreview={props.miniPreview}
      className={props.largura}
      maxWidth={props.origin === "descImagem" ? 2000 : undefined}
      maxHeight={props.origin === "descImagem" ? 1000 : undefined}
      onFileSelected={(file) => {
        localStorage.setItem(storageKey, file.name);
        if (props.preview === true) updateLegacyPreview(file);
      }}
      onUploaded={({ fileName }) => {
        if (typeof props.data === "function" && props.origin) {
          props.data((prev) => ({
            ...prev,
            [props.origin]: fileName,
          }));
        }
      }}
      onClear={() => {
        if (typeof props.data === "function" && props.origin) {
          props.data((prev) => ({
            ...prev,
            [props.origin]: null,
          }));
        }
        localStorage.setItem(storageKey, "");
        if (props.preview === true) updateLegacyPreview(null);
      }}
    />
  );
}

export default UploadImage;
