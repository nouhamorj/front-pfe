// AccepterInterDepot.js
import { useState, useEffect } from "react";
import { useAuthContext } from "app/contexts/auth/context";
import { Page } from "components/shared/Page";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "components/ui";

export default function AccepterInterDepot() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const agenceDestId = user?.relatedIds?.id; // Agence courante
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      if (!agenceDestId) {
        toast.error("Agence non trouvée.");
        setLoading(false);
        return;
      }

      try {
        // 1. Charger toutes les agences sauf l'agence courante
        const agencesRes = await fetch("http://localhost:3000/api/agences", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!agencesRes.ok) throw new Error("Échec du chargement des agences");

        const agencesList = await agencesRes.json();

        // Filtrer l'agence courante
        const autresAgences = agencesList.filter((a) => a.id !== agenceDestId);

        // 2. Pour chaque agence, compter les consoles en attente (etat = 0)
        const agencesAvecStats = await Promise.all(
          autresAgences.map(async (agence) => {
            const res = await fetch(
              `http://localhost:3000/api/console-retour/attente?agence_dest=${agenceDestId}&agence_source=${agence.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = await res.json();
            const count = data.count || data.length || 0;

            return {
              id: agence.id,
              nomAgence: agence.libelle, 
              responsable: `${agence.prenomResp} ${agence.nomResp}`.trim(), 
              nbAttente: count,
            };
          })
        );

        setAgences(agencesAvecStats);
      } catch (err) {
        console.error("Erreur:", err);
        toast.error("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agenceDestId, token]);

  return (
    <Page title="Accepter Inter Dépôt">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h5 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Consoles en attente
          </h5>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Cliquez sur une agence pour valider les colis reçus
          </p>
        </div>

        {/* Grille de cartes */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-700 dark:text-gray-300">Chargement des agences...</span>
            </div>
          ) : agences.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-4 text-lg">Aucune console en attente</p>
              <p className="text-sm">Aucune agence n’a envoyé de console vers vous.</p>
            </div>
          ) : (
            agences.map((agence) => (
              <div
                key={agence.id}
                onClick={() => navigate(`/agence/valider-console-retour/${agence.id}`)}
                className="rounded-lg p-4 border border-gray-300 dark:bg-dark-700 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md">
                {/* Nombre de colis */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl font-bold text-gray-800 dark:text-dark-100">
                    {agence.nbAttente}
                  </span>
                   <Badge
                        variant="soft"
                        color="warning"
                        className="border border-this-darker/20 dark:border-this-lighter/20"
                    >
                        en attente
                    </Badge>
                </div>

                {/* Nom de l'agence */}
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {agence.nomAgence}
                </h3>

                {/* Responsable */}
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Responsable :</span> {agence.responsable}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Page>
  );
}