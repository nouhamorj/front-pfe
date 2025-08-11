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

  // Fonction pour extraire l'ID du fournisseur du token
  const getFournisseurId = () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return null;
      
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      return payload.relatedId;
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID fournisseur:', error);
      return null;
    }
  };

  // Fonction pour faire un appel API pour un état spécifique
  const fetchStatForEtat = async (etat, token, fournisseurId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/commandes/fournisseur/${fournisseurId}/etat/${etat}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data.data) ? data.data.length : 0; // Selon la structure de votre réponse API
    } catch (error) {
      console.error(`Erreur lors de la récupération des stats pour l'état ${etat}:`, error);
      return 0;
    }
  };

  // Fonction pour récupérer toutes les statistiques
  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const fournisseurId = getFournisseurId();

      if (!authToken || !fournisseurId) {
        console.error('Token ou ID fournisseur manquant');
        return;
      }

      // Mapping des états avec leurs IDs
      const etatsMapping = {
        enAttente: 0,      // En attente
        enCours: 1,        // En cours  
        livres: 2,         // Livré
        // echange: 3,     // Echange (pas utilisé dans l'UI)
        retourExpediteurs: 5, // Retour Expéditeur
        retourInterAgence: 7, // Retour Inter Agence
        auDepot: 8,        // Au dépôt
        livresPayes: 10,   // Livré payé
        retourDepot: 11,   // Retour dépôt
        retourRecuPayes: 30, // Retour payé
        retourDefinitif: 31, // Retour définitif
        // supprime: 6,    // Supprimé (pas affiché)
        aVerifier: 20,     // A vérifier
        // nonRecu: 9,     // Non reçu (pas utilisé dans l'UI)
        aEnlever: 12,      // A enlever
        enleves: 13,       // Enlevé
      };

      // Faire tous les appels API en parallèle
      const promises = Object.entries(etatsMapping).map(async ([key, etatId]) => {
        const count = await fetchStatForEtat(etatId, authToken, fournisseurId);
        return [key, count];
      });

      const results = await Promise.all(promises);
      
      // Convertir les résultats en objet
      const newStats = {};
      results.forEach(([key, count]) => {
        newStats[key] = count;
      });

      setStats(newStats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les stats au montage du composant
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
        
        {/* Section pour afficher les cartes avec les états réels */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 2xl:gap-6">
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.enAttente}
              </p>
              <ClockIcon className="size-5 text-warning" />
            </div>
            <p className="mt-1 text-xs-plus">En attente</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.aEnlever}
              </p>
              <TruckIcon className="size-5 text-info" />
            </div>
            <p className="mt-1 text-xs-plus">À enlever</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.enleves}
              </p>
              <XCircleIcon className="size-5 text-error" />
            </div>
            <p className="mt-1 text-xs-plus">Enlevés</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.auDepot}
              </p>
              <ArchiveBoxIcon className="size-5 text-primary-500" />
            </div>
            <p className="mt-1 text-xs-plus">Au dépôt</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourDepot}
              </p>
              <ArrowLeftIcon className="size-5 text-warning" />
            </div>
            <p className="mt-1 text-xs-plus">Retour dépôt</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.enCours}
              </p>
              <ArrowPathIcon className="size-5 text-primary-500" />
            </div>
            <p className="mt-1 text-xs-plus">En cours</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.aVerifier}
              </p>
              <CheckBadgeIcon className="size-5 text-success" />
            </div>
            <p className="mt-1 text-xs-plus">À vérifier</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.livres}
              </p>
              <CheckBadgeIcon className="size-5 text-success" />
            </div>
            <p className="mt-1 text-xs-plus">Livrés</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.livresPayes}
              </p>
              <CurrencyDollarIcon className="size-5 text-secondary" />
            </div>
            <p className="mt-1 text-xs-plus">Livrés payés</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourDefinitif}
              </p>
              <XCircleIcon className="size-5 text-error" />
            </div>
            <p className="mt-1 text-xs-plus">Retour définitif</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourInterAgence}
              </p>
              <ArrowRightIcon className="size-5 text-info" />
            </div>
            <p className="mt-1 text-xs-plus">Retour Inter-agence</p>
          </div>
          
          <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
            <div className="flex justify-between space-x-1">
              <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                {loading ? '...' : stats.retourExpediteurs}
              </p>
              <ArrowLeftIcon className="size-5 text-warning" />
            </div>
            <p className="mt-1 text-xs-plus">Retour Expéditeurs</p>
          </div>
          
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