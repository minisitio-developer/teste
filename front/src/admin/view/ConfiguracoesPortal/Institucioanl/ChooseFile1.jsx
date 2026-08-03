import UploadField from "../../../../components/upload/UploadField";

import "../../../assets/css/configuracoesPortal/institucional/chooseFile.css";

const DIMENSIONS_BY_ORIGIN = {
  descParceiro: [150, 58],
  cashback_logo: [200, 200],
};

function UploadImage(props) {
  const [maxWidth, maxHeight] = DIMENSIONS_BY_ORIGIN[props.origin] || [];
  const storageKey = props.patrocinador >= 4 ? `imgname${props.patrocinador}` : "imgname";

  return (
    <UploadField
      label={props.msg || "Anexar imagem"}
      cod={props.codigoUser}
      local="adminInstitucional"
      origin={props.origin || "descImagem"}
      value={props.codImg}
      preview={props.preview}
      miniPreview={props.miniPreview}
      className={`choose-inst ${props.largura || ""}`}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      onFileSelected={(file) => {
        localStorage.setItem(storageKey, file.name);
      }}
      onUploaded={({ fileName, file }) => {
        if (typeof props.setData === "function" && props.origin) {
          props.setData((prev) => ({
            ...prev,
            [props.origin]: fileName,
          }));
        }

        const previewImg = props.origin ? document.querySelector(`.${props.origin}`) : null;
        if (previewImg && file) {
          previewImg.src = URL.createObjectURL(file);
        }
      }}
      onClear={() => {
        localStorage.setItem(storageKey, "");
      }}
    />
  );
}

export default UploadImage;
