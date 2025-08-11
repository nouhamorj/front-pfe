import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from 'app/contexts/auth/context';
import BordereauTemplate from '../../../components/print/BordereauTemplate';

// Fonction pour extraire les IDs depuis l'URL (ex: ?ids=123,456,789)
const getIdsFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const idsParam = params.get('ids');
  if (idsParam) {
    return idsParam.split(',').map(id => id.trim()).filter(id => id && !isNaN(id));
  }
  return [];
};

// Alternative : récupérer depuis localStorage
const getIdsFromStorage = () => {
  try {
    const saved = localStorage.getItem('selectedCommandesForPrint');
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.warn('Impossible de lire les IDs depuis localStorage', err);
  }
  return [];
};

const PrintAllBordereaux = () => {
  const [commandes, setCommandes] = useState([]);
  const [fournisseur, setFournisseur] = useState(null);
  const [agences, setAgences] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  // ✅ Utilisez useMemo pour stabiliser les IDs
  const ids = useMemo(() => {
    const urlIds = getIdsFromUrl();
    return urlIds.length > 0 ? urlIds : getIdsFromStorage();
  }, []); // Dépendance vide car on ne veut calculer qu'une seule fois

  useEffect(() => {
    if (!user || ids.length === 0) {
      setError("Aucun colis sélectionné ou utilisateur non connecté.");
      setLoading(false);
      return;
    }

    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!authToken) {
      setError("Token d'authentification manquant.");
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Charger le fournisseur
        const fourniRes = await fetch(`http://localhost:3000/api/expediteurs/${user.relatedIds.id}`, { headers });
        if (fourniRes.ok) {
          const fourniData = await fourniRes.json();
          setFournisseur(fourniData.data || fourniData);
        } else {
          throw new Error("Échec du chargement du fournisseur");
        }

        // 2. Charger toutes les commandes
        const commandePromises = ids.map(async (id) => {
          const res = await fetch(`http://localhost:3000/api/commandes/${id}`, { headers });
          if (!res.ok) throw new Error(`Erreur ${res.status} pour la commande ${id}`);
          const data = await res.json();
          const commande = data.data || data;

          if (commande.id_frs !== user.relatedIds.id) {
            throw new Error(`Accès refusé pour la commande ${id}`);
          }
          return commande;
        });

        const fetchedCommandes = await Promise.all(commandePromises);
        setCommandes(fetchedCommandes);

        // 3. Charger toutes les agences nécessaires
        const agenceIds = new Set();
        fetchedCommandes.forEach(cmd => {
          if (cmd.agence) agenceIds.add(cmd.agence);
          if (cmd.agence_dest) agenceIds.add(cmd.agence_dest);
        });

        const agencesMap = {};
        await Promise.all(
          Array.from(agenceIds).map(async (id) => {
            if (!id || isNaN(id)) {
              console.warn(`ID d'agence invalide :`, id);
              return;
            }
            try {
              const res = await fetch(`http://localhost:3000/api/agences/${id}`, { headers });
              if (res.ok) {
                const agenceData = await res.json();
                agencesMap[id] = agenceData.data || agenceData;
              } else if (res.status === 404) {
                console.warn(`Agence ${id} non trouvée (404).`);
                agencesMap[id] = { libelle: `Agence inconnue (${id})`, code: '?' };
              } else {
                console.error(`Erreur ${res.status} pour l'agence ${id}`);
              }
            } catch (err) {
              console.error(`Erreur réseau pour l'agence ${id}:`, err);
            }
          })
        );
        setAgences(agencesMap);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message || 'Erreur lors du chargement des bordereaux');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, ids]); // Maintenant ids est stable grâce à useMemo

  // Styles pour l'impression
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .bordereau-page, .bordereau-page * {
          visibility: visible;
        }
        .bordereau-page {
          position: relative;
          width: 100%;
          padding: 15px;
          box-sizing: border-box;
        }
        .bordereau-page:not(:last-child) {
          page-break-after: always;
        }
        .no-print {
          display: none !important;
        }
        @page {
          size: auto;
          margin: 0.5cm;
          padding: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="print-container" style={loadingStyle}>
        <h2>Chargement des bordereaux...</h2>
        <p>Préparation de l&apos;impression ({ids.length} colis)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="print-container" style={errorStyle.container}>
        <h2>Erreur</h2>
        <p>{error}</p>
        
      </div>
    );
  }

  if (commandes.length === 0) {
    return (
      <div className="print-container" style={errorStyle.container}>
        <h2>Aucun bordereau à imprimer</h2>
        <p>Vérifiez votre sélection.</p>
      </div>
    );
  }

  return (
    <div className="print-all-bordereaux">
      {/* Contrôles visibles uniquement à l'écran */}
      <div className="no-print" style={controlsStyle}>
        <button onClick={() => window.print()} style={btnPrint}>
          Imprimer tous les bordereaux
        </button>
        <div style={{ marginTop: '10px', fontSize: '14px' }}>
          {commandes.length} bordereau(x) à imprimer
        </div>
      </div>

      {/* Liste des bordereaux */}
      {commandes.map((commande) => (
        <div key={commande.id} className="bordereau-page">
          <BordereauTemplate
            commande={commande}
            fournisseur={fournisseur}
            agenceSource={agences[commande.agence]}
            agenceDest={agences[commande.agence_dest]}
          />
        </div>
      ))}
    </div>
  );
};

// Styles
const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#fff',
  fontFamily: 'Arial, sans-serif',
  textAlign: 'center',
};

const errorStyle = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    color: '#d32f2f',
    padding: '20px',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

const controlsStyle = {
  marginBottom: '0px',
  textAlign: 'center',
  borderBottom: '1px solid #ccc',
  paddingBottom: '15px',
  paddingTop: '10px',
};

const btnPrint = {
  padding: '12px 24px',
  backgroundColor: '#FDC633',
  color: '#314158',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
};

export default PrintAllBordereaux;