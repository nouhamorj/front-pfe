import { useState, useEffect } from 'react';
import { useAuthContext } from 'app/contexts/auth/context';
import BordereauTemplate from '../../../components/print/BordereauTemplate';

// Fonction pour extraire l'id_commande depuis l'URL
const getIdFromUrl = () => {
  const path = window.location.pathname;
  const segments = path.split('/');
  const printIndex = segments.findIndex(segment => segment === 'print-bordereau');
  if (printIndex !== -1 && segments[printIndex + 1]) {
    return segments[printIndex + 1];
  }

  // Fallback: query params
  const params = new URLSearchParams(window.location.search);
  return params.get('id_commande') || params.get('id');
};

const PrintBordereau = () => {
  const id_commande = getIdFromUrl();
  const { user } = useAuthContext();
  const [commande, setCommande] = useState(null);
  const [fournisseur, setFournisseur] = useState(null);
  const [agences, setAgences] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug
  useEffect(() => {
    console.log('ID Commande récupéré:', id_commande);
    console.log('User:', user);
    console.log('Auth tokens:', {
      localStorage: localStorage.getItem('authToken'),
      sessionStorage: sessionStorage.getItem('authToken'),
    });
  }, [id_commande, user]);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        if (!authToken) {
          setError("Token d'authentification manquant");
          setLoading(false);
          return;
        }

        if (!user?.relatedIds?.id) {
          setError("Informations utilisateur manquantes");
          setLoading(false);
          return;
        }

        if (!id_commande) {
          setError("ID de la commande manquant dans l'URL");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        };

        // 1. Charger la commande
        const res = await fetch(`http://localhost:3000/api/commandes/${id_commande}`, { headers });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Échec du chargement de la commande: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        const commandeData = data.data || data;

        if (commandeData.id_frs !== user.relatedIds.id) {
          throw new Error('Vous n\'êtes pas autorisé à imprimer cette commande');
        }

        setCommande(commandeData);

        // 2. Charger le fournisseur
        const fourniRes = await fetch(`http://localhost:3000/api/expediteurs/${user.relatedIds.id}`, { headers });
        if (fourniRes.ok) {
          const fourniData = await fourniRes.json();
          setFournisseur(fourniData.data || fourniData);
        }

        // 3. Charger les agences
        const agenceIds = new Set();
        if (commandeData.agence) agenceIds.add(commandeData.agence);
        if (commandeData.agence_dest) agenceIds.add(commandeData.agence_dest);

        const agencesMap = {};
        await Promise.all(
          Array.from(agenceIds).map(async (id) => {
            try {
              const res = await fetch(`http://localhost:3000/api/agences/${id}`, { headers });
              if (res.ok) {
                const agenceData = await res.json();
                agencesMap[id] = agenceData.data || agenceData;
              }
            } catch (err) {
              console.warn(`Erreur lors du chargement de l'agence ${id}:`, err);
            }
          })
        );

        setAgences(agencesMap);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError(err.message || 'Erreur inattendue lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id_commande, user]);

  // États de chargement / erreur
  if (loading) {
    return (
      <div className="print-container">
        <div style={loadingStyle}>
          <h2>Chargement du bordereau...</h2>
          <p>Préparation de &lsquo;impression</p>
          <div className="no-print" style={{ marginTop: '20px', fontSize: '12px' }}>
            <p>ID Commande: {id_commande || 'Non trouvé'}</p>
            <p>Utilisateur: {user?.relatedIds?.id || 'Non connecté'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="print-container">
        <div style={errorStyle.container}>
          <h2>Erreur</h2>
          <p>{error}</p>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <p>URL: {window.location.href}</p>
            <p>ID Commande: {id_commande || 'Non trouvé'}</p>
          </div>
          <button onClick={() => window.close()} style={errorStyle.button}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="print-container">
        <div style={errorStyle.container}>
          <h2>Commande introuvable #{id_commande}</h2>
          <button onClick={() => window.close()} style={errorStyle.button}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Styles pour l'impression */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bordereau-container, .bordereau-container * {
            visibility: visible;
          }
          .bordereau-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15px;
            box-sizing: border-box;
            break-after: avoid;
            page-break-after: avoid;
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
      `}</style>

      {/* Contenu affiché à l'écran */}
      <div className="print-container">
        {/* Contrôles visibles uniquement à l'écran */}
        <div className="no-print" style={controlsStyle}>
          <button onClick={() => window.print()} style={btnPrint}>Imprimer</button>
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            Bordereau de la commande #{commande.code_barre}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Client: {commande.nom} | Prix: {commande.prix} DT
          </div>
        </div>

        {/* Le contenu à imprimer — uniquement visible à l'impression */}
        <div className="bordereau-container">
          <BordereauTemplate
            commande={commande}
            fournisseur={fournisseur}
            agenceSource={agences[commande.agence]}
            agenceDest={agences[commande.agence_dest]}
          />
        </div>
      </div>
    </>
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
  marginBottom: '30px',
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

export default PrintBordereau;