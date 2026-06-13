import React from "react";

import './css/marcadores.css';

const Marcadores = () => {
    return (
        <div className="marcadores-main">
        <div className="form-group margin-top-10 webcard" style={{overflow: "hidden", display: "block"}}>
            <i className="fa fa-tags icone-form"></i>

            <textarea name="tags" id="tags" className="form-control" placeholder="Adicionar marcadores (tag's max 10 unidades)" rows="3" cols="80" style={{display: "none"}}></textarea>
            <div id="tags_tagsinput" className="tagsinput" style={{width: "388px", minHeight: "100px", height: "100%"}}>
                <div id="tags_addTag">
                    <input id="tags_tag" data-default="Adicionar marcadores (tag's max 10 unidades)" style={{color: "rgb(102, 102, 102)", width: "376px"}} />
                </div>
                <div className="tags_clear">

                </div>
            </div>
        </div>
        <h5 className="webcard" style={{display: "block"}}>(Não precisa inserir a palavra chave da Atividade a qual o assinatura pertence)</h5>
    </div>
    )
};

export default Marcadores;

