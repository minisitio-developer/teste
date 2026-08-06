import UploadField from "../../components/upload/UploadField";

import "../../assets/css/comprar-anuncio.css";

const DIMENSIONS_BY_ORIGIN = {
  descParceiro: [150, 58],
  cashback_logo: [150, 58],
  logoPromocao: [1860, 2060],
  certificado_logo: [150, 58],
  certificado_imagem: [816, 1056],
};

function updateLegacyPreview(file) {
  const previewImg = document.querySelector(".comImagem img");
  const previewSemImagem = document.querySelector(".semImagem");
  const previewComImagem = document.querySelector(".comImagem");

  if (file && previewImg) previewImg.src = URL.createObjectURL(file);
  if (previewSemImagem) previewSemImagem.style.display = file ? "none" : "block";
  if (previewComImagem) previewComImagem.style.display = file ? "block" : "none";
}

function UploadImage(props) {
  const [maxWidth, maxHeight] = DIMENSIONS_BY_ORIGIN[props.origin] || [];
  const storageKey = props.patrocinador >= 4 ? `imgname${props.patrocinador}` : "imgname";

  return (
    <UploadField
      label={props.msg || "Anexar imagem"}
      cod={props.dt?.codAnuncio || props.codigoUser}
      local={props.local || "descImagem"}
      origin={props.origin || "descImagem"}
      value={props.codImg}
      preview={props.preview}
      miniPreview={props.miniPreview}
      className={props.largura}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      onFileSelected={(file) => {
        localStorage.setItem(storageKey, file.name);
        if (props.preview === true) updateLegacyPreview(file);
      }}
      onUploaded={({ fileName }) => {
        if (typeof props.data !== "function" || !props.origin) return;

        if (props.origin === "logoPromocao") {
          props.data((prev) => ({
            ...prev,
            [props.origin]: fileName,
            promoc: {
              ...prev.promoc,
              banner: fileName,
            },
          }));
          return;
        }

        props.data((prev) => ({
          ...prev,
          [props.origin]: fileName,
        }));
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
