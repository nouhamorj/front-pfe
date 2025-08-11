// Import Dependencies
import { Page } from "components/shared/Page";
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
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { useDeferredValue, useMemo, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";

// Local Imports
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button, Table, THead, TBody, Th, Tr, Td, Badge, Avatar } from "components/ui";

// ----------------------------------------------------------------------
// Fonction de filtre flou (fuzzy)
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// Composant filtre par agence
function AgenceFilter({ column, agenceOptions }) {
  const selectedValue = column.getFilterValue() || "";
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agence:</span>
      <select
        value={selectedValue}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
      >
        <option value="">Toutes</option>
        {agenceOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}

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

// Cellule Nom
function NameCell({ row }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar size={10} name={row.original.nom} initialColor="auto" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {row.original.nom}
        </p>
      </div>
    </div>
  );
}

// Cellule Agence
function AgenceCell({ row }) {
  const agence = row.original.agenceLibelle;
  const supportedColors = ['primary', 'secondary', 'info', 'warning', 'success'];
  const colorIndex = (row.original.id_agence || 0) % supportedColors.length;
  const color = supportedColors[colorIndex];
  return (
    <Badge color={color} variant="soft" className="capitalize">
      {agence}
    </Badge>
  );
}

// Actions par ligne
function RowActions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const confirmMessages = {
    pending: {
      description: "Êtes-vous sûr de vouloir supprimer ce chauffeur ? Cette action est irréversible.",
    },
    success: {
      title: "Chauffeur supprimé",
    },
  };

  const closeModal = () => setDeleteModalOpen(false);
  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRow = useCallback(async () => {
    const id = row.original.id;
    setConfirmDeleteLoading(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error("Token manquant");

      const response = await fetch(`http://localhost:3000/api/chauffeurs/delete/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      table.options.meta?.deleteRow(row);
      setDeleteSuccess(true);
    } catch (err) {
      setDeleteError(true);
      console.error("Erreur de suppression :", err.message);
    } finally {
      setConfirmDeleteLoading(false);
    }
  }, [row, table]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate(`/admin/modifier-chauffeur/${row.original.id}`)}
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
  columnHelper.accessor("nom", {
    header: "Nom & Prénom",
    cell: NameCell,
  }),
  columnHelper.accessor("tel", {
    header: "Téléphone",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PhoneIcon className="size-4 text-gray-400" />
        <span className="text-sm text-gray-900 dark:text-white">{row.original.tel}</span>
      </div>
    ),
  }),
  columnHelper.accessor("cin", {
    header: "CIN",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UserIcon className="size-4 text-gray-400" />
        <span className="text-sm text-gray-900 dark:text-white">{row.original.cin}</span>
      </div>
    ),
  }),
  columnHelper.accessor("agenceLibelle", {
    header: "Agence",
    cell: AgenceCell,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return String(row.original.id_agence) === filterValue;
    },
  }),
  columnHelper.accessor("matricule", {
    header: "Matricule",
    cell: ({ row }) => (
      <span className="text-sm font-mono text-gray-900 dark:text-white">{row.original.matricule}</span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: RowActions,
  }),
];

// Toolbar
function Toolbar({ table, agenceOptions }) {
  const navigate = useNavigate();
  const agenceColumn = table.getColumn("agenceLibelle");
  const globalFilter = table.getState().globalFilter ?? "";

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des chauffeurs</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez et organisez vos chauffeurs efficacement
            </p>
          </div>
          <Button
            style={{ backgroundColor: "rgb(254, 195, 39)", color: "rgb(39, 46, 100)" }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={() => navigate("/admin/ajouter-chauffeur")}
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter un chauffeur
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <SearchInput
              placeholder="Rechercher un chauffeur par nom, téléphone, CIN..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <AgenceFilter column={agenceColumn} agenceOptions={agenceOptions} />
            <Button
              unstyled
              onClick={() => {
                table.resetSorting();
                table.resetPagination();
                table.setGlobalFilter("");
                agenceColumn.setFilterValue("");
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-600"
              title="Réinitialiser les filtres"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal
function ChauffeursDataTable() {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) throw new Error('Token manquant');

        const [chauffeursRes, agencesRes] = await Promise.all([
          fetch('http://localhost:3000/api/chauffeurs', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/api/agences', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (!chauffeursRes.ok || !agencesRes.ok) throw new Error('Erreur réseau');

        const [chauffeursData, agencesData] = await Promise.all([
          chauffeursRes.json(),
          agencesRes.json(),
        ]);

        setAgences(agencesData);
        const agenceMap = Object.fromEntries(agencesData.map(ag => [ag.id, ag.libelle]));

        const enriched = chauffeursData.map(c => ({
          ...c,
          agenceLibelle: agenceMap[c.id_agence] || 'Inconnue',
        }));

        setChauffeurs(enriched);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = useMemo(() => chauffeurs, [chauffeurs]);

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      globalFilter: deferredGlobalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: { pageSize: 15 },
    },
    meta: {
      deleteRow: (row) => {
        setChauffeurs(prev => prev.filter(c => c.id !== row.original.id));
      },
    },
  });

  if (loading) {
    return (
      <Page title="Gestion des chauffeurs">
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <ArrowPathIcon className="size-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chargement...</h3>
            <p className="text-gray-600 dark:text-gray-400">Récupération des chauffeurs</p>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Gestion des chauffeurs">
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Erreur</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded">
              Réessayer
            </Button>
          </div>
        </div>
      </Page>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <Page title="Gestion des chauffeurs">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toolbar table={table} agenceOptions={agences} />
        <div className="overflow-x-auto">
          <Table className="w-full">
            <THead>
              {table.getHeaderGroups().map(headerGroup => (
                <Tr key={headerGroup.id} className="border-b border-gray-200 dark:border-dark-600">
                  {headerGroup.headers.map(header => (
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
                    "border-b border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors",
                    index % 2 === 0 ? "bg-white dark:bg-dark-800" : "bg-gray-50/50 dark:bg-dark-750"
                  )}
                >
                  {row.getVisibleCells().map(cell => (
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun chauffeur trouvé</h3>
            <p className="text-gray-600 dark:text-gray-400">Modifiez vos filtres ou ajoutez un nouveau chauffeur.</p>
          </div>
        )}
      </div>
    </Page>
  );
}

// PropTypes
Toolbar.propTypes = {
  table: PropTypes.object.isRequired,
  agenceOptions: PropTypes.array.isRequired,
};

AgenceFilter.propTypes = {
  column: PropTypes.object.isRequired,
  agenceOptions: PropTypes.array.isRequired,
};

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

NameCell.propTypes = { row: PropTypes.object };
AgenceCell.propTypes = { row: PropTypes.object };
RowActions.propTypes = { row: PropTypes.object, table: PropTypes.object };

export default ChauffeursDataTable;