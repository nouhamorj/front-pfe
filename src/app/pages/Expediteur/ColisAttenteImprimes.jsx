import { useState, useEffect, useMemo, useDeferredValue } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { Page } from "components/shared/Page";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { Table, THead, TBody, Tr, Th, Td } from "components/ui";
import { ArrowPathIcon, PrinterIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useAuthContext } from "app/contexts/auth/context";
import clsx from "clsx";
import { rankItem } from "@tanstack/match-sorter-utils";

// Fuzzy filter function
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// SearchInput component
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:border-dark-600 dark:text-white dark:placeholder-gray-400"
      />
    </div>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

// Column definitions
const columnHelper = createColumnHelper();
const columns = [
  columnHelper.display({
    id: "select",
    header: () => "",
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.original.isSelected}
        onChange={row.original.toggleSelected}
        className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      />
    ),
  }),
  columnHelper.accessor("date_add", {
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.date_add;
      if (!date) return "-";
      try {
        return new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(date));
      } catch {
        return date;
      }
    },
  }),
  columnHelper.accessor("code_barre", {
    header: "Code à barres",
    cell: ({ row }) => row.original.code_barre || "-",
  }),
  columnHelper.accessor("nom", {
    header: "Nom client",
    cell: ({ row }) => row.original.nom || "-",
  }),
  columnHelper.accessor("adresse", {
    header: "Adresse",
    cell: ({ row }) => row.original.adresse || "-",
    meta: { className: "whitespace-normal break-words max-w-xs" },
  }),
  columnHelper.accessor("tel", {
    header: "Téléphone",
    cell: ({ row }) => row.original.tel || "-",
  }),
  columnHelper.accessor("prix", {
    header: "Prix",
    cell: ({ row }) => row.original.prix || "-",
  }),
  // Colonne Impression
  columnHelper.display({
    id: "impression",
    header: "Impression",
    cell: ({ row }) => (
      <button style={{backgroundColor:"#FDC633"}}
        onClick={() => {
          window.open(`/expediteur/print-bordereau/${row.original.id}`, '_blank');
        }}
        className="flex items-center justify-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-dark-600"
        title="Imprimer le bordereau"
      >
        <PrinterIcon className="h-5 w-5" />
      </button>
    ),
  }),
];

export default function ListeColisFournisseur() {
  const { isAuthenticated, isInitialized, user } = useAuthContext();
  const [colis, setColis] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  const enhancedColis = useMemo(
    () =>
      colis.map((item) => ({
        ...item,
        isSelected: selectedRows.has(item.id),
        toggleSelected: () => {
          setSelectedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(item.id)) {
              newSet.delete(item.id);
            } else {
              newSet.add(item.id);
            }
            return newSet;
          });
        },
      })),
    [colis, selectedRows]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!isInitialized || !isAuthenticated || !user) {
        setError("Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      const id_frs = user?.relatedIds?.id;
      if (!id_frs || typeof id_frs !== 'number') {
        setError("ID du fournisseur introuvable ou invalide.");
        setLoading(false);
        return;
      }
      const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!authToken) {
        setError("Token d'authentification manquant. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3000/api/commandes/imprimer/fournisseur/${id_frs}/etat/0`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          if (response.status === 401) throw new Error("Token invalide ou expiré");
          if (response.status === 404) {
            setColis([]);
            return;
          }
          throw new Error('Erreur lors de la récupération des colis');
        }
        const json = await response.json();
        setColis(Array.isArray(json?.data) ? json.data : []);
      } catch (err) {
        setError(err.message);
        setColis([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isInitialized, isAuthenticated, user]);

  // ✅ Nouveau comportement : Rediriger vers PrintAllBordereaux avec les IDs
  const handleValiderPickup = async () => {
    if (selectedRows.size === 0) {
      setSubmitStatus({ type: 'error', message: 'Aucun colis sélectionné.' });
      return;
    }

    const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!authToken) {
      setSubmitStatus({ type: 'error', message: 'Token d\'authentification manquant.' });
      return;
    }

    try {
      setSubmitStatus({ type: 'loading', message: 'Préparation de l\'impression...' });

      // 1. Mettre à jour `imprime = 1` pour chaque commande
      const selectedColis = colis.filter(c => selectedRows.has(c.id));
      const updatePromises = selectedColis.map(async (commande) => {
        const res = await fetch(`http://localhost:3000/api/commandes/update/${commande.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imprime: 1 }),
        });
        if (!res.ok) throw new Error(`Erreur ${res.status} pour ${commande.id}`);
        return res.json();
      });

      await Promise.all(updatePromises);

      // 2. Stocker les IDs pour l'impression
      const ids = Array.from(selectedRows).join(',');
      // Option 1 : Via URL
      const url = `/expediteur/print-all-bordereaux?ids=${ids}`;
      window.open(url, '_blank');

      // Option 2 (alternative) : Via localStorage
      // localStorage.setItem('selectedCommandesForPrint', JSON.stringify(Array.from(selectedRows)));

      // 3. Rafraîchir la liste
      const refetch = await fetch(`http://localhost:3000/api/commandes/imprimer/fournisseur/${user.relatedIds.id}/etat/0`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (refetch.ok) {
        const json = await refetch.json();
        setColis(Array.isArray(json?.data) ? json.data : []);
      }

      // 4. Succès
      setSubmitStatus({ type: 'success', message: 'Bordereaux marqués comme imprimés !' });
      setTimeout(() => setSubmitStatus(null), 3000);
      setSelectedRows(new Set());
    } catch (err) {
      console.error('Erreur:', err);
      setSubmitStatus({ type: 'error', message: err.message || 'Erreur lors de la mise à jour.' });
    }
  };

  const data = useMemo(() => enhancedColis, [enhancedColis]);
  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize: 15 } },
    state: { globalFilter: deferredGlobalFilter },
    filterFns: { fuzzy: fuzzyFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <Page title="Liste des colis en attente">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
                  Liste des colis en attente Imprimés
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Affichage de vos colis en attente imprimés
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <SearchInput
                  placeholder="Rechercher par nom, code à barres, téléphone..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  setGlobalFilter("");
                  table.resetPagination();
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-600"
                title="Réinitialiser les filtres"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {submitStatus && (
          <div
            className={clsx(
              "mb-4 p-4 rounded text-sm",
              submitStatus.type === 'success' && 'bg-green-50 text-green-600',
              submitStatus.type === 'error' && 'bg-red-50 text-red-600',
              submitStatus.type === 'loading' && 'bg-blue-50 text-blue-600'
            )}
          >
            {submitStatus.message}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-16">
            <div className="text-center">
              <ArrowPathIcon className="size-12 animate-spin mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chargement des données...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Récupération des colis
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Erreur de chargement
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <div className="space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Réessayer
                </button>
                {(error.includes('Token') || error.includes('reconnecter')) && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      sessionStorage.removeItem('authToken');
                      localStorage.removeItem('authUser');
                      sessionStorage.removeItem('authUser');
                      window.location.href = '/login';
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Se reconnecter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id} className="border-b border-gray-200 dark:border-dark-600">
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className={clsx(
                          "px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400",
                          header.column.columnDef.meta?.className
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <Tr
                      key={row.id}
                      className={clsx(
                        "border-b border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200",
                        index % 2 === 0 && "bg-white dark:bg-dark-800",
                        index % 2 === 1 && "bg-gray-50/50 dark:bg-dark-750",
                        row.original.isSelected && "bg-blue-50 border-l-4 border-blue-500"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td
                          key={cell.id}
                          className={clsx(
                            "px-6 py-4 text-sm",
                            cell.column.columnDef.meta?.className
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      ))}
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={columns.length} className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a2 2 0 00-2-2h-3m-2-2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-3 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Aucun colis trouvé
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </Td>
                  </Tr>
                )}
              </TBody>
            </Table>
          </div>
        )}

        {rows.length > 0 && (
          <div className="px-6 py-4">
            <PaginationSection table={table} />
          </div>
        )}

        {selectedRows.size > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleValiderPickup}
              style={{
                backgroundColor: 'rgb(254, 195, 39)',
                color: 'rgb(39, 46, 100)'
              }}
              className="inline-flex items-center px-8 py-4 font-bold text-xl rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              <PrinterIcon className="h-7 w-7 mr-3" />
              Imprimer la sélection ({selectedRows.size})
            </button>
          </div>
        )}
      </div>
    </Page>
  );
}