import { useState, useEffect } from "react";
import { useAuthContext } from "app/contexts/auth/context";
import { Page } from "components/shared/Page";
import { Button, Select, Badge } from "components/ui";
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function ConsolePickup() {
  const { user } = useAuthContext();
  const agenceId = user?.relatedIds?.id;

  const [codes, setCodes] = useState("");
  const [agenceDest, setAgenceDest] = useState("");
  const [chauffeur, setChauffeur] = useState("");
  const [loading, setLoading] = useState(false);

  // Nouvelles données dynamiques
  const [agences, setAgences] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [agenceDepotNom, setAgenceDepotNom] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Charger les agences et chauffeurs au montage
  useEffect(() => {
    const fetchData = async () => {
      if (!agenceId) return;

      setLoadingData(true);

      try {
        // 1. Charger toutes les agences
        const agencesRes = await fetch("http://localhost:3000/api/agences", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!agencesRes.ok) throw new Error("Échec du chargement des agences");

        const agencesData = await agencesRes.json();

        // Filtrer : exclure l'agence du user (dépôt ≠ destination)
        const filteredAgences = agencesData.filter((a) => a.id !== agenceId);
        setAgences(filteredAgences);

        // Trouver le nom de l'agence de dépôt
        const depotAgence = agencesData.find((a) => a.id === agenceId);
        setAgenceDepotNom(depotAgence ? depotAgence.libelle : "Inconnue");

        // 2. Charger les chauffeurs de l'agence du user
        const chauffeursRes = await fetch(
          `http://localhost:3000/api/chauffeurs/agence/${agenceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!chauffeursRes.ok) throw new Error("Échec du chargement des chauffeurs");

        const chauffeursData = await chauffeursRes.json();
        setChauffeurs(chauffeursData);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les données. Vérifiez votre connexion.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [agenceId, token]);

  const handleSubmit = async () => {
    if (loading || loadingData) return;
    if (!agenceId) {
      toast.error("Agence non trouvée");
      return;
    }
    if (!agenceDest) {
      toast.error("Veuillez sélectionner une agence destination");
      return;
    }
    if (!chauffeur) {
      toast.error("Veuillez sélectionner un chauffeur");
      return;
    }
    if (!codes.trim()) {
      toast.error("Veuillez entrer au moins un code-barres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/console-retour/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agence_depot: agenceId,
          agence_dest: parseInt(agenceDest),
          chauffeur: parseInt(chauffeur),
          listCode: codes.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Console Pickup créé avec succès !");
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((err) => toast.warning(err));
        }
        setCodes("");
        setAgenceDest("");
        setChauffeur("");
      } else {
        toast.error(data.message || "Erreur lors de la création");
      }
    } catch (err) {
      toast.error("Erreur réseau. Vérifiez votre connexion.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Page title="Console Pickup">
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2">Chargement des données...</span>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Console Pickup">
      <div className="w-full mx-auto bg-white dark:bg-dark-800 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Créer un Console Retour
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Associez plusieurs colis à un chauffeur pour un transfert inter-agence.
        </p>

        <div className="space-y-6">
          {/* Agence Dépôt */}
          <div>
            <label className="block text-sm font-large mb-1">Agence de départ</label>
            <Badge color="info">{agenceDepotNom}</Badge>
          </div>

          {/* Agence Destination */}
          <div>
            <label className="block text-sm font-medium mb-1">Agence Destination</label>
            <Select value={agenceDest} onChange={(e) => setAgenceDest(e.target.value)}>
              <option value="">Sélectionner...</option>
              {agences.length === 0 ? (
                <option disabled>Aucune autre agence disponible</option>
              ) : (
                agences.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.libelle}
                  </option>
                ))
              )}
            </Select>
          </div>

          {/* Chauffeur */}
          <div>
            <label className="block text-sm font-medium mb-1">Chauffeur</label>
            <Select value={chauffeur} onChange={(e) => setChauffeur(e.target.value)}>
              <option value="">Sélectionner...</option>
              {chauffeurs.length === 0 ? (
                <option disabled>Aucun chauffeur disponible</option>
              ) : (
                chauffeurs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.matricule})
                  </option>
                ))
              )}
            </Select>
          </div>

          {/* Codes à barres */}
          <div>
            <label className="block text-sm font-medium mb-1">Codes à barres</label>
            <textarea
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              placeholder="Collez les codes ici, un par ligne"
              className="w-full h-40 p-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bouton */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: '#FDC633' }}
              icon={loading ? <ArrowPathIcon className="animate-spin" /> : <PlusIcon />}
            >
              {loading ? "Création en cours..." : "Créer console Retour"}
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}