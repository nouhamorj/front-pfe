// src/app/pages/Agence/ListeEchange.jsx
import { useState, useEffect, useDeferredValue } from "react";
import { useAuthContext } from "app/contexts/auth/context";
import { Page } from "components/shared/Page";
import { useNavigate } from "react-router";
import { Button, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { MagnifyingGlassIcon, PrinterIcon, PlusIcon } from "@heroicons/react/24/outline";
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

// Fonction fuzzyFilter
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export default function ListeEchange() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const agenceId = user?.relatedIds?.id;
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const [echanges, setEchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  // Filtres dates
  const [dt1, setDt1] = useState(new Date().toISOString().split("T")[0]);
  const [dt2, setDt2] = useState(new Date().toISOString().split("T")[0]);

  const deferredGlobalFilter = useDeferredValue(globalFilter);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("code_barre", {
      id: "code_barre",
      header: "Code à barre",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-medium">
          {row.original.code_barre}
        </span>
      ),
    }),
    columnHelper.accessor("code_echange", {
      id: "code_echange",
      header: "Code échange",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">
          {row.original.code_echange}
        </span>
      ),
    }),
    columnHelper.accessor("expediteur_nom_page", {
      id: "expediteur",
      header: "Expéditeur",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {row.original.expediteur_nom_page || "Inconnu"}
        </span>
      ),
    }),
    columnHelper.accessor("date_echange", {
      id: "date_echange",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date_echange);
        return (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {date.toLocaleDateString("fr-TN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="info"
            icon={<PrinterIcon className="h-4 w-4" />}
            onClick={() =>
              window.open(
                `/agence/imprimer-echange/${row.original.id}`,
                "_blank"
              )
            }
            className="px-3 py-1.5 text-xs"
          >
            Imprimer
          </Button>
        </div>
      ),
    }),
  ];

  const fetchEchanges = async () => {
    if (!agenceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/echange?dt1=${dt1}&dt2=${dt2}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Échec du chargement des échanges");

      const data = await response.json();
      setEchanges(data.data || []);
      setHasSearched(true);
    } catch (err) {
      console.error("Erreur:", err);
      setEchanges([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage ou quand les filtres changent
  useEffect(() => {
    fetchEchanges();
  }, [agenceId, dt1, dt2]);

  const handleSearch = (e) => {
    e.preventDefault();
    table.setPageIndex(0);
    fetchEchanges();
  };

  // Configuration du tableau
  const table = useReactTable({
    data: echanges,
    columns,
    initialState: {
      pagination: { pageSize: 10 },
    },
    state: {
      globalFilter: deferredGlobalFilter,
      sorting,
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

  const rows = table.getRowModel().rows;

  return (
    <Page title="Liste des échanges">
      <div className="w-full mx-auto bg-white dark:bg-dark-800 p-6 rounded-xl shadow">
        <div className="flex flex-wrap items-center justify-between mb-6">
           <h5 className="text-xl font-semibold text-gray-800 dark:text-white">
            Liste des colis
          </h5>
          <Button
            color="primary"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={() => navigate("/agence/generer-echange")}
            className="mt-2 sm:mt-0"
          >
            Ajouter un échange
          </Button>
        </div>

        {/* Filtres */}
        <form onSubmit={handleSearch} className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg mb-6 space-y-4 md:space-y-0 md:space-x-4 md:flex md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Du</label>
            <DatePicker
              value={dt1}
              onChange={(date) =>
                setDt1(date ? new Date(date).toISOString().split("T")[0] : "")
              }
              placeholder="Date de début"
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Au</label>
            <DatePicker
              value={dt2}
              onChange={(date) =>
                setDt2(date ? new Date(date).toISOString().split("T")[0] : "")
              }
              placeholder="Date de fin"
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

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
          </div>
        ) : hasSearched && echanges.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aucun colis échange trouvé dans cette période.
          </div>
        ) : (
          <div>
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
                        index % 2 === 0 ? "bg-white dark:bg-dark-800" : "bg-gray-50/50 dark:bg-dark-750"
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
          </div>
        )}
      </div>
    </Page>
  );
}