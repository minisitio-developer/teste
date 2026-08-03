import React, { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { masterPath } from "../../config/config";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip.tsx"
import { InfoIcon } from "lucide-react";

import "../assets/css/comprar-anuncio.css";


//global functions
import { validarDimensaoImagem } from '../../globalFunctions/functions';


function UploadImage(props) {
  //state
  const [imagem, setImagem] = useState(false);
  const [mostrarLabel, setMostrarLabel] = useState(true);
  const [nomeImg, setNomeImg] = useState(false);
  const [mostrarMiniPreview, setMostrarMiniPreview] = useState(props.miniPreview);
  const [textLabel, setTextLabel] = useState("Inserir arte do perfil (600x300)");


  //ref
  const inputImg = useRef();


  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    // Faça algo com os arquivos aceitos, como enviar para um servidor
    // Criar um objeto FormData para enviar a imagem para o servidor

    if (fileRejections.length > 0) {
      if (fileRejections[0].errors) {
        if (fileRejections[0].errors[0].code === "file-invalid-type") {
          alert("Formato inválido! Apenas PNG e JPEG são permitidos.");
          return;
        } else if (fileRejections[0].errors[0].code === "file-too-large") {
          alert("Imagem atingiu o limite, por favor insira uma imagem de até 1MB");
          return;
        }
        console.log('very', fileRejections[0].errors[0].code)
      }
    }

    // Verifica as dimensões da imagem (100x100)
    const file = acceptedFiles?.[0];
    if (!file) return;

    if (props.origin === 'descImagem') {

      validarDimensaoImagem(file, 2000, 1000)
        .then((aproved) => {
          if (aproved) {
            enviarImg();
          } else {
            alert("A imagem deve ter até 2000x1000 pixels.");
          }
        });
    } else {
      enviarImg();
    }

    function enviarImg() {
      if (props.patrocinador > 1 && props.patrocinador < 4) {
        localStorage.setItem("imgname" + props.patrocinador, file.name);
      } else {
        localStorage.setItem("imgname", file.name);
      }


      setImagem(file);
      localStorage.setItem("imgname", file.name);
      setNomeImg(file.name);

      const previewImg = document.querySelector('.comImagem img');
      const previewSemImagem = document.querySelector('.semImagem');
      const previewComImagem = document.querySelector('.comImagem');

      if (previewImg) previewImg.src = URL.createObjectURL(file);
      if (previewSemImagem) previewSemImagem.style.display = 'none';
      if (previewComImagem) previewComImagem.style.display = 'block';

      const formData = new FormData();
      formData.append('image', file);

      // Enviar a imagem para o servidor
      fetch(`${masterPath.url}/upload-image?cod=${props.codigoUser}&local=${props.local || 'descImagem'}`, {
              method: 'POST',
              body: formData
            }).then(x => x.json())
              .then(response => {
              /*   if (!response.ok) {
                  throw new Error('Erro ao enviar imagem para o servidor');
                } */
                //console.log('Imagem enviada com sucesso!', response);
      
                const fileName = response?.fileName || file.name;
                const normalizedFileName = fileName.replace(/\s+/g, "-");

                if (typeof props.data === 'function' && props.origin) {
                  props.data(prev => ({
                    ...prev,
                    [props.origin]: normalizedFileName
                  }));
                }
      
                setMostrarLabel(false);
                setMostrarMiniPreview(true);
              })
              .catch(error => {
                console.error('Erro ao enviar imagem:', error);
              });
  /*     fetch(`${masterPath.url}/upload-image?cod=${props.codigoUser}&local=descImagem`, {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao enviar imagem para o servidor');
          }
          console.log('Imagem enviada com sucesso!', response);

          props.data(prev => ({
            ...prev,
            [props.origin]: response.fileName.replace(/\s+/g, "-")
          })); 

          setMostrarLabel(false);
          setMostrarMiniPreview(true);
        })
        .catch(error => {
          console.error('Erro ao enviar imagem:', error);
        }); */
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/png": [], "image/jpeg": [] },
    /* accept: { "image/png": [], "image/jpeg": [], "image/webp": [] }, */
    maxSize: 5 * 1024 * 1024,
  });

  const limparInputImg = () => {
    document.querySelector('.semImagem').style.display = 'block';
    document.querySelector('.comImagem').style.display = 'none';
    setImagem(false);
    setMostrarLabel(true);
    setMostrarMiniPreview(true);
    localStorage.setItem("imgname", "")
  }

  return (
    <div className="row webcard choose-main" >
      <div className="col-md-12">
        <div className="d-flex justify-content-between align-items-center gap-2 input-icon margin-top-10 form-control descImagem pl-0" style={{ paddingLeft: "0px" }}>
          <i className="fa fa-paperclip" style={{ position: "absolute", left: "0", marginTop: "unset" }}></i>
          <span
            className="cursor-pointer d-flex justify-content-around align-items-center"
            style={{
              marginLeft: "40px",
              /*         paddingTop: "5px",
                      lineHeight: "38px", */
              color: "#4f4f4f!important"
            }}
            onChange={(event) => alert()}

          >
            {imagem ? <img alt="" src={URL.createObjectURL(imagem)} width={50} style={{ fontSize: "15px" }} /> : ""}
            {imagem ? <a href={`${masterPath.url}/files/${imagem.name}`} target="_blank" rel="noopener noreferrer" className="pull-right d-flex mx-2" id="btnVerImagem" title="verimagem">Ver imagem</a> : ""}
            {mostrarLabel && <span {...getRootProps()}>{textLabel}</span>}

          </span>

          {!mostrarLabel && !mostrarMiniPreview && (
            <a href="javascript:;" className="pull-right" id="btnDeleteImagem" title="Remover arquivo" onClick={limparInputImg}><i className="fa fa-times-circle"></i></a>
          )}

          {!mostrarLabel && imagem && (
            <a href="javascript:;" className="pull-right" id="btnDeleteImagem" title="Remover arquivo" onClick={limparInputImg}><i className="fa fa-times-circle"></i></a>
          )}

          {mostrarLabel &&
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon />
              </TooltipTrigger>
              <TooltipContent
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-400 max-w-xs break-words whitespace-normal"
                align="center">
                <p>A imagem deve ser no formato PNG, JPEG e ter no máximo 1MB, o nome da imagem não pode conter caracteres especiais ou espaços.</p>
              </TooltipContent>
            </Tooltip>
          }

          <input {...getInputProps({ name: "imagem" })} />
        </div>
      </div>
    </div>
  );
}

const dropzoneStyles = {
  border: "2px dashed #cccccc",
  borderRadius: "4px",
  padding: "20px",
  textAlign: "center",
  cursor: "pointer",
};

export default UploadImage;
