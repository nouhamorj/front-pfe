import { Page } from "components/shared/Page";
import { useNavigate } from "react-router"
import { ArrowPathIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { useDeferredValue, useMemo, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

// Local Imports
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button, Table, THead, TBody, Th, Tr, Td, Select, Badge } from "components/ui";

// Fonction fuzzyFilter
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// Fonction pour filtrage exact
const exactFilter = (row, columnId, value) => {
  return row.getValue(columnId) === value;
};

// Composant de recherche
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

// Composant Cell pour le nom complet
function NomCompletCell({ row }) {
  const nomComplet = row.original.nom || "-"
  return (
    <span className="text-sm text-gray-900 dark:text-white">
      {nomComplet || '-'}
    </span>
  );
}

// Composant Cell pour le téléphone de l'utilisateur
function TelUserCell({ row }) {
  const tel = row.original.user?.tel ? row.original.user.tel.replace('+216', '+216 ') : '-';
  return (
    <span className="text-sm text-gray-900 dark:text-white">
      {tel}
    </span>
  );
}

// Composant Cell pour l'agence
function AgenceCell({ row }) {
  const supportedColors = ['primary', 'secondary', 'info', 'warning', 'success'];
  const colorIndex = (row.original.id_agence || 0) % supportedColors.length;
  const color = supportedColors[colorIndex];
  return (
    <Badge color={color} variant="soft" className="capitalize">
      {row.original.agence?.libelle || '-'}
    </Badge>
  );
}

// Composant Cell pour les prix livraison/retour
function PrixCell({ row }) {
  return (
    <span className="text-sm text-gray-900 dark:text-white">
      {`${row.original.prix_liv}/${row.original.prix_rtn} dt`}
    </span>
  );
}

// Composant Cell pour le téléphone de l'expéditeur
function TelExpediteurCell({ row }) {
  const tel = row.original.tel ? row.original.tel.replace('+216', '+216 ') : '-';
  return (
    <span className="text-sm text-gray-900 dark:text-white">
      {tel}
    </span>
  );
}

// Composant Cell pour le nom de la page
function NomPageCell({ row }) {
  return (
    <span className="text-sm text-gray-900 dark:text-white">
      {row.original.nom_page || '-'}
    </span>
  );
}

// Composant Cell pour l'état (Actif)
function EtatCell({ row }) {
  const [isActive, setIsActive] = useState(row.original.etat === 1);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = useCallback(async () => {
    setIsToggling(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const newEtat = isActive ? 0 : 1;
      const response = await fetch(`http://localhost:3000/api/expediteurs/${row.original.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ etat: newEtat }),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'état');
      setIsActive(newEtat === 1);
      row.original.etat = newEtat; // Update local state
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsToggling(false);
    }
  }, [isActive, row.original.id]);

  return (
    <Button
      onClick={handleToggle}
      disabled={isToggling}
      className={clsx(
        "px-2 py-1 text-sm font-medium rounded",
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
      )}
    >
      {isToggling ? "..." : isActive ? "Oui" : "Non"}
    </Button>
  );
}

// Composant Cell pour Exo (Société/Particulier)
function ExoCell({ row }) {
  const isSociete = row.original.exo === 1;
  return (
    <Button
      disabled
      className={clsx(
        "px-2 py-1 text-sm font-medium rounded",
        isSociete ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800",
      )}
    >
      {isSociete ? "Société" : "Particulier"}
    </Button>
  );
}

function RowActions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const confirmMessages = {
    pending: {
      title: "Confirmation de suppression",
      description: "Êtes-vous sûr de vouloir supprimer cet expéditeur ? Cette action est irréversible.",
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
    },
    success: {
      title: "Expéditeur supprimé",
      description: "L'expéditeur a été supprimé avec succès.",
    },
    error: {
      title: "Erreur",
      description: "Impossible de supprimer l'expéditeur. Veuillez réessayer.",
    },
  };

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRow = useCallback(async () => {
    
    setConfirmDeleteLoading(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/expediteurs/delete/${row.original.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Échec de la suppression");
      }

      // Si succès, actualiser l'UI
      setDeleteSuccess(true);
      table.options.meta?.deleteRow(row.original.id);
      setTimeout(() => setDeleteModalOpen(false), 1500);

    } catch (error) {
      console.error("Erreur:", error);
      setDeleteError(true);
    } finally {
      setConfirmDeleteLoading(false);
    }
  }, [row, table]);
  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";
  const navigate= useNavigate();
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate(`/admin/modifier-expediteur/${row.original.id}`)}
          color="primary"
          className="p-2 text-sm font-medium flex items-center gap-1"
          title="Modifier"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={openModal}
          color="error"
          className="p-2 text-sm font-medium flex items-center gap-1"
          title="Supprimer"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeModal}
        messages={confirmMessages}
        onOk={handleDeleteRow}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}


// Définition des colonnes
const columnHelper = createColumnHelper();

const columns = [
    columnHelper.accessor((row) => row.nom_page, {
    id: "nom_page",
    header: "Nom de la page",
    cell: NomPageCell,
  }),
  columnHelper.accessor((row) => `${row.user?.prenom || ''} ${row.user?.nom || ''}`.trim(), {
    id: "nomComplet",
    header: "Expéditeur",
    cell: NomCompletCell,
  }),
  columnHelper.accessor((row) => row.agence?.libelle, {
    id: "agence",
    header: "Agence",
    cell: AgenceCell,
    filterFn: exactFilter,
  }),
  columnHelper.accessor((row) => `${row.prix_liv}/${row.prix_rtn}`, {
    id: "prix",
    header: "Prix Liv./Rtn.",
    cell: PrixCell,
  }),
 
  columnHelper.accessor((row) => row.etat, {
    id: "etat",
    header: "Actif",
    cell: EtatCell,
    filterFn: exactFilter,
  }),
  columnHelper.accessor((row) => row.exo, {
    id: "exo",
    header: "Type",
    cell: ExoCell,
    filterFn: exactFilter,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: RowActions,
  }),
];

// Composant Toolbar
function Toolbar({ table, agences }) {
  const navigate = useNavigate();
  const [agenceFilter, setAgenceFilter] = useState("");
  const [etatFilter, setEtatFilter] = useState("");
  const [exoFilter, setExoFilter] = useState("");

  useEffect(() => {
    const columnFilters = [];
    if (agenceFilter) {
      columnFilters.push({ id: "agence", value: agences.find(ag => ag.id === parseInt(agenceFilter))?.libelle });
    }
    if (etatFilter !== "") {
      columnFilters.push({ id: "etat", value: parseInt(etatFilter) });
    }
    if (exoFilter) {
      columnFilters.push({ id: "exo", value: parseInt(exoFilter) });
    }
    table.setColumnFilters(columnFilters);
  }, [agenceFilter, etatFilter, exoFilter, table, agences]);

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des expéditeurs
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez et organisez vos expéditeurs efficacement
            </p>
          </div>
          <Button
            style={{ backgroundColor: "rgb(254, 195, 39)", color: "rgb(39, 46, 100)" }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={() => navigate("/admin/ajouter-expediteur")}
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter un expéditeur
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <SearchInput
              placeholder="Rechercher un expéditeur par nom, téléphone, page..."
              value={table.getState().globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
          </div>
          <Select
            value={agenceFilter}
            onChange={(e) => setAgenceFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">Toutes les agences</option>
            {agences.map((agence) => (
              <option key={agence.id} value={agence.id}>
                {agence.libelle}
              </option>
            ))}
          </Select>
          <Select
            value={etatFilter}
            onChange={(e) => setEtatFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">Tous les états</option>
            <option value="1">Actif</option>
            <option value="0">Inactif</option>
          </Select>
          <Select
            value={exoFilter}
            onChange={(e) => setExoFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">Tous les types</option>
            <option value="1">Société</option>
            <option value="2">Particulier</option>
          </Select>
          <Button
            onClick={() => {
              table.resetSorting();
              table.resetPagination();
              table.setGlobalFilter("");
              table.setColumnFilters([]);
              setAgenceFilter("");
              setEtatFilter("");
              setExoFilter("");
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-600"
            unstyled
            title="Réinitialiser les filtres"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Composant principal
function ListeExpediteurs() {
  const [expediteurs, setExpediteurs] = useState([]);
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        // Fetch expediteurs
        const expediteursResponse = await fetch('http://localhost:3000/api/expediteurs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!expediteursResponse.ok) {
          if (expediteursResponse.status === 401) {
            throw new Error('Token invalide ou expiré');
          }
          throw new Error('Erreur lors de la récupération des expéditeurs');
        }
        const expediteursData = await expediteursResponse.json();

        // Fetch agences
        const agencesResponse = await fetch('http://localhost:3000/api/agences', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!agencesResponse.ok) {
          throw new Error('Erreur lors de la récupération des agences');
        }
        const agencesData = await agencesResponse.json();
        setAgences(agencesData);

        // Simulate fetching user data
        const userData = {
          11: { nom: "Ben Ali", prenom: "Mohamed", tel: "+21655123456" },
          34: { nom: "Trabelsi", prenom: "Ahmed", tel: "+21655987654" },
        };

        // Enrich expediteurs with user and agency data
        const enrichedExpediteurs = expediteursData.map((exp) => ({
          ...exp,
          user: userData[exp.user_id] || { nom: '-', prenom: '-', tel: '-' },
          agence: agencesData.find((ag) => ag.id === exp.id_agence) || { libelle: '-' },
        }));

        setExpediteurs(enrichedExpediteurs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = useMemo(() => [...expediteurs], [expediteurs]);

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: { pageSize: 15 },
    },
    state: {
      globalFilter: deferredGlobalFilter,
      sorting,
      columnFilters,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
  });

  if (loading) {
    return (
      <Page title="Gestion des expéditeurs">
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <ArrowPathIcon className="size-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chargement des données...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Récupération des expéditeurs
            </p>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Gestion des expéditeurs">
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Erreur de chargement
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <div className="space-x-2">
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Réessayer
              </Button>
              {error.includes('Token') && (
                <Button
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    window.location.href = '/login';
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Se reconnecter
                </Button>
              )}
            </div>
          </div>
        </div>
      </Page>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <Page title="Gestion des expéditeurs">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toolbar table={table} agences={agences} />
        <div className="overflow-x-auto">
          <Table className="w-full">
            <THead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id} className="border-b border-gray-200 dark:border-dark-600">
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      {header.column.getCanSort() ? (
                        <div
                          className="flex cursor-pointer select-none items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </span>
                          <TableSortIcon sorted={header.column.getIsSorted()} />
                        </div>
                      ) : header.isPlaceholder ? null : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <Tr
                  key={row.id}
                  className={clsx(
                    "border-b border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200",
                    index % 2 === 0 && "bg-white dark:bg-dark-800",
                    index % 2 === 1 && "bg-gray-50/50 dark:bg-dark-750"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
        {rows.length > 0 && (
          <div className="px-6 py-4">
            <PaginationSection table={table} />
          </div>
        )}
        {rows.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a2 2 0 00-2-2h-3m-2-2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-3 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun expéditeur trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </Page>
  );
}

// PropTypes
SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

NomCompletCell.propTypes = {
  row: PropTypes.object,
};

TelUserCell.propTypes = {
  row: PropTypes.object,
};

AgenceCell.propTypes = {
  row: PropTypes.object,
};

PrixCell.propTypes = {
  row: PropTypes.object,
};

TelExpediteurCell.propTypes = {
  row: PropTypes.object,
};

NomPageCell.propTypes = {
  row: PropTypes.object,
};

EtatCell.propTypes = {
  row: PropTypes.object,
};

ExoCell.propTypes = {
  row: PropTypes.object,
};

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};

Toolbar.propTypes = {
  table: PropTypes.object,
  agences: PropTypes.array,
};

export default ListeExpediteurs;