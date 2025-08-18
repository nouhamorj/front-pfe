// src/app/pages/Agence/GenererEchange.jsx
import { useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function GenererEchange() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getAuthToken = () => localStorage.getItem("authToken");

  // Validation du code
  const validateCode = (value) => {
    if (!value) return "Le code est requis";
    if (value.trim().length < 5) return "Code invalide";
    return true;
  };

  // ✅ Générer l’échange en une seule action
  const handleGenerate = async (e) => {
    e.preventDefault();
    const codeValue = code.trim();
    const isValid = validateCode(codeValue);

    if (isValid !== true) {
      setErrorMessage(isValid);
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setErrorMessage("Non authentifié");
        return;
      }

      const res = await fetch("http://localhost:3000/api/commandes/echange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: codeValue }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Échec de la création de l'échange");
      }

      // ✅ Succès
      setSuccessMessage(
        `Échange généré avec succès ! Nouveau code : ${data.echange.code_barre}`
      );
      setCode(""); // Réinitialiser
    } catch (error) {
      setErrorMessage(error.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Réinitialiser
  const handleReset = () => {
    setCode("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <Page title="Générer un échange">
      <div className="w-full max-w-8xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 mb-1">Générer un échange</h5>
        <p className="text-sm text-gray-500 mb-6">
          Saisissez le code à barres du colis à échanger
        </p>

        {/* Formulaire */}
        <div className="mb-8 p-5 bg-gray-50 rounded-lg border">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code à barres</label>
              <Input
                name="code"
                placeholder="Saisir le code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={errorMessage ? errorMessage : ""}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              color="success"
              icon={<ArrowPathIcon className="h-5 w-5" />}
              disabled={loading || !code.trim()}
            >
              {loading ? "Génération..." : "Générer"}
            </Button>

            <Button
              type="button"
              onClick={handleReset}
              disabled={loading}
              unstyled
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Réinitialiser
            </Button>
          </form>

          {/* Messages */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 text-green-800 text-sm rounded-lg">
              {successMessage}
            </div>
          )}
          {errorMessage && !successMessage && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Section informative */}
        <div className="text-center py-10 text-gray-500">
          {successMessage ? (
            <p></p>
          ) : (
            <p>Entrez un code à barres et cliquez sur <strong>Générer</strong>.</p>
          )}
        </div>
      </div>
    </Page>
  );
}