// Import Dependencies
import { Page } from "components/shared/Page";
import { Card, Avatar } from "components/ui";
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
  FaBuilding,
  FaMotorcycle,
  FaUserTie,
  FaTruck as FaTruckSolid,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    enAttente: 0,
    aEnlever: 0,
    enleves: 0,
    auDepot: 0,
    retourDepot: 0,
    enCours: 0,
    livres: 0,
    retourInterAgence: 0,
    retourExpediteurs: 0,
  });

  const [sommes, setSommes] = useState({
    enAttente: 0,
    aEnlever: 0,
    enleves: 0,
    auDepot: 0,
    retourDepot: 0,
    enCours: 0,
    livres: 0,
    retourInterAgence: 0,
    retourExpediteurs: 0,
  });

  const [totalStats, setTotalStats] = useState({
    agences: 0,
    livreurs: 0,
    chauffeurs: 0,
    expediteurs: 0,
    commandes: 0,
  });

  const [loading, setLoading] = useState(true);

  // ✅ Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return false;

      const payload = JSON.parse(atob(authToken.split('.')[1]));
      return payload.role === 'admin';
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle admin:', error);
      return false;
    }
  };

  const fetchCount = async (url, token) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const result = await response.json();

    // ✅ Gestion des deux formats :
    // - { data: [...] } → comme /api/commandes
    // - [ ... ] → directement un tableau
    if (Array.isArray(result)) {
      return result.length; // Réponse directe : tableau
    } else if (result && Array.isArray(result.data)) {
      return result.data.length; // Réponse enveloppée : { data: [...] }
    }

    return 0;
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${url}:`, error);
    return 0;
  }
};
  // ✅ Récupérer le nombre de commandes par état
  const fetchStatForEtat = async (etatId, token) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/commandes/etat/${etatId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data.data) ? data.data.length : 0;
    } catch (error) {
      console.error(`Erreur récupération état ${etatId}:`, error);
      return 0;
    }
  };

  // ✅ Récupérer la somme des prix par état
  const fetchSommeForEtat = async (etatId, token) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/commandes/somme-prix/${etatId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      return data.somme_prix || 0;
    } catch (error) {
      console.error(`Erreur somme état ${etatId}:`, error);
      return 0;
    }
  };

  // ✅ Charger toutes les stats
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

      // URLs des APIs
      const urls = {
        agences: 'http://localhost:3000/api/agences',
        livreurs: 'http://localhost:3000/api/livreurs',
        chauffeurs: 'http://localhost:3000/api/chauffeurs',
        expediteurs: 'http://localhost:3000/api/expediteurs',
        commandes: 'http://localhost:3000/api/commandes',
      };

      // Récupération parallèle des totaux
      const [agences, livreurs, chauffeurs, expediteurs, commandes] = await Promise.all([
        fetchCount(urls.agences, authToken),
        fetchCount(urls.livreurs, authToken),
        fetchCount(urls.chauffeurs, authToken),
        fetchCount(urls.expediteurs, authToken),
        fetchCount(urls.commandes, authToken),
      ]);

      setTotalStats({ agences, livreurs, chauffeurs, expediteurs, commandes });

      // Stats par état
      const etatsMapping = {
        enAttente: 0,
        aEnlever: 12,
        enleves: 13,
        auDepot: 8,
        retourDepot: 11,
        enCours: 1,
        livres: 2,
        retourInterAgence: 7,
        retourExpediteurs: 5,
      };

      const countPromises = [];
      const sumPromises = [];

      Object.entries(etatsMapping).forEach(([key, etatId]) => {
        countPromises.push(fetchStatForEtat(etatId, authToken).then(count => ({ key, count })));
        sumPromises.push(fetchSommeForEtat(etatId, authToken).then(somme => ({ key, somme })));
      });

      const [countResults, sumResults] = await Promise.all([
        Promise.all(countPromises),
        Promise.all(sumPromises),
      ]);

      const newStats = {};
      const newSommes = {};

      countResults.forEach(({ key, count }) => (newStats[key] = count));
      sumResults.forEach(({ key, somme }) => (newSommes[key] = somme));

      setStats(newStats);
      setSommes(newSommes);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  // ✅ Si non admin
  if (!isAdmin()) {
    return (
      <Page title="Accès refusé">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-red-600">Accès réservé aux administrateurs.</p>
        </div>
      </Page>
    );
  }

  // ✅ Mapper les icônes par état
  const getIcon = (key) => {
    switch (key) {
      case 'enAttente': return <FaClock className="size-5 text-white" />;
      case 'aEnlever': return <FaTruck className="size-5 text-white" />;
      case 'enleves': return <FaTimes className="size-5 text-white" />;
      case 'auDepot': return <FaArchive className="size-5 text-white" />;
      case 'retourDepot': return <FaArrowLeft className="size-5 text-white" />;
      case 'enCours': return <FaSync className="size-5 text-white" />;
      case 'livres': return <FaCheck className="size-5 text-white" />;
      case 'retourInterAgence': return <FaArrowRight className="size-5 text-white" />;
      case 'retourExpediteurs': return <FaBox className="size-5 text-white" />;
      default: return <FaBox className="size-5 text-white" />;
    }
  };

  // ✅ Mapper les couleurs de fond par état
  const getBgColor = (key) => {
    switch (key) {
      case 'enAttente': return 'bg-yellow-500';
      case 'aEnlever': return 'bg-cyan-600';
      case 'enleves': return 'bg-red-600';
      case 'auDepot': return 'bg-blue-600';
      case 'retourDepot': return 'bg-orange-500';
      case 'enCours': return 'bg-indigo-600';
      case 'livres': return 'bg-green-500';
      case 'retourInterAgence': return 'bg-teal-600';
      case 'retourExpediteurs': return 'bg-amber-600';
      default: return 'bg-gray-600';
    }
  };

  // ✅ Formater en TND
  const formatTND = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  return (
    <Page title="Tableau de bord Admin">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Tableau de bord Administrateur
          </h2>
          <p className="mt-1 text-sm text-gray-500">Statistiques globales</p>
        </div>

        {/* Section : Statistiques Globales (Agences → Livreurs → Chauffeurs → Expéditeurs → Commandes) */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 2xl:gap-6">
          {/* Agences */}
          <Card className="flex justify-between p-5">
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-200">Agences</p>
              <p className="this:primary mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
                {loading ? '...' : totalStats.agences}
              </p>
            </div>
            <Avatar
              size={12}
              classNames={{ display: "mask is-squircle rounded-none" }}
              initialVariant="soft"
              initialColor="primary"
            >
              <FaBuilding className="size-6" />
            </Avatar>
          </Card>

          {/* Livreurs */}
          <Card className="flex justify-between p-5">
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-200">Livreurs</p>
              <p className="this:success mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
                {loading ? '...' : totalStats.livreurs}
              </p>
            </div>
            <Avatar
              size={12}
              classNames={{ display: "mask is-squircle rounded-none" }}
              initialVariant="soft"
              initialColor="success"
            >
              <FaMotorcycle className="size-6" />
            </Avatar>
          </Card>

          {/* Chauffeurs */}
          <Card className="flex justify-between p-5">
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-200">Chauffeurs</p>
              <p className="this:warning mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
                {loading ? '...' : totalStats.chauffeurs}
              </p>
            </div>
            <Avatar
              size={12}
              classNames={{ display: "mask is-squircle rounded-none" }}
              initialVariant="soft"
              initialColor="warning"
            >
              <FaTruckSolid className="size-6" />
            </Avatar>
          </Card>

          {/* Expéditeurs */}
          <Card className="flex justify-between p-5">
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-200">Expéditeurs</p>
              <p className="this:secondary mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
                {loading ? '...' : totalStats.expediteurs}
              </p>
            </div>
            <Avatar
              size={12}
              classNames={{ display: "mask is-squircle rounded-none" }}
              initialVariant="soft"
              initialColor="secondary"
            >
              <FaUserTie className="size-6" />
            </Avatar>
          </Card>

          {/* Commandes */}
          <Card className="flex justify-between p-5">
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-200">Commandes</p>
              <p className="this:info mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
                {loading ? '...' : totalStats.commandes}
              </p>
            </div>
            <Avatar
              size={12}
              classNames={{ display: "mask is-squircle rounded-none" }}
              initialVariant="soft"
              initialColor="info"
            >
              <FaBox className="size-6" />
            </Avatar>
          </Card>
        </div>

        {/* Grille des cartes par état */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {Object.keys(stats).map((key) => {
            const count = stats[key];
            const amount = sommes[key];
            const Icon = getIcon(key);
            const bgColor = getBgColor(key);
            const title = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace('Enleves', 'Enlevés')
              .replace('AEnlever', 'À enlever')
              .replace('RetourExpediteurs', 'Retour Expéditeurs');

            return (
              <Card className="p-4 sm:p-5" key={key}>
                {/* Icône ronde colorée */}
                <div className={`flex size-12 items-center justify-center rounded-xl ${bgColor} shadow-xl shadow-${bgColor.replace('bg-', '').split('-')[0]}-600/50 dark:${bgColor} dark:shadow-${bgColor.replace('bg-', '').split('-')[0]}-400/50`}>
                  {Icon}
                </div>

                {/* Titre */}
                <p className="mt-4 text-sm font-medium text-gray-600 dark:text-dark-200">{title}</p>

                {/* Nombre */}
                <p className="mt-1 font-medium text-gray-800 dark:text-dark-100">
                  <span className="text-2xl">{loading ? '...' : count}</span>
                </p>

                {/* Montant en TND */}
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                  {loading ? '...' : formatTND(amount)}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </Page>
  );
}