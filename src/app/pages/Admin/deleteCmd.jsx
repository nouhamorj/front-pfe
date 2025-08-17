// src/app/pages/Agence/SupprimerCmd.jsx
import { useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function SupprimerCmd() {
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

  // 🗑️ Rechercher puis supprimer en une seule action
  const handleDelete = async (e) => {
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

      // 1️⃣ Rechercher la commande par code à barres
      const searchRes = await fetch(`http://localhost:3000/api/commandes/bycode/${codeValue}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const searchData = await searchRes.json();

      if (!searchData?.data) {
        setErrorMessage("Colis non trouvé");
        return;
      }

      // 2️⃣ Supprimer la commande par ID
      const deleteRes = await fetch(`http://localhost:3000/api/commandes/${searchData.data.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const deleteResult = await deleteRes.json();

      if (!deleteRes.ok) {
        throw new Error(deleteResult.message || "Échec de la suppression");
      }

      // ✅ Suppression réussie
      setSuccessMessage(`Le colis ${codeValue} a été supprimé avec succès.`);
      setCode(""); // Réinitialiser le code
    } catch (error) {
      setErrorMessage(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Réinitialiser le formulaire
  const handleReset = () => {
    setCode("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <Page title="Supprimer un colis">
      <div className="w-full max-w-8xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 mb-1">Supprimer un colis</h5>
        <p className="text-sm text-gray-500 mb-6">Saisissez le code à barres du colis à supprimer</p>

        {/* Formulaire de suppression */}
        <div className="mb-8 p-5 bg-gray-50 rounded-lg border">
          <form onSubmit={handleDelete} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code à barres</label>
              <Input
                name="code"
                placeholder="Saisir le code à barres"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={errorMessage ? errorMessage : ""}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              color="error"
              icon={<TrashIcon className="h-5 w-5" />}
              disabled={loading || !code.trim()}
            >
              {loading ? "Suppression..." : "Supprimer"}
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
            <p>
            </p>
          ) : (
            <p>Entrez un code à barres et cliquez sur Supprimer</p>
          )}
        </div>
      </div>
    </Page>
  );
}