import { useState, useEffect, useCallback } from 'react';

const InterDepotDetail = ({ consoleId: propConsoleId }) => {
  const getConsoleIdFromUrl = () => {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  const consoleId = propConsoleId || getConsoleIdFromUrl();

  const [data, setData] = useState({
    console: [],
    commandes: [],
    chauffeur: null,
    agenceSource: '',
    agenceDestination: '',
    loading: true
  });

  const fetchConsoleData = useCallback(async () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token d'authentification manquant");

    const response = await fetch(`http://localhost:3000/api/console-pickup/console/${consoleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  }, [consoleId]);

  const fetchAgenceData = useCallback(async (agenceId) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token d'authentification manquant");

    const response = await fetch(`http://localhost:3000/api/agences/${agenceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  }, []);

  const fetchChauffeurData = useCallback(async (chauffeurId) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token d'authentification manquant");

    const response = await fetch(`http://localhost:3000/api/chauffeurs/${chauffeurId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  }, []);

  const fetchCommandeData = useCallback(async (codeBarre) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) throw new Error("Token d'authentification manquant");

    const response = await fetch(`http://localhost:3000/api/commandes/bycode/${codeBarre}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!consoleId) return;

      setData(prev => ({ ...prev, loading: true }));

      try {
        const consoleData = await fetchConsoleData();
        if (consoleData.length === 0) {
          throw new Error('Aucune donnée trouvée pour cette console.');
        }

        const firstItem = consoleData[0];
        const [agenceSourceData, agenceDestinationData, chauffeurData] = await Promise.all([
          fetchAgenceData(firstItem.agence),
          fetchAgenceData(firstItem.agence_dest),
          fetchChauffeurData(firstItem.chauffeur)
        ]);

        const commandesDetails = await Promise.all(
          consoleData.map(async (item) => {
            try {
              const commandeResponse = await fetchCommandeData(item.code_barre);
              return {
                ...item,
                commandeDetails: commandeResponse.data || commandeResponse
              };
            } catch (error) {
              console.error(`Erreur pour le colis ${item.code_barre}:`, error.message);
              return {
                ...item,
                commandeDetails: null
              };
            }
          })
        );

        setData({
          console: consoleData,
          commandes: commandesDetails,
          chauffeur: chauffeurData,
          agenceSource: agenceSourceData.libelle,
          agenceDestination: agenceDestinationData.libelle,
          loading: false
        });
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setData(prev => ({
          ...prev,
          loading: false
        }));
        alert("Erreur : " + err.message);
      }
    };

    fetchData();
  }, [
    consoleId,
    fetchConsoleData,
    fetchAgenceData,
    fetchChauffeurData,
    fetchCommandeData
  ]);

  const calculateTotal = () => {
    return data.commandes.reduce((total, item) => {
      if (item.commandeDetails && item.commandeDetails.prix) {
        const prix = parseFloat(item.commandeDetails.prix.replace(/[^0-9.]/g, '')) || 0;
        return total + prix;
      }
      return total;
    }, 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  const formatTotal = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };


  const handlePrint = () => {
    if (data.loading) {
      alert("Veuillez attendre que les données soient chargées avant d'imprimer.");
      return;
    }
    window.print();
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 print:p-0 bordereau-container">
      <div className="max-w-full mx-auto">
        {/* En-tête avec titre centré et logo à droite */}
        <div className="text-center mb-4">
          <h5 className="text-2xl font-bold border-2 border-gray-300 py-4 px-8 inline-block">
            Bon de sortie N° {consoleId}
          </h5>
        </div>
        {/* Informations générales dans deux colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div><strong>Départ :</strong> {data.agenceSource}</div>
            <div><strong>Destination :</strong> {data.agenceDestination}</div>
          </div>
          <div className="space-y-2">
            {data.chauffeur && (
              <>
                <div><strong>Chauffeur :</strong> {data.chauffeur.nom}</div>
                <div><strong>Matricule :</strong> {data.chauffeur.matricule}</div>
              </>
            )}
          </div>
        </div>

        {/* Bouton d'impression */}
        <div className="flex justify-end mb-6 print:hidden">
          <button
            onClick={handlePrint}
            style={{backgroundColor :'#fec832'}}
            className="px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
        </div>

        {/* Nombre total de colis */}
        <div className="text-xl mb-4">
          Nombre total des colis est <strong>{data.commandes.length}</strong>
        </div>

        {/* Tableau des commandes */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-400 p-2 text-left">N° Bordereau</th>
                <th className="border border-gray-400 p-2 text-left">Expéditeur</th>
                <th className="border border-gray-400 p-2 text-left">Date Colis</th>
                <th className="border border-gray-400 p-2 text-left">QTE</th>
                <th className="border border-gray-400 p-2 text-left">Montant</th>
                <th className="border border-gray-400 p-2 text-left">Client</th>
                <th className="border border-gray-400 p-2 text-left">Désignation</th>
              </tr>
            </thead>
            <tbody>
              {data.commandes.map((item, index) => {
                const commande = item.commandeDetails;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-400 p-2 font-mono text-sm">{item.code_barre}</td>
                    <td className="border border-gray-400 p-2">{commande?.frs || 'N/A'}</td>
                    <td className="border border-gray-400 p-2 text-center">{commande ? formatDate(commande.date_add) : 'N/A'}</td>
                    <td className="border border-gray-400 p-2 text-center">{commande?.nb_article || 'N/A'}</td>
                    <td className="border border-gray-400 p-2 text-center font-bold">{commande?.prix ? `${commande.prix} DT` : 'N/A'}</td>
                    <td className="border border-gray-400 p-2">
                      <div className="space>y-1">
                        <div><strong>{commande?.nom || 'N/A'}</strong></div>
                        <div className="text-xs">{commande?.adresse || ''}</div>
                        <div className="text-xs">{commande?.ville || ''}</div>
                        <div className="text-xs">{commande?.delegation || ''}</div>
                        <div className="text-xs">{commande?.tel || ''}</div>
                        {commande?.tel2 && <div className="text-xs">{commande.tel2}</div>}
                      </div>
                    </td>
                    <td className="border border-gray-400 p-2">{commande?.designation || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Somme totale */}
        <div className="text-center text-3xl font-bold mb-8">
          Somme totale : {formatTotal(calculateTotal())} DT
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bordereau-container, .bordereau-container * {
            visibility: visible;
          }
          .bordereau-container {
            position: static;
            width: 100%;
            padding: 10mm;
          }
          .no-print, .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};

export default InterDepotDetail;