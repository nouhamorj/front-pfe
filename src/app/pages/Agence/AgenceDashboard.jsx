// Import Dependencies
import { Page } from "components/shared/Page";
import { useState, useEffect } from "react";
import {
  ClockIcon,
  TruckIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/20/solid";

export default function Home() {
  const [stats, setStats] = useState({
    enAttente: 0,
    aEnlever: 0,
    enleves: 0,
    auDepot: 0,
    retourDepot: 0,
    enCours: 0,
    aVerifier: 0,
    livres: 0,
    livresPayes: 0,
    retourDefinitif: 0,
    retourInterAgence: 0,
    retourExpediteurs: 0,
    retourRecuPayes: 0,
  });
  const [loading, setLoading] = useState(true);

  // ✅ Extraire l'ID de l'agence depuis le token JWT
  const getAgenceId = () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return null;

      const payload = JSON.parse(atob(authToken.split('.')[1]));
      return payload.relatedId; // Assurez-vous que c'est bien "relatedId" ou "agenceId"
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID agence:', error);
      return null;
    }
  };

  // ✅ Fonction pour récupérer le nombre de commandes par état
  const fetchStatForEtat = async (etatId, token, agenceId) => { // Ordre corrigé
    try {
      const response = await fetch(
        `http://localhost:3000/api/commandes/agence/${agenceId}/etat/${etatId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data.data) ? data.data.length : 0;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'état ${etatId}:`, error);
      return 0;
    }
  };

  // ✅ Récupérer toutes les stats
  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const agenceId = getAgenceId(); // ✅ Récupère l'ID agence

      if (!authToken || !agenceId) {
        console.error('Token ou ID agence manquant');
        setStats(prev => ({ ...prev, enAttente: 0 })); // Optionnel : afficher 0
        return;
      }

      const etatsMapping = {
        enAttente: 0,
        enCours: 1,
        livres: 2,
        retourExpediteurs: 5,
        retourInterAgence: 7,
        auDepot: 8,
        livresPayes: 10,
        retourDepot: 11,
        retourRecuPayes: 30,
        retourDefinitif: 31,
        aVerifier: 20,
        aEnlever: 12,
        enleves: 13,
      };

      // ✅ Appels parallèles
      const promises = Object.entries(etatsMapping).map(async ([key, etatId]) => {
        const count = await fetchStatForEtat(etatId, authToken, agenceId); // ✅ Ordre correct
        return [key, count];
      });

      const results = await Promise.all(promises);

      const newStats = {};
      results.forEach(([key, count]) => {
        newStats[key] = count;
      });

      setStats(newStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger les stats au montage
  useEffect(() => {
    fetchAllStats();
  }, []);

  return (
    <Page title="Tableau de bord">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Tableau de bord
          </h2>
        </div>

        {/* Grille des statistiques */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 2xl:gap-6">
          {/* En attente */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.enAttente}
              </p>
              <ClockIcon className="size-5 text-warning" />
            </div>
            <p className="mt-1 text-xs-plus">En attente</p>
          </div>

          {/* À enlever */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.aEnlever}
              </p>
              <TruckIcon className="size-5 text-info" />
            </div>
            <p className="mt-1 text-xs-plus">À enlever</p>
          </div>

          {/* Enlevés */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.enleves}
              </p>
              <XCircleIcon className="size-5 text-error" />
            </div>
            <p className="mt-1 text-xs-plus">Enlevés</p>
          </div>

          {/* Au dépôt */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.auDepot}
              </p>
              <ArchiveBoxIcon className="size-5 text-primary-500" />
            </div>
            <p className="mt-1 text-xs-plus">Au dépôt</p>
          </div>

          {/* Retour dépôt */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourDepot}
              </p>
              <ArrowLeftIcon className="size-5 text-warning" />
            </div>
            <p className="mt-1 text-xs-plus">Retour dépôt</p>
          </div>

          {/* En cours */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.enCours}
              </p>
              <ArrowPathIcon className="size-5 text-primary-500" />
            </div>
            <p className="mt-1 text-xs-plus">En cours</p>
          </div>

          {/* À vérifier */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.aVerifier}
              </p>
              <CheckBadgeIcon className="size-5 text-success" />
            </div>
            <p className="mt-1 text-xs-plus">À vérifier</p>
          </div>

          {/* Livrés */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.livres}
              </p>
              <CheckBadgeIcon className="size-5 text-success" />
            </div>
            <p className="mt-1 text-xs-plus">Livrés</p>
          </div>

          {/* Livrés payés */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.livresPayes}
              </p>
              <CurrencyDollarIcon className="size-5 text-secondary" />
            </div>
            <p className="mt-1 text-xs-plus">Livrés payés</p>
          </div>

          {/* Retour définitif */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourDefinitif}
              </p>
              <XCircleIcon className="size-5 text-error" />
            </div>
            <p className="mt-1 text-xs-plus">Retour définitif</p>
          </div>

          {/* Retour Inter-agence */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourInterAgence}
              </p>
              <ArrowRightIcon className="size-5 text-info" />
            </div>
            <p className="mt-1 text-xs-plus">Retour Inter-agence</p>
          </div>

          {/* Retour Expéditeurs */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourExpediteurs}
              </p>
              <ArrowLeftIcon className="size-5 text-warning" />
            </div>
            <p className="mt-1 text-xs-plus">Retour Expéditeurs</p>
          </div>

          {/* Retour reçu payés */}
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourRecuPayes}
              </p>
              <CurrencyDollarIcon className="size-5 text-secondary" />
            </div>
            <p className="mt-1 text-xs-plus">Retour reçu payés</p>
          </div>
        </div>
      </div>
    </Page>
  );
}