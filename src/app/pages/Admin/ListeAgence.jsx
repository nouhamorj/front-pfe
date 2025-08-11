import { Page } from "components/shared/Page";
import { ArrowPathIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PhoneIcon, UserIcon} from "@heroicons/react/20/solid";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useNavigate } from "react-router";
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
import { Button, Table, THead, TBody, Th, Tr, Td, Avatar } from "components/ui";
// Fonction fuzzyFilter
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
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

// Composant Cell pour le nom de l'agence
function NameCell({ row }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
          size={10}
          name={row.original.libelle}
          initialColor="auto"
          className="shrink-0"
          backgroundColor="#fec327"
        />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {row.original.libelle}
        </p>
      </div>
  </div>
  );
}

// Composant Cell pour le responsable
function ResponsableCell({ row }) {
  const prenom = row.original.prenomResp || '';
  const nom = row.original.nomResp || '';
  const nomComplet = `${prenom} ${nom}`.trim();
  return (
     <div className="flex items-center gap-2">
        <UserIcon className="size-4 text-gray-400" />
        <span className="text-sm text-gray-900 dark:text-white">  {nomComplet || '-'}</span>
      </div>
  );
}

// Composant Cell pour le CIN du responsable
function CinRespCell({ row }) {
  return (
    <div className="flex items-center gap-2">
        <span className="text-sm text-center text-gray-900 dark:text-white">{row.original.cinResp}</span>
      </div>
  );
}

// Composant Cell pour le téléphone du responsable
function TelRespCell({ row }) {
  return (
    <div className="flex items-center gap-2">
        <PhoneIcon className="size-4 text-gray-400" />
        <span className="text-sm text-gray-900 dark:text-white">{row.original.telResp || '-'}</span>
    </div>
  );
}

// Composant Cell pour le téléphone de l'agence
function TelAgenceCell({ row }) {
  return (
    <div className="flex items-center gap-2">
        <PhoneIcon className="size-4 text-gray-400" />
      {row.original.tel_agence || '-'}
    </div>
  );
}

// Composant Actions pour les lignes
function RowActions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);


  const confirmMessages = {
    pending: {
      description: "Êtes-vous sûr de vouloir supprimer cette agence ? Cette action est irréversible.",
    },
    success: {
      title: "Agence supprimée",
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

  const handleDeleteRow = useCallback(() => {
    setConfirmDeleteLoading(true);
    setTimeout(() => {
      table.options.meta?.deleteRow(row);
      setDeleteSuccess(true);
      setConfirmDeleteLoading(false);
    }, 1000);
  }, [row, table]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => console.log("Modifier agence", row.original.id)}
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
  columnHelper.accessor((row) => row.libelle, {
    id: "libelle",
    header: "libellé",
    cell: NameCell,
  }),
  columnHelper.accessor((row) => `${row.prenomResp || ''} ${row.nomResp || ''}`.trim(), {
    id: "nomCompletResp",
    header: "Responsable",
    cell: ResponsableCell,
  }),
  columnHelper.accessor((row) => row.cinResp, {
    id: "cinResp",
    header: "CIN Responsable",
    cell: CinRespCell,
  }),
  columnHelper.accessor((row) => row.telResp, {
    id: "telResp",
    header: "Tél. Responsable",
    cell: TelRespCell,
  }),
  columnHelper.accessor((row) => row.tel_agence, {
    id: "tel_agence",
    header: "Tél. Agence",
    cell: TelAgenceCell,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: RowActions,
  }),
];

// Composant Toolbar
function Toolbar({ table }) {
   const navigate = useNavigate();
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des agences
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez et organisez vos agences efficacement
            </p>
          </div>
          <Button
            style={{ backgroundColor: "rgb(254, 195, 39)", color: "rgb(39, 46, 100)" }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={() => navigate("/admin/ajouter-agence")}
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter une agence
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <SearchInput
              placeholder="Rechercher une agence par nom, responsable, téléphone..."
              value={table.getState().globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              table.resetSorting();
              table.resetPagination();
              table.setGlobalFilter("");
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
function ListeAgences() {
  
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  // Récupération des données
  useEffect(() => {
    const fetchAgences = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch('http://localhost:3000/api/agences', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Token invalide ou expiré');
          }
          throw new Error('Erreur lors de la récupération des agences');
        }

        const data = await response.json();
        setAgences(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgences();
  }, []);

  const data = useMemo(() => [...agences], [agences]);

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: { pageSize: 15 },
    },
    state: {
      globalFilter: deferredGlobalFilter,
      sorting,
    },
    meta: {
      deleteRow: (row) => {
        setAgences((old) =>
          old.filter((oldRow) => oldRow.id !== row.original.id),
        );
      },
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
  });

  if (loading) {
    return (
      <Page title="Gestion des agences">
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <ArrowPathIcon className="size-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chargement des données...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Récupération des agences
            </p>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Gestion des agences">
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg: hover:bg-blue-700 transition-colors duration-200"
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
    <Page title="Gestion des agences">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toolbar table={table} />
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
              Aucune agence trouvée
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

NameCell.propTypes = {
  row: PropTypes.object,
};

ResponsableCell.propTypes = {
  row: PropTypes.object,
};

CinRespCell.propTypes = {
  row: PropTypes.object,
};

TelRespCell.propTypes = {
  row: PropTypes.object,
};

TelAgenceCell.propTypes = {
  row: PropTypes.object,
};

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};

Toolbar.propTypes = {
  table: PropTypes.object,
};

export default ListeAgences;