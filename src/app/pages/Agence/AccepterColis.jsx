// AccepterAuMagasin.jsx
import { useState } from "react";
import { useAuthContext } from "app/contexts/auth/context";
import { Page } from "components/shared/Page";
import { Card } from "components/ui/Card";
import { Button } from "components/ui/Button";
import { toast } from "sonner";
import { CheckCircleIcon} from "@heroicons/react/24/outline";

export default function AccepterAuMagasin() {
  const { user } = useAuthContext();
  const agenceId = user?.relatedIds?.id;
  const [codesInput, setCodesInput] = useState("");
  const [count, setCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Compter les codes en temps réel
  const handleInput = (e) => {
    const value = e.target.value;
    setCodesInput(value);

    // Extraire les codes (12 caractères)
    const codes = value
      .trim()
      .split(/\r?\n|,|\s+/)
      .map((code) => code.trim().substring(0, 12))
      .filter(Boolean);

    setCount(codes.length);
  };

  // Détecter les doublons (comme dans le JS PHP)
  const hasDuplicate = (codes) => {
    const seen = new Set();
    return codes.some((code) => {
      if (seen.has(code)) return true;
      seen.add(code);
      return false;
    });
  };

  // Envoyer les codes
  const handleSubmit = async () => {
    const codes = codesInput
      .trim()
      .split(/\r?\n|,|\s+/)
      .map((code) => code.trim().substring(0, 12))
      .filter(Boolean);

    if (codes.length === 0) {
      toast.warning("Aucun code à traiter.");
      return;
    }

    // Vérifier les doublons
    if (hasDuplicate(codes)) {
      toast.warning("Codes en doublon détectés !", {
        description: "Certains codes sont répétés.",
      });
      // Simuler un "beep"
      // Tu peux ajouter un vrai son avec `use-sound` si tu veux
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/commandes/accepter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ codes, agence_dest: agenceId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Échec de l'acceptation");

      toast.success(data.message || `${codes.length} colis acceptés dans l'entrepôt.`);

      // Réinitialiser
      setCodesInput("");
      setCount(0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page title="Accepter au magasin">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Accepter au magasin
          </h2>
        </div>

        <Card className="max-w-8xl mx-auto">
          <div className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Zone de saisie */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Codes-barres des colis
                  </label>
                  <textarea
                    value={codesInput}
                    onInput={handleInput}
                    placeholder="Collez ou scannez les codes ici (un par ligne)"
                    className="w-full p-4 border border-gray-300 dark:border-dark-600 rounded-lg h-64 bg-white dark:bg-dark-700 text-sm focus:ring-2 focus:ring-primary-500 resize-none font-mono"
                  />
                </div>

                {/* Compteur */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    id="nbr_lines"
                    className="text-4xl text-primary-600 mt-4"
                  >
                    {count}
                  </div>
                  <div className="text-gray-500 mt-2">
                    {count === 1 ? "colis" : "colis"}
                  </div>
                </div>
              </div>

              {/* Bouton */}
              <div className="mt-8 flex justify-center">
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  disabled={submitting || count === 0}
                  icon={<CheckCircleIcon />}
                  className="px-8 py-3 text-lg"
                >
                  {submitting ? "Acceptation..." : "Accepter à l'entrepôt"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </Page>
  );
}