import PdfUploadField from "../../components/upload/PdfUploadField";

import "../../assets/css/comprar-anuncio.css";

function updateLegacyPreview(hasFile) {
  const previewSemImagem = document.querySelector(".semImagem");
  const previewComImagem = document.querySelector(".comImagem");

  if (previewSemImagem) previewSemImagem.style.display = hasFile ? "none" : "block";
  if (previewComImagem) previewComImagem.style.display = hasFile ? "block" : "none";
}

function UploadImage(props) {
  const storageKey = props.patrocinador >= 4 ? `imgname${props.patrocinador}` : "imgname";

  return (
    <PdfUploadField
      label={props.msg || "Inserir cartão digital interativo (PDF)"}
      cod={props.codigoUser}
      value={props.codImg}
      currentId={props.minisitio?.cartao_digital}
      miniPreview={props.miniPreview}
      className={props.largura}
      onFileSelected={(file) => {
        localStorage.setItem(storageKey, file.name);
        if (props.preview === true) updateLegacyPreview(true);
      }}
      onUploaded={({ fileName }) => {
        if (typeof props.data === "function") {
          props.data({
            ...props.minisitio,
            cartao_digital: fileName,
          });
        }
      }}
      onClear={() => {
        if (typeof props.data === "function") {
          props.data({
            ...props.minisitio,
            cartao_digital: "",
          });
        }

        localStorage.setItem(storageKey, "");
        if (props.preview === true) updateLegacyPreview(false);
      }}
    />
  );
}

export default UploadImage;
