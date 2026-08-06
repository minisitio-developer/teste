import { useState } from "react";
import { buildProfileSuggestions, cleanText } from "../utils/profileAssistant";

function readValue(id) {
  return document.getElementById(id)?.value || "";
}

function readSelectedText(id) {
  const element = document.getElementById(id);
  if (!element || element.selectedIndex < 0) return "";
  return element.options[element.selectedIndex]?.text || element.value || "";
}

function applyValue(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function ProfileAssistantPanel({ onApplyTags, hasImage }) {
  const [suggestion, setSuggestion] = useState(null);

  const generateSuggestion = () => {
    const generated = buildProfileSuggestions({
      codAtividade: readSelectedText("codAtividade"),
      codUf: readValue("codUf4"),
      codCaderno: readSelectedText("codUf5"),
      descAnuncio: readValue("descAnuncio"),
      descEndereco: readValue("descEndereco"),
      descTelefone: readValue("descTelefone"),
      descCelular: readValue("descCelular"),
      descWhatsApp: readValue("descWhatsApp"),
      descEmailComercial: readValue("descEmailComercial"),
      descYouTube: readValue("descYouTube"),
      hasImage,
    });

    setSuggestion(generated);
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    applyValue("descDescricao", suggestion.description);
    if (typeof onApplyTags === "function" && suggestion.tags.length > 0) {
      onApplyTags(suggestion.tags);
    }
  };

  const hasDescription = cleanText(suggestion?.description);

  return (
    <div className="codigo-promocional webcard" style={{ display: "block" }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="text-start">
          <h4 className="mb-1">Assistente IA do perfil</h4>
          <small>Gera descricao, tags e checklist com os dados ja preenchidos.</small>
        </div>
        <button type="button" className="btn btn-primary" onClick={generateSuggestion}>
          <i className="fa fa-magic me-2"></i>
          Sugerir
        </button>
      </div>

      {suggestion && (
        <div className="text-start mt-3">
          <div className="mb-2">
            <strong>Qualidade do perfil:</strong> {suggestion.score}%
          </div>

          {hasDescription && (
            <p className="mb-2" style={{ lineHeight: 1.5 }}>
              {suggestion.description}
            </p>
          )}

          {suggestion.tags.length > 0 && (
            <div className="mb-2">
              {suggestion.tags.map((tag) => (
                <span key={tag} className="badge bg-warning text-dark me-1 mb-1">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {suggestion.missingFields.length > 0 && (
            <small className="d-block mb-3">
              Para melhorar: {suggestion.missingFields.join(", ")}.
            </small>
          )}

          <button
            type="button"
            className="btn btn-success"
            onClick={applySuggestion}
            disabled={!hasDescription}
          >
            <i className="fa fa-check me-2"></i>
            Aplicar descricao e tags
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileAssistantPanel;
