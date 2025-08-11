// ListeLivreursAgence.jsx
import { Page } from "components/shared/Page";
import { useAuthContext } from "app/contexts/auth/context";
import { useNavigate } from "react-router";
import { ArrowPathIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PhoneIcon, UserIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
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
import { useDeferredValue, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { Button, Table, THead, TBody, Th, Tr, Td, Avatar } from "components/ui";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { ConfirmModal } from "components/shared/ConfirmModal";

// Fonction de filtre flou
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// Composant Cell pour le nom
function NameCell({ row }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        size={10}
        name={row.original.nom}
        initialColor="auto"
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {row.original.nom}
        </p>
      </div>
    </div>
  );
}

// Composant Cell pour téléphone
function TelCell({ row }) {
  return (
    <div className="flex items-center gap-2">
      <PhoneIcon className="size-4 text-gray-400" />
      <span className="text-sm text-gray-900 dark:text-white">{row.original.tel}</span>
    </div>
  );
}

// Composant Cell pour CIN
function CINCell({ row }) {
  return (
    <div className="flex items-center gap-2">
      <UserIcon className="size-4 text-gray-400" />
      <span className="text-sm text-gray-900 dark:text-white">{row.original.cin}</span>
    </div>
  );
}

// Composant Cell pour matricule
function MatriculeCell({ row }) {
  return (
    <span className="text-sm font-mono text-gray-900 dark:text-white">
      {row.original.matricule}
    </span>
  );
}

// Composant Cell pour statut salarié
function SalarieCell({ row }) {
  const isSalarie = row.original.salarier;
  return (
    <Button
      color={isSalarie ? "success" : "warning"}
      className="text-sm font-medium px-3 py-1 cursor-default"
      disabled
    >
      {isSalarie ? "Oui" : "Non"}
    </Button>
  );
}

// Composant Actions
function RowActions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const confirmMessages = {
    pending: {
      description: "Êtes-vous sûr de vouloir supprimer ce livreur ? Cette action est irréversible.",
    },
    success: {
      title: "Livreur supprimé",
    },
  };

  const closeModal = () => {
    setDeleteModalOpen(false);
    setDeleteSuccess(false);
    setDeleteError(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteSuccess(false);
    setDeleteError(false);
  };

  const handleDeleteRow = useCallback(async () => {
    const id = row.original.id;
    setConfirmDeleteLoading(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error("Token manquant");

      const response = await fetch(`http://localhost:3000/api/livreurs/delete/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      // Suppression locale
      table.options.meta?.deleteRow(id);
      setDeleteSuccess(true);

      // Fermeture automatique après succès
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      setDeleteError(true);
      console.error("Erreur de suppression :", err.message);
    } finally {
      setConfirmDeleteLoading(false);
    }
  }, [row.original.id, table]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate(`/agence/modifier-livreur/${row.original.id}`)}
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
  columnHelper.accessor((row) => row.nom, {
    id: "nom",
    header: "Nom & Prénom",
    cell: NameCell,
  }),
  columnHelper.accessor((row) => row.tel, {
    id: "tel",
    header: "Téléphone",
    cell: TelCell,
  }),
  columnHelper.accessor((row) => row.cin, {
    id: "cin",
    header: "CIN",
    cell: CINCell,
  }),
  columnHelper.accessor((row) => row.matricule, {
    id: "matricule",
    header: "Matricule",
    cell: MatriculeCell,
  }),
  columnHelper.accessor((row) => row.salarier, {
    id: "salarier",
    header: "Salarié",
    cell: SalarieCell,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: RowActions,
  }),
];

// Composant de recherche
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
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

// Composant Toolbar
function Toolbar({ table }) {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  useEffect(() => {
    table.setGlobalFilter(deferredGlobalFilter);
  }, [deferredGlobalFilter, table]);

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des livreurs
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez les livreurs de votre agence
            </p>
          </div>
          <Button
            style={{ backgroundColor: "rgb(254, 195, 39)", color: "rgb(39, 46, 100)" }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={() => navigate("/agence/ajouter-livreur")}
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter un livreur
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <SearchInput
              placeholder="Rechercher un livreur par nom, téléphone, CIN..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              table.resetSorting();
              table.resetPagination();
              setGlobalFilter("");
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
function ListeLivreursAgence() {
  const { user } = useAuthContext();
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  // Récupération de l'ID de l'agence
  const agenceId = user?.relatedIds?.id;

  // Fonction pour supprimer un livreur localement
  const deleteRow = useCallback((id) => {
    setLivreurs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!agenceId) {
          throw new Error("ID de l'agence non trouvé");
        }

        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        const response = await fetch(`http://localhost:3000/api/livreurs/agence/${agenceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) throw new Error("Token invalide");
          throw new Error("Erreur lors de la récupération des livreurs");
        }

        const data = await response.json();
        setLivreurs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agenceId]);

  const table = useReactTable({
    data: livreurs,
    columns,
    initialState: {
      pagination: { pageSize: 15 },
    },
    state: {
      globalFilter: deferredGlobalFilter,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      deleteRow,
    },
  });

  if (loading) {
    return (
      <Page title="Gestion des livreurs">
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <ArrowPathIcon className="size-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chargement des données...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Récupération des livreurs</p>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Gestion des livreurs">
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </Button>
              {error.includes("Token") && (
                <Button
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    window.location.href = '/login';
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
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
    <Page title="Gestion des livreurs">
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
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          <TableSortIcon sorted={header.column.getIsSorted()} />
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
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
                    <Td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
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
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun livreur trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aucun livreur dans votre agence ou aucun ne correspond à votre recherche.
            </p>
          </div>
        )}
      </div>
    </Page>
  );
}

export default ListeLivreursAgence;