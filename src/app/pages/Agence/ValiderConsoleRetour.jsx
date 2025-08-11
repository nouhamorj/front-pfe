// ValiderConsolePickup.jsx
import { useState, useEffect } from "react";
import { useAuthContext } from "app/contexts/auth/context";
import { useParams } from "react-router";
import { Page } from "components/shared/Page";
import { Card } from "components/ui/Card";
import { Button } from "components/ui/Button";
import { toast } from "sonner";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Table, THead, TBody, Th, Tr, Td } from "components/ui";

export default function ValiderConsolePickup() {
    const { user } = useAuthContext();
    const { id: agenceSourceId } = useParams(); // ID de l'agence source

    const agenceDestId = user?.relatedIds?.id;
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [codesInput, setCodesInput] = useState("");
    const [colis, setColis] = useState([]);

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    // Charger tous les id_console en attente
    useEffect(() => {
        const fetchData = async () => {
            if (!agenceDestId || !agenceSourceId) return;

            setLoading(true);
            try {
                // 1. Récupérer les id_console en attente
                const resConsoles = await fetch(
                    `http://localhost:3000/api/console-pickup/pending-consoles?agence_dest=${agenceDestId}&agence_source=${agenceSourceId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!resConsoles.ok) throw new Error("Échec chargement des consoles");

                const consoles = await resConsoles.json();

                if (consoles.length === 0) {
                    setColis([]);
                    setLoading(false);
                    return;
                }

                // 2. Pour chaque console, charger les colis
                const allColisPromises = consoles.map(async (console) => {
                    const resItems = await fetch(
                        `http://localhost:3000/api/console-retour/console/${console.id_console}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    const items = await resItems.json();
                    return items;
                });

                const allItemsArrays = await Promise.all(allColisPromises);
                const allItems = allItemsArrays.flat();

                // 3. Pour chaque colis, charger les détails commande
                const colisDetails = await Promise.all(
                    allItems.map(async (item) => {
                        try {
                            const resCmd = await fetch(
                                `http://localhost:3000/api/commandes/bycode/${item.code_barre}`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            const data = await resCmd.json();
                            const cmd = data.data || data;

                            return {
                                ...item,
                                frs: cmd.frs,
                                nom: cmd.nom,
                                adresse: cmd.adresse,
                                ville: cmd.ville,
                                gouvernorat: cmd.gouvernerat,
                                prix: cmd.prix.includes("DT") ? cmd.prix : `${cmd.prix} DT`,
                                date_add: cmd.date_add,
                            };
                        } catch (err) {
                            console.error(`Erreur pour ${item.code_barre}:`, err);
                            return {
                                ...item,
                                frs: "Inconnu",
                                nom: "Client inconnu",
                                adresse: "",
                                ville: "",
                                gouvernorat: "",
                                prix: "0 DT",
                                date_add: item.dt,
                            };
                        }
                    })
                );

                setColis(colisDetails);
            } catch (err) {
                toast.error(err, "Impossible de charger les données.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agenceDestId, agenceSourceId, token]);


    // Valider les codes scannés
    const handleValidate = async () => {
        const codes = codesInput
            .trim()
            .split(/\r?\n|,|\s+/)
            .map((code) => code.trim().substring(0, 12))
            .filter(Boolean);

        if (codes.length === 0) {
            toast.warning("Aucun code-barres à valider.");
            return;
        }

        const uniqueCodes = [...new Set(codes)];
        if (uniqueCodes.length !== codes.length) {
            toast.info("Doublons supprimés.", { duration: 1000 });
        }

        setValidating(true);

        try {
            const res = await fetch("http://localhost:3000/api/console-pickup/valider", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    agence_dest: agenceDestId,
                    agence_source: agenceSourceId,
                    codes: uniqueCodes,
                }),
            });

            const data = await res.json();

            // 4. Gérer la réponse
            if (res.ok && data.success) {
                toast.success(data.message || `${data.validated?.length || uniqueCodes.length} colis validés.`);
                setColis((prev) => prev.filter((colis) => !uniqueCodes.includes(colis.code_barre)));
                setCodesInput("");
            } else {
                
                const errorMsg = data.message || "Échec de la validation.";
                toast.error(errorMsg);

                if (data.errors && data.errors.length > 0) {
                    console.warn("Codes non validés :", data.errors);
                    data.errors.forEach((err) => toast.error(err, { duration: 3000 }));
                }
            }
        } catch (err) {
            toast.error("Erreur réseau. Impossible de contacter le serveur.");
            console.error("Erreur fetch /valider:", err);
        } finally {
            setValidating(false);
        }
    };

    return (
        <Page title="Valider Console Pickup">
            <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Valider les colis
                    </h2>
                </div>

                {/* Saisie codes */}
                <Card className="mb-6">
                    <div className="p-4">
                        <label className="block text-sm font-medium mb-2">Scanner ou coller les codes-barres reçus</label>
                        <textarea
                            value={codesInput}
                            onChange={(e) => setCodesInput(e.target.value)}
                            placeholder="Collez ou scannez ici..."
                            className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg h-32 bg-white dark:bg-dark-700 focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="mt-3 flex justify-end">
                            <Button
                                color="success"
                                onClick={handleValidate}
                                disabled={validating || !codesInput.trim()}
                                icon={<CheckCircleIcon />}
                            >
                                {validating ? "Validation..." : "Valider"}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Tableau */}
                <Card>
                    <div className="p-4 border-b border-gray-200 dark:border-dark-600">
                        <h3 className="text-lg font-semibold">Colis en attente ({colis.length})</h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full"></div>
                            <span className="ml-2">Chargement...</span>
                        </div>
                    ) : colis.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <XCircleIcon className="mx-auto h-10 w-10 opacity-30" />
                            <p>Aucun colis en attente.</p>
                        </div>
                    ) : (
                        <>
                            <div className="hide-scrollbar min-w-full overflow-x-auto p-4">
                                <Table hoverable className="w-full text-left rtl:text-right">
                                    <THead>
                                        <Tr>
                                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 ltr:first:rounded-l-lg ltr:last:rounded-r-lg rtl:first:rounded-r-lg rtl:last:rounded-l-lg dark:bg-dark-800 dark:text-dark-100">
                                                Bordereau
                                            </Th>
                                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                                Fournisseur
                                            </Th>
                                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                                Client
                                            </Th>
                                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                                Adresse
                                            </Th>
                                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                                Prix
                                            </Th>
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {colis.map((item) => (
                                            <Tr
                                                key={item.code_barre}
                                                className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500"
                                            >
                                                <Td className="font-mono ltr:rounded-l-lg rtl:rounded-r-lg">
                                                    {item.code_barre}
                                                </Td>
                                                <Td>{item.frs}</Td>
                                                <Td>{item.nom}</Td>
                                                <Td>
                                                    <div>{item.adresse}</div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {item.ville} / {item.gouvernorat}
                                                    </div>
                                                </Td>
                                                <Td className="font-semibold">{item.prix}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </Page>
    );
}