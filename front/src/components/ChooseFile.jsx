import UploadField from "./upload/UploadField";

import "../assets/css/comprar-anuncio.css";

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
    props.patrocinador === 2
      ? "imgname2"
      : props.patrocinador === 3
        ? "imgname3"
        : "imgname";

  return (
    <UploadField
      label="Anexar imagem"
      cod={props.codigoUser}
      local={props.local || "descImagem"}
      origin={props.origin || "descImagem"}
      value={props.codImg}
      preview={props.preview}
      miniPreview={props.miniPreview}
      className={props.largura}
      onFileSelected={(file) => {
        localStorage.setItem(storageKey, file.name);
        props.teste?.(file, true);
        if (props.preview === true) updateLegacyPreview(file);
      }}
      onClear={() => {
        localStorage.setItem(storageKey, "");
        if (props.preview === true) updateLegacyPreview(null);
      }}
    />
  );
}

export default UploadImage;
