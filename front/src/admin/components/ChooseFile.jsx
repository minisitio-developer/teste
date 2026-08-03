import UploadField from "../../components/upload/UploadField";
import "../assets/css/comprar-anuncio.css";

function UploadImage(props) {
  const origin = props.origin || "descImagem";
  const local = props.local || "descImagem";

  function updateLegacyPreview(file) {
    const previewImg = document.querySelector(".comImagem img");
    const previewSemImagem = document.querySelector(".semImagem");
    const previewComImagem = document.querySelector(".comImagem");

    if (previewImg) previewImg.src = URL.createObjectURL(file);
    if (previewSemImagem) previewSemImagem.style.display = "none";
    if (previewComImagem) previewComImagem.style.display = "block";
  }

  function clearLegacyPreview() {
    const previewSemImagem = document.querySelector(".semImagem");
    const previewComImagem = document.querySelector(".comImagem");

    if (previewSemImagem) previewSemImagem.style.display = "block";
    if (previewComImagem) previewComImagem.style.display = "none";
    localStorage.setItem("imgname", "");
  }

  return (
    <UploadField
      label="Inserir arte do perfil (600x300)"
      cod={props.codigoUser}
      local={local}
      origin={origin}
      value={props.codImg}
      miniPreview={props.miniPreview}
      className={props.largura}
      maxSizeMb={5}
      maxWidth={origin === "descImagem" ? 2000 : undefined}
      maxHeight={origin === "descImagem" ? 1000 : undefined}
      onFileSelected={(file) => {
        const storageKey = props.patrocinador > 1 && props.patrocinador < 4
          ? `imgname${props.patrocinador}`
          : "imgname";

        localStorage.setItem(storageKey, file.name);
        localStorage.setItem("imgname", file.name);
        updateLegacyPreview(file);
      }}
      onUploaded={({ fileName }) => {
        if (typeof props.data === "function" && origin) {
          props.data((prev) => ({
            ...prev,
            [origin]: fileName,
          }));
        }
      }}
      onClear={clearLegacyPreview}
    />
  );
}

export default UploadImage;
