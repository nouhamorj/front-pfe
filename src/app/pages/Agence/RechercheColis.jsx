import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Timeline, TimelineItem } from "components/ui";
import { toast } from "sonner";
import { Page } from "components/shared/Page";
import { MagnifyingGlassIcon} from "@heroicons/react/24/outline";


export default function SearchCmd() {
  const [loading, setLoading] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [expediteurData, setExpediteurData] = useState(null);
  const [agenceData, setAgenceData] = useState(null);
  const [historique, setHistorique] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: "",
    }
  });

  const getAuthToken = () => localStorage.getItem("authToken");

  // États des colis avec leurs traductions et couleurs
  const getEtatInfo = (etat) => {
    const etats = {
      0: { label: "En attente", color: "neutral" },
      1: { label: "En cours de livraison", color: "primary" },
      2: { label: "Livrée", color: "success" },
      5: { label: "En préparation vers le retour Expéditeur", color: "warning" },
      7: { label: "Retour inter-agence", color: "warning" },
      8: { label: "Au dépôt", color: "primary" },
      9: { label: "Inter Dépôt", color: "primary" },
      10: { label: "Livrée payée", color: "success" },
      11: { label: "Retour Dépôt", color: "warning" },
      12: { label: "A enlever", color: "warning" },
      20: { label: "A vérifier", color: "error" },
      30: { label: "Retour reçu par l'expéditeur", color: "warning" },
      31: { label: "Retour définitif", color: "error" },
      32: { label: "Retour Reçu payé", color: "success" }
    };
    return etats[etat] || { label: `État ${etat}`, color: "neutral" };
  };

  const getModeLabel = (mode) => {
    const modes = {
      "1": "Espèce seulement",
      "2": "Chèque seulement", 
      "4": "Espèce ou chèque"
    };
    return modes[mode] || `Mode ${mode}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'decimal',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(parseFloat(price));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🔍 Rechercher la commande
  const handleSearch = async (data) => {
    const token = getAuthToken();
    if (!token) return toast.error("Non authentifié");
    if (!data.code) return toast.error("Veuillez saisir un code");
    if (data.code.length < 5) return toast.error("Le code doit contenir au moins 5 caractères");

    setLoading(true);
    try {
      // Recherche du colis
      const res = await fetch(`http://localhost:3000/api/commandes/bycode/${data.code}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error('Colis non trouvé');
      }

      const responseData = await res.json();
      if (!responseData || !responseData.data) {
        throw new Error("Commande non trouvée");
      }

      setPackageData(responseData.data);

      // Recherche de l'historique
      try {
        const historiqueResponse = await fetch(`http://localhost:3000/api/historique/commande/${responseData.data.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (historiqueResponse.ok) {
          const historiqueResult = await historiqueResponse.json();
          setHistorique(historiqueResult || []);
        }
      } catch (err) {
        console.warn('Historique non trouvé',err);
      }

      // Recherche de l'expéditeur
      if (responseData.data.id_frs) {
        try {
          const expediteurResponse = await fetch(`http://localhost:3000/api/expediteurs/${responseData.data.id_frs}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (expediteurResponse.ok) {
            const expediteurResult = await expediteurResponse.json();
            setExpediteurData(expediteurResult);

            // Recherche de l'agence
            if (expediteurResult.id_agence) {
              try {
                const agenceResponse = await fetch(`http://localhost:3000/api/agences/${expediteurResult.id_agence}`, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });
                if (agenceResponse.ok) {
                  const agenceResult = await agenceResponse.json();
                  setAgenceData(agenceResult);
                }
              } catch (err) {
                console.warn('Agence non trouvée',err);
              }
            }
          }
        } catch (err) {
          console.warn('Expéditeur non trouvé',err);
        }
      }

      toast.success("Colis trouvé !");

    } catch (error) {
      console.error("Erreur recherche commande:", error);
      toast.error("Aucun colis avec ce code à barre.");
      setPackageData(null);
      setExpediteurData(null);
      setAgenceData(null);
      setHistorique([]);
    } finally {
      setLoading(false);
    }
  };

  const UserIcon = () => (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const PackageIcon = () => (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  /*const DocumentIcon = () => (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );*/

  const SettingsIcon = () => (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const BuildingIcon = () => (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const ChartIcon = () => (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );


  return (
    <Page title="Rechercher Colis">
      <div className="w-full max-w-8xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <h5 className="text-lg font-semibold text-gray-800 mb-1">Recherche Colis</h5>
        <p className="text-sm text-gray-500 mb-6">Recherchez un colis par code à barres</p>

        {/* Recherche par code à barres */}
        <div className="mb-8 p-5 bg-gray-50 rounded-lg border">
          <form onSubmit={handleSubmit(handleSearch)} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code à barre</label>
              <Input
                placeholder="Saisir le code"
                {...register("code", { 
                  required: "Le code est requis",
                  minLength: { value: 5, message: "Minimum 5 caractères" }
                })}
                error={errors.code?.message}
                disabled={loading}
                autoComplete="off"
                min="5"
                minLength="5"
              />
            </div>
            <Button 
            type="submit" 
            color="secondary"
            icon={<MagnifyingGlassIcon />}
            disabled={loading}>
            {loading ? "Recherche..." : "Rechercher"}
            </Button>
          </form>
        </div>

        {/* Résultats */}
        {packageData && (
          <div className="space-y-6">
            {/* En-tête avec code barre et fournisseur */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
              <h3 className="text-2xl font-bold mb-1">{packageData.code_barre}</h3>
              <p className="text-blue-100 mb-3">{packageData.frs}</p>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Colonne gauche - Informations principales */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Informations client et colis - en 2 colonnes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Client */}
                  <div className="rounded-lg bg-gray-50 p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1 mb-3">
                      <p className="text-lg font-semibold text-gray-800">Client</p>
                      <UserIcon />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-medium">{packageData.nom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tél:</span>
                        <span className="font-medium">{packageData.tel}{packageData.tel2 && ` / ${packageData.tel2}`}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Adresse:</span>
                        <span className="font-medium text-right max-w-[60%]">{packageData.adresse}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ville:</span>
                        <span className="font-medium">{packageData.ville}, {packageData.gouvernerat}</span>
                      </div>
                    </div>
                  </div>

                  {/* Colis */}
                  <div className="rounded-lg bg-gray-50 p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1 mb-3">
                      <p className="text-lg font-semibold text-gray-800">Colis</p>
                      <PackageIcon />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Articles:</span>
                        <span className="font-medium">{packageData.nb_article}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Montant:</span>
                        <span className="text-green-700 font-bold">{formatPrice(packageData.prix)} DT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mode:</span>
                        <span className="font-medium">{getModeLabel(packageData.mode)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">État:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getEtatInfo(packageData.etat).color === 'success' ? 'bg-green-100 text-green-800' :
                          getEtatInfo(packageData.etat).color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          getEtatInfo(packageData.etat).color === 'error' ? 'bg-red-100 text-red-800' :
                          getEtatInfo(packageData.etat).color === 'primary' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getEtatInfo(packageData.etat).label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates en ligne */}
                <div className="rounded-lg bg-gray-50 p-3 2xl:p-4">
                  <div className="flex justify-between space-x-1 mb-3">
                    <p className="text-lg font-semibold text-gray-800">Dates importantes</p>
                    <CalendarIcon />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600 font-medium">Ajout:</p>
                      <p className="font-semibold">{formatDate(packageData.date_add)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 font-medium">Enlèvement:</p>
                      <p className="font-semibold">{formatDate(packageData.date_pick)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 font-medium">Livraison:</p>
                      <p className="font-semibold">{formatDate(packageData.date_liv)}</p>
                    </div>
                  </div>
                </div>

                

                {/* Options en ligne */}
                <div className="rounded-lg bg-gray-50 p-3 2xl:p-4">
                  <div className="flex justify-between space-x-1 mb-3">
                    <p className="text-lg font-semibold text-gray-800"> Options</p>
                    <SettingsIcon />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">Fragile:</span>
                      <span>{packageData.fragile === 1 ? '✅ Oui' : '❌ Non'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">Ouvrir:</span>
                      <span>{packageData.ouvrir === 1 ? '✅ Oui' : '❌ Non'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">Échange:</span>
                      <span>{packageData.echange === "1" ? '✅ Oui' : '❌ Non'}</span>
                    </div>
                  </div>
                  
                  {packageData.echange === "1" && packageData.article && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200 text-sm">
                      <strong>🔄 À échanger:</strong> {packageData.article}
                      {packageData.nb_echange && ` (${packageData.nb_echange})`}
                    </div>
                  )}
                </div>

                {/* Infos supplémentaires */}
                {(expediteurData || agenceData) && (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {agenceData && (
                      <div className="rounded-lg bg-gray-50 p-3 2xl:p-4">
                        <div className="flex justify-between space-x-1 mb-3">
                          <p className="text-lg font-semibold text-gray-800">Agence</p>
                          <BuildingIcon />
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Libellé:</span>
                            <span className="font-medium">{agenceData.libelle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Resp:</span>
                            <span className="font-medium">{agenceData.prenomResp} {agenceData.nomResp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tél:</span>
                            <span className="font-medium">{agenceData.tel_agence}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Colonne droite - Historique */}
              <div className="rounded-lg bg-gray-50 p-3 2xl:p-4">
                <div className="flex justify-between space-x-1 mb-4">
                  <p className="text-lg font-semibold text-gray-800">Historique</p>
                  <ChartIcon />
                </div>
                {historique.length > 0 ? (
                  <div className="max-w-xl">
                    <Timeline lineSpace="0.75rem">
                      {historique.map((item) => {
                        const etatInfo = getEtatInfo(item.etat);
                        return (
                          <TimelineItem
                            key={item.id}
                            title={etatInfo.label}
                            time={new Date(item.dt)}
                            color={etatInfo.color}
                          >
                            <div className="text-sm space-y-1">
                              <div>{item.type_action}</div>
                              {item.motif && item.motif !== 'NULL' && (
                                <div className="text-gray-600">Motif: {item.motif}</div>
                              )}
                              {item.livreur_nom && (
                                <div className="text-blue-600">
                                  {item.livreur_nom} / {item.livreur_tel}
                                </div>
                              )}
                            </div>
                          </TimelineItem>
                        );
                      })}
                    </Timeline>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun historique disponible</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}