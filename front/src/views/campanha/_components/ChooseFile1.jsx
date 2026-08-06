import UploadField from "../../../components/upload/UploadField";

import "../../../assets/css/comprar-anuncio.css";

function UploadImage(props) {
  return (
    <UploadField
      label={props.msg || "Anexar imagem"}
      cod={props.minisitio?.codAnuncio || props.codigoUser}
      local={props.local || "descImagem"}
      origin={props.origin || "descImagem"}
      value={props.codImg}
      preview={props.preview}
      miniPreview={props.miniPreview}
      className={props.largura}
      onFileSelected={() => {
        if (props.hasUserInteracted?.current !== undefined) {
          props.hasUserInteracted.current = true;
        }
      }}
      onUploaded={({ fileName }) => {
        if (props.hasUserInteracted?.current !== undefined) {
          props.hasUserInteracted.current = true;
        }

        if (typeof props.data === "function" && props.origin) {
          props.data((prev) => ({
            ...prev,
            [props.origin]: fileName,
          }));
        }
      }}
      onClear={() => {
        if (props.hasUserInteracted?.current !== undefined) {
          props.hasUserInteracted.current = true;
        }

        if (typeof props.data === "function" && props.origin) {
          props.data((prev) => ({
            ...prev,
            [props.origin]: null,
          }));
        }
      }}
    />
  );
}

export default UploadImage;
