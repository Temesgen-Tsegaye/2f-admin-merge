"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ColumnFiltersState,
  MRT_FilterOption,
  MRT_ColumnFilterFnsState,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip, lighten } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { UserWithPermission } from "@/types/types";
import { ChannelData } from "@/types/types";
import { fetchChannels } from "@/actions/channelAction";
import { subject } from "@casl/ability";
import { AppAbility } from "@/lib/abilities";
import { Channel } from "@prisma/client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface ChannelTableProps {
  user: UserWithPermission;
  ability: AppAbility | null;
  handleOpen: (channel: ChannelData | null) => void;
  handleDelete: (id: number) => void;
  data:Channel[]
  totalRowCount:number
}

const ChannelTable: React.FC<ChannelTableProps> = ({
  user,
  data,
  ability,
  handleOpen,
  handleDelete,
  totalRowCount
}) => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [columnFilterFns, setColumnFilterFns] =
    useState<MRT_ColumnFilterFnsState>({ id: "equals", name: "startsWith" });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });


  const searchParams = useSearchParams()
  const pathName = usePathname()
  const { replace } = useRouter()





  useEffect(() => {

    setIsLoading(true);
    ;

    const fetchURL = new URLSearchParams(searchParams)
    fetchURL.set("start", `${pagination.pageIndex}`)
    fetchURL.set("size", `${pagination.pageSize}`)
    fetchURL.set("filtersFn",JSON.stringify(columnFilterFns ?? []))
   
    fetchURL.set("filters", JSON.stringify(columnFilters ?? []))
    fetchURL.set("globalFilter", globalFilter ?? "")
    fetchURL.set("sorting", JSON.stringify(sorting ?? []))
  
    replace(`${pathName}?${fetchURL.toString()}`)
    setIsLoading(false)

  }, [
    columnFilters,
    columnFilterFns,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    replace,
    searchParams,
    pathName
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



  const columns = useMemo<MRT_ColumnDef<ChannelData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        filterFn: "equals",
        // filterVariant: "text",
        columnFilterModeOptions: ["equals", "notEquals"] as MRT_FilterOption[],
      },
      {
        accessorKey: "name",
        header: "Name",
        filterFn: "startsWith",
        filterVariant: "autocomplete",
      },

      {
        header: "Status",
        accessorFn: (row) => (row.status ? "true" : "false"),
        id: "status",
        filterVariant: "checkbox",
        enableColumnFilterModes: false,
        Cell: ({ cell }) =>
          cell.getValue() === "true" ? "Active" : "Inactive",
        size: 170,
      },
    ],
    []
  );

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
    enableColumnPinning: true,
    enableFacetedValues: true,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    enableFilterMatchHighlighting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    enableRowPinning: true,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnFilterFnsChange: setColumnFilterFns,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount:totalRowCount,
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
    renderRowActions: ({ row }) => {
      const ChannelToUpdate = row.original;
      const channelToDelete = row.original;

      return (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          {ability &&
            ability.can(
              "update",
              subject("Channel", ChannelToUpdate as Channel)
            ) && (
              <Tooltip title="Edit">
                <IconButton onClick={() => handleOpen(row.original)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          {ability &&
            ability.can(
              "delete",
              subject("Channel", channelToDelete as Channel)
            ) && (
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() =>
                    row.original.id !== undefined &&
                    handleDelete(row.original.id)
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
        </Box>
      );
    },

    renderTopToolbar: () => (
      <Box
        sx={(theme) => ({
          backgroundColor: lighten(theme.palette.background.default, 0.05),
          display: "flex",
          gap: "0.5rem",
          p: "8px",
          justifyContent: "space-between",
        })}
      >
        {ability && ability.can("create", "Channel") && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen(null)}
            startIcon={<AddIcon />}
          >
            Add Channel
          </Button>
        )}
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <MRT_GlobalFilterTextField table={table} />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default ChannelTable;
