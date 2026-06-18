import { useState, useEffect } from "react";
import translate from "translate";

// Configuration par défaut de l'outil de traduction
translate.engine = "google";

export function AutoTranslate({ text, targetLang }) {
  const [translatedText, setTranslatedText] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si la langue demandée est le français, pas besoin de traduire
    if (targetLang === "fr" || !text) {
      setTranslatedText(text);
      return;
    }

    async function performTranslation() {
      setLoading(true);
      try {
        // Traduction automatique du Français (source) vers l'Anglais (targetLang)
        const res = await translate(text, { from: "fr", to: targetLang });
        setTranslatedText(res);
      } catch (error) {
        console.error("Erreur de traduction autonome :", error);
        setTranslatedText(text); // Fallback sur le texte d'origine en cas de coupure réseau
      } finally {
        setLoading(false);
      }
    }

    performTranslation();
  }, [text, targetLang]);

  if (loading) {
    return <span className="animate-pulse text-gray-400">Translating...</span>;
  }

  return <span>{translatedText}</span>;
}
