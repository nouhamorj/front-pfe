// Import Dependencies
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { useState, useEffect } from "react";
import {
  FaClock,
  FaTruck,
  FaTimes,
  FaArchive,
  FaArrowLeft,
  FaSync,
  FaCheck,
  FaArrowRight,
  FaBox,
  FaDollarSign,
} from "react-icons/fa";

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
      return payload.relatedId;
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID agence:', error);
      return null;
    }
  };

  // ✅ Fonction pour récupérer le nombre de commandes par état
  const fetchStatForEtat = async (etatId, token, agenceId) => {
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
      const agenceId = getAgenceId();

      if (!authToken || !agenceId) {
        console.error('Token ou ID agence manquant');
        return;
      }

      const etatsMapping = {
        enAttente: 0,
        aEnlever: 12,
        enleves: 13,
        auDepot: 8,
        retourDepot: 11,
        enCours: 1,
        aVerifier: 20,
        livres: 2,
        livresPayes: 10,
        retourDefinitif: 31,
        retourInterAgence: 7,
        retourExpediteurs: 5,
        retourRecuPayes: 30,
      };

      const promises = Object.entries(etatsMapping).map(async ([key, etatId]) => {
        const count = await fetchStatForEtat(etatId, authToken, agenceId);
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

  useEffect(() => {
    fetchAllStats();
  }, []);

  // 🎨 Mapper les icônes
  const getIcon = (key) => {
    switch (key) {
      case 'enAttente': return <FaClock className="size-5 text-white" />;
      case 'aEnlever': return <FaTruck className="size-5 text-white" />;
      case 'enleves': return <FaTimes className="size-5 text-white" />;
      case 'auDepot': return <FaArchive className="size-5 text-white" />;
      case 'retourDepot': return <FaArrowLeft className="size-5 text-white" />;
      case 'enCours': return <FaSync className="size-5 text-white" />;
      case 'aVerifier': return <FaCheck className="size-5 text-white" />;
      case 'livres': return <FaCheck className="size-5 text-white" />;
      case 'livresPayes': return <FaDollarSign className="size-5 text-white" />;
      case 'retourDefinitif': return <FaTimes className="size-5 text-white" />;
      case 'retourInterAgence': return <FaArrowRight className="size-5 text-white" />;
      case 'retourExpediteurs': return <FaBox className="size-5 text-white" />;
      case 'retourRecuPayes': return <FaDollarSign className="size-5 text-white" />;
      default: return <FaBox className="size-5 text-white" />;
    }
  };

  // 🎨 Mapper les couleurs
  const getBgColor = (key) => {
    switch (key) {
      case 'enAttente': return 'bg-yellow-500';
      case 'aEnlever': return 'bg-cyan-600';
      case 'enleves': return 'bg-red-600';
      case 'auDepot': return 'bg-blue-600';
      case 'retourDepot': return 'bg-orange-500';
      case 'enCours': return 'bg-indigo-600';
      case 'aVerifier': return 'bg-purple-600';
      case 'livres': return 'bg-green-500';
      case 'livresPayes': return 'bg-emerald-600';
      case 'retourDefinitif': return 'bg-red-700';
      case 'retourInterAgence': return 'bg-teal-600';
      case 'retourExpediteurs': return 'bg-amber-600';
      case 'retourRecuPayes': return 'bg-emerald-700';
      default: return 'bg-gray-600';
    }
  };

  // 🔤 Formater le nom affiché
  const formatTitle = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Enleves', 'Enlevés')
      .replace('AEnlever', 'À enlever')
      .replace('RetourExpediteurs', 'Retour Expéditeurs')
      .replace('RetourInterAgence', 'Retour Inter-agence')
      .replace('RetourRecuPayes', 'Retour reçu payés');
  };

  return (
    <Page title="Tableau de bord">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Tableau de bord
          </h2>
          <p className="mt-1 text-sm text-gray-500">Statistiques de &lsquo;agence</p>
        </div>

        {/* Grille des cartes */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {Object.keys(stats).map((key) => {
            const count = stats[key];
            const Icon = getIcon(key);
            const bgColor = getBgColor(key);
            const title = formatTitle(key);

            return (
              <Card className="p-4 sm:p-5" key={key}>
                {/* Icône ronde colorée */}
                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${bgColor} shadow-xl shadow-${bgColor.replace('bg-', '').split('-')[0]}-600/50 dark:${bgColor} dark:shadow-${bgColor.replace('bg-', '').split('-')[0]}-400/50`}
                >
                  {Icon}
                </div>

                {/* Titre */}
                <p className="mt-4 text-sm font-medium text-gray-600 dark:text-dark-200">{title}</p>

                {/* Nombre */}
                <p className="mt-1 font-medium text-gray-800 dark:text-dark-100">
                  <span className="text-2xl">{loading ? '...' : count}</span>
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </Page>
  );
}