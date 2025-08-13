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

export default function AdminDashboard() {
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

  // ✅ Extraire le rôle et vérifier si c'est un admin
  const isAdmin = () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return false;

      const payload = JSON.parse(atob(authToken.split('.')[1]));
      return payload.role === 'admin'; // ou 'ADMIN', selon ton backend
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle admin:', error);
      return false;
    }
  };

  // ✅ Récupérer le nombre total de commandes par état (toutes agences confondues)
  const fetchStatForEtat = async (etatId, token) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/commandes/etat/${etatId}`, // ✅ Route globale (sans /agence/...)
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

  // ✅ Charger toutes les stats globales
  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');

      if (!authToken) {
        console.error('Token manquant');
        return;
      }

      if (!isAdmin()) {
        console.error('Accès refusé : utilisateur non admin');
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
        const count = await fetchStatForEtat(etatId, authToken);
        return [key, count];
      });

      const results = await Promise.all(promises);

      const newStats = {};
      results.forEach(([key, count]) => {
        newStats[key] = count;
      });

      setStats(newStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques admin:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger les stats au montage
  useEffect(() => {
    fetchAllStats();
  }, []);

  // ✅ Message d'accès refusé si non admin
  if (!isAdmin()) {
    return (
      <Page title="Accès refusé">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-red-600">Accès réservé aux administrateurs.</p>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Tableau de bord Admin">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Tableau de bord Administrateur
          </h2>
          <p className="mt-1 text-sm text-gray-500">Statistiques globales de toutes les agences</p>
        </div>

        {/* Grille des statistiques */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 2xl:gap-6">
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