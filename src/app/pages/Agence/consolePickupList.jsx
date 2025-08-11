import { useState, useEffect, useDeferredValue } from "react";
import { useAuthContext } from "app/contexts/auth/context";
import { Page } from "components/shared/Page";
import { useNavigate } from "react-router";
import { Button, Badge, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { rankItem } from "@tanstack/match-sorter-utils";
import clsx from "clsx";

// Fonction fuzzyFilter pour la recherche
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export default function ConsolePickupList() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const agenceId = user?.relatedIds?.id;

  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const deferredGlobalFilter = useDeferredValue(globalFilter);

  // Filtres
  const [dt1, setDt1] = useState(new Date().toISOString().split("T")[0]);
  const [dt2, setDt2] = useState(new Date().toISOString().split("T")[0]);

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Définition des colonnes - maintenant à l'intérieur du composant pour accéder à navigate
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor((row) => row.id_console, {
      id: "id_console",
      header: "N° Console",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {row.original.id_console}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.agence_dest, {
      id: "destination",
      header: "Destination",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {row.original.agence_dest}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.dt, {
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(row.original.dt).toLocaleString("fr-TN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.etat, {
      id: "etat",
      header: "État",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Badge
            color={row.original.etat === 1 ? "success" : "warning"}
            className="px-3 py-1.5 text-xs font-medium"
          >
            {row.original.etat === 1 ? "Validé" : "En cours"}
          </Badge>
        </div>
      ),
    }),
    columnHelper.accessor((row) => row.nb_colis, {
      id: "nb_colis",
      header: "Colis",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {row.original.nb_colis}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Button
            size="sm"
            color="info"
            onClick={() => navigate(`/agence/detail-console-pickup/${row.original.id_console}`)}
            className="px-3 py-1.5 text-xs"
            icon={
              <i className="fa fa-list text-white text-xs opacity-80"></i>
            }
          >
            Détail
          </Button>
        </div>
      ),
    }),
  ];

  const fetchConsoles = async () => {
    if (!agenceId) {
      toast.error("Agence non trouvée.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/console-pickup/date?agence=${agenceId}&dt1=${dt1}&dt2=${dt2}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();

        // Si c'est juste qu'il n'y a pas de données, on ne considère pas ça comme une erreur
        if (error.message && error.message.includes("Aucune console pickup trouvée")) {
          setConsoles([]);
          setHasSearched(true);
          setLoading(false);
          return;
        }

        throw new Error(error.message || "Échec du chargement des consoles");
      }

      const data = await response.json();
      setConsoles(data);
      setHasSearched(true);
    } catch (err) {
      console.error("Erreur:", err);
      toast.error(err.message || "Impossible de charger les données.");
      setConsoles([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    fetchConsoles();
  }, [agenceId, dt1, dt2]); // Ajout des dépendances manquantes

  const handleSearch = (e) => {
    e.preventDefault();
    table.setPageIndex(0); // Reset à la première page lors d'une nouvelle recherche
    fetchConsoles();
  };

  // Configuration du tableau avec React Table
  const table = useReactTable({
    data: consoles,
    columns,
    initialState: {
      pagination: { pageSize: 10 },
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

  const rows = table.getRowModel().rows;

  return (
    <Page title="Liste des Consoles Pickup">
      <div className="w-full mx-auto bg-white dark:bg-dark-800 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Consoles Pickup
        </h1>
        {/* Filtres */}
        <form onSubmit={handleSearch} className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg mb-6 space-y-4 md:space-y-0 md:space-x-4 md:flex md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Du</label>
            <DatePicker
              value={dt1}
              onChange={(date) => setDt1(date ? new Date(date).toISOString().split("T")[0] : "")}
              placeholder="Choisir la date de début"
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Au</label>
            <DatePicker
              value={dt2}
              onChange={(date) => setDt2(date ? new Date(date).toISOString().split("T")[0] : "")}
              placeholder="Choisir la date de fin"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            color="secondary"
            icon={<MagnifyingGlassIcon />}
            disabled={loading}
          >
            {loading ? "Recherche..." : "Rechercher"}
          </Button>
        </form>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex justify-center py-10">
            <ArrowPathIcon className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des consoles...</span>
          </div>
        ) : hasSearched && consoles.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aucune console pickup trouvée pour cette période.
          </div>
        ) : consoles.length > 0 ? (
          <div>
            {/* Tableau */}
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

            {/* Pagination */}
            {rows.length > 0 && (
              <div className="px-6 py-4">
                <PaginationSection table={table} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Page>
  );
}