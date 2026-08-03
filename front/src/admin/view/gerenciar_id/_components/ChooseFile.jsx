import UploadField from "../../../../components/upload/UploadField";

import "../../../../assets/css/comprar-anuncio.css";

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
      local="logoParceiro"
      origin={props.origin || "logo"}
      value={props.codImg}
      preview={props.preview}
      miniPreview={props.miniPreview}
      className={props.largura}
      maxWidth={props.origin === "logo" ? 150 : undefined}
      maxHeight={props.origin === "logo" ? 58 : undefined}
      onFileSelected={(file) => {
        localStorage.setItem(storageKey, file.name);
        props.teste?.(file, true);
        if (props.preview === true) updateLegacyPreview(file);
      }}
      onUploaded={({ fileName }) => {
        if (typeof props.setImgs === "function") {
          props.setImgs((prev) => ({
            ...prev,
            [`newImg_${props.patrocinador > 0 && props.patrocinador < 4 ? props.patrocinador : ""}`]: fileName,
          }));
        }
      }}
      onClear={() => {
        localStorage.setItem(storageKey, "");
        if (props.preview === true) updateLegacyPreview(null);
      }}
    />
  );
}

export default UploadImage;
