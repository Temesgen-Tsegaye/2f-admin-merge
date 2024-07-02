"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Box, Button, IconButton, Tooltip, lighten } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_FilterOption,
  MRT_GlobalFilterTextField,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_ToggleFiltersButton,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useSnackbar } from "notistack";
import { Program } from "./programType";
import { deleteProgram } from "@/actions/programActions";
import { AppAbility } from "@/lib/abilities";
import { UserWithPermission } from "@/types/types";
import { subject } from "@casl/ability";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Program as PrismaProgram } from "@prisma/client";

interface ProgramTableProps {
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  handleEditProgram: (program: Program) => void;
  handleOpenDialog: (program: Program | null) => void;
  user: UserWithPermission;
  ability: AppAbility | null;
  data: Program[];
  totalRowCount: number;
}

const ProgramTable: React.FC<ProgramTableProps> = ({
  programs,
  setPrograms,
  handleEditProgram,
  handleOpenDialog,
  user,
  ability,
  data,
  totalRowCount,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [isRefetching, setIsRefetching] = useState(false);

  // table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [columnFilterFns, setColumnFilterFns] =
    useState<MRT_ColumnFilterFnsState>({
      id: "equals",
      title: "startsWith",
      duration: "between",
      description: "contains",
      type_name: "equals",
      channel_name: "contains",
      category_name: "equals",
      released: "between",
    });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    setIsLoading(true);
    const fetchURL = new URLSearchParams(searchParams);
    fetchURL.set("start", `${pagination.pageIndex}`);
    fetchURL.set("size", `${pagination.pageSize}`);
    fetchURL.set("filtersFn", JSON.stringify(columnFilterFns ?? []));

    fetchURL.set("filters", JSON.stringify(columnFilters ?? []));
    fetchURL.set("globalFilter", globalFilter ?? "");
    fetchURL.set("sorting", JSON.stringify(sorting ?? []));

    replace(`${pathName}?${fetchURL.toString()}`);
    setIsLoading(false);
  }, [
    columnFilters,
    columnFilterFns,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    replace,
    searchParams,
    pathName,
  ]);

  const handleColumnFiltersChange = useCallback(
    (updaterOrValue: any) => {
      const newFilters =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue;

      const updatedFilters = newFilters.map((filter: any) => {
        const column = columns.find(
          (col) => col.accessorKey === filter.id || col.id === filter.id
        );

        let filtervariant;
        if (["id"].includes(filter.id)) {
          filtervariant = "number";
        } else {
          filtervariant = column?.filterVariant;
        }

        return {
          ...filter,
          ...(filtervariant && { filtervariant }),
          ...(column?.accessorFn && { filtervariant: filtervariant || "text" }),
        };
      });

      setColumnFilters(updatedFilters);
    },
    [columnFilters, columnFilterFns]
  );

  const filteringMethods = {
    numeric: [
      "equals",
      "notEquals",
      "between",
      "betweenInclusive",
      "greaterThan",
      "greaterThanOrEqualTo",
      "lessThan",
      "lessThanOrEqualTo",
    ],
    dateTime: [
      "fuzzy",
      "contains",
      "startsWith",
      "endsWith",
      "equals",
      "notEquals",
    ],
    range: ["between", "betweenInclusive"],
  };

  const columns = useMemo<MRT_ColumnDef<Program>[]>(
    () => [
      {
        header: "Id ",
        accessorKey: "id",
        columnFilterModeOptions: filteringMethods.numeric as MRT_FilterOption[],
        size: 100,
      },
      {
        header: "Title",
        accessorKey: "title",
        filterVariant: "autocomplete",
      },
      {
        header: "Duration",
        accessorKey: "duration",
        filterVariant: "range-slider",
        muiFilterSliderProps: {
          max: 10_000_000,
          min: 100_000,
          marks: true,
          step: 200_000,
        },
      },
      {
        header: "Description",
        accessorKey: "description",
        filterVariant: "text",
        size: 300,
      },
      {
        accessorFn: (row) => row.channel?.name || "",
        id: "channel_name",
        header: "Channel",
        filterVariant: "select",
        // enableColumnFilterModes: false,
        size: 100,
      },
      {
        accessorFn: (row) => row.type?.name || "",
        id: "type_name",
        header: "Type",
        filterVariant: "select",
        // enableColumnFilterModes: false,
        size: 50,
      },

      {
        accessorFn: (row) => row.category?.name || "",
        id: "category_name",
        header: "Category",
        filterVariant: "multi-select",
        filterFn: "notEquals",
        columnFilterModeOptions: ["equals", "notEquals"],
        // enableColumnFilterModes: false,
        size: 100,
      },
      {
        accessorFn: (row) =>
          row.released ? new Date(row.released) : new Date(),
        id: "released",
        header: "Released Date",
        filterVariant: "datetime",
        filterFn: "between",
        columnFilterModeOptions: filteringMethods.numeric as MRT_FilterOption[],
        Cell: ({ cell }) =>
          `${cell.getValue<Date>().toLocaleDateString()} ${cell
            .getValue<Date>()
            .toLocaleTimeString()}`,
      },
    ],
    []
  );

  const handleDeleteProgram = async (id: number) => {
    const programToDelete = programs.find((program) => program.id === id)
    if (
      ability &&
      ability.can(
        "delete",
        subject("Program", { ...programToDelete } as PrismaProgram)
      ) &&
      window.confirm("Are you sure you want to delete this program?")
    ) {
      try {
        await deleteProgram(id, user)
        enqueueSnackbar("Program deleted successfully", { variant: "error" })
      } catch (error) {
        console.error("Error deleting program:", error)
        setIsError(true)
      }
    }
  }

  const table = useMaterialReactTable({
    columns,
    data: data,
    getRowId: (row) => String(row.id),
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    enableRowActions: true,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnFilterFnsChange: setColumnFilterFns,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: totalRowCount,
    state: {
      columnFilters,
      columnFilterFns,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    renderRowActions: ({ row, table }) => {
      const ProgramToUpdate = row.original;
      return (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          {ability &&
            ability.can(
              "update",
              subject("Program", ProgramToUpdate as PrismaProgram)
            ) && (
              <Tooltip title="Edit">
                <IconButton onClick={() => handleOpenDialog(row.original)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          {ability &&
            ability.can(
              "delete",
              subject("Program", ProgramToUpdate as PrismaProgram)
            ) && (
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() =>
                    row.original.id !== undefined &&
                    handleDeleteProgram(row.original.id)
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
        </Box>
      );
    },
    renderTopToolbar: ({ table }) => (
      <Box
        sx={(theme) => ({
          backgroundColor: lighten(theme.palette.background.default, 0.05),
          display: "flex",
          gap: "0.5rem",
          p: "8px",
          justifyContent: "space-between",
        })}
      >
        {ability?.can("create", "Program") && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog(null)}
            startIcon={<AddIcon />}
          >
            Add Program
          </Button>
        )}
        <Box
          sx={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginRight: "5%",
          }}
        >
          <MRT_GlobalFilterTextField table={table} />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default ProgramTable;
