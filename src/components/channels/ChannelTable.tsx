"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"

import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ColumnFiltersState,
  useMaterialReactTable,
  MRT_FilterOption,
  MRT_ColumnFilterFnsState,
} from "material-react-table"
import { ChannelData } from "../../types/types"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  lighten,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import { z, ZodError } from "zod"
import { useSession } from "next-auth/react"

const ChannelTable = () => {
  const [open, setOpen] = useState(false)
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(null)

  const [formData, setFormData] = useState<Partial<ChannelData>>({})
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [columnFilterFns, setColumnFilterFns] =
    useState<MRT_ColumnFilterFnsState>({ id: "equals", name: "startsWith" })
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const { data: session } = useSession()
  const user = useMemo(() => {
    return session?.user
  }, [session?.user])

  const getAbility = useCallback(async () => {
    if (user) {
      console.log(user)
    }
  }, [user])

  useEffect(() => {
    getAbility()
  }, [getAbility])

  //   const channelsData = useCallback(async () => {
  //     setIsLoading(true)
  //     try {
  //       const params = {
  //         start: `${pagination.pageIndex}`,
  //         size: `${pagination.pageSize}`,
  //         filters: JSON.stringify(columnFilters ?? []),
  //         filtersFn: JSON.stringify(columnFilterFns ?? []),
  //         globalFilter: globalFilter ?? "",
  //         sorting: JSON.stringify(sorting ?? []),
  //       }

  //       const { records, totalRowCount } = await fetchChannels(params, user)
  //       setChannels(records)
  //       setRowCount(totalRowCount)
  //     } catch (error) {
  //       console.error("Error fetching channels:", error)
  //       setIsError(true)
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }, [
  //     columnFilters,
  //     columnFilterFns,
  //     globalFilter,
  //     pagination.pageIndex,
  //     pagination.pageSize,
  //     sorting,
  //   ])

  //   useEffect(() => {
  //     channelsData()
  //   }, [channelsData, columnFilterFns])

  //   const handleOpen = (channel: ChannelData | null = null) => {
  //     setCurrentChannel(channel)
  //     setFormData(channel ? { ...channel } : {})
  //     setOpen(true)
  //   }

  const handleDelete = async (id: number) => {
    const channelToDelete = channels.find((channel) => channel.id === id)
    // if (
    //   ability &&
    //   ability.can(
    //     "delete",
    //     subject("Channel", { ...channelToDelete } as Channel)
    //   ) &&
    //   window.confirm("Are you sure you want to delete this channel?")
    // ) {
    // try {
    //   await deleteChannel(id, user)
    //   channelsData()
    // } catch (error) {
    //   console.error("Error deleting channel:", error)
    // }
    // } else {
    //   console.log("not have permission");
    //   setValidationError("You do not have permission to Delete this channel.");
    // }
  }

  const handleColumnFiltersChange = useCallback(
    (updaterOrValue: any) => {
      const newFilters =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue

      const updatedFilters = newFilters.map((filter: any) => {
        const column = columns.find(
          (col) => col.accessorKey === filter.id || col.id === filter.id
        )
        let filtervariant
        if (["id"].includes(filter.id)) {
          filtervariant = "number"
        } else {
          filtervariant = column?.filterVariant
        }

        return {
          ...filter,
          ...(filtervariant && { filtervariant }),
          ...(column?.accessorFn && { filtervariant: filtervariant || "text" }),
        }
      })
      setColumnFilters(updatedFilters)
    },
    [columnFilters, columnFilterFns]
  )

  const filteringMethods = {
    numeric: [
      "equals",
      "notEquals",
      "between",
      "betweenInclusive",
      "greaterThan",
      "greaterThanOrEqual",
      "lessThan",
      "lessThanOrEqual",
    ],
    character: [
      "fuzzy",
      "contains",
      "startsWith",
      "endsWith",
      "equals",
      "notEquals",
    ],
  }

  const columns = useMemo<MRT_ColumnDef<ChannelData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        filterFn: "equals",
        filterVariant: "text",
        columnFilterModeOptions: filteringMethods.numeric as MRT_FilterOption[],
      },
      {
        accessorKey: "name",
        header: "Name",
        filterFn: "startsWith",
        filterVariant: "autocomplete",
      },
      {
        header: "Status",
        accessorFn: (row) => (row.isActive ? "true" : "false"),
        id: "isActive",
        filterVariant: "checkbox",
        enableColumnFilterModes: false,
        Cell: ({ cell }) =>
          cell.getValue() === "true" ? "Active" : "Inactive",
        size: 170,
      },
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    data: channels,
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
    rowCount,
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
      const ChannelToUpdate = row.original
      const channelToDelete = row.original

      return (
        <Box sx={{ display: "flex", gap: "1rem", bgcolor: "wheat" }}>
          {/* {ability &&
            ability.can(
              "update",
              subject("Channel", ChannelToUpdate as Channel)
            ) && ( */}
          <Tooltip title="Edit">
            <IconButton
            // onClick={() => handleOpen(row.original)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {/* )} */}
          {/* {ability &&
            ability.can(
              "delete",
              subject("Channel", channelToDelete as Channel)
            ) && ( */}
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() =>
                row.original.id !== undefined && handleDelete(row.original.id)
              }
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          {/* )} */}
        </Box>
      )
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
        {/* {ability && ability.can("create", "Channel") && ( */}
        <Button
          variant="contained"
          color="primary"
          //   onClick={() => handleOpen()

          //   }
          startIcon={<AddIcon />}
        >
          Add Channel
        </Button>
        {/* )} */}
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <MRT_GlobalFilterTextField table={table} />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
      </Box>
    ),
  })
  return (
    <>
      <MaterialReactTable table={table} />
    </>
  )
}
export default ChannelTable
