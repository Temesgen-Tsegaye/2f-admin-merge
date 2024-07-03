"use client";
import React, { useState, useEffect, useCallback } from "react";
import ProgramForm from "./ProgramForm";
import ProgramTable from "./ProgramTable";
import { Program } from "./programType";
import { UserWithPermission } from "@/types/types";
import { AppAbility, defineAbilitiesFor } from "@/lib/abilities";
import { allChannels } from "@/actions/channelAction";
import { Box } from "@mui/material";
import Loading from "@/app/loading";

interface ProgramManagementProps {
  data: Program[];
  totalRowCount: number;
  user: UserWithPermission;
}

interface Setter {
  id: number;
  name: string;
}

const ProgramManagement: React.FC<ProgramManagementProps> = ({
  data,
  totalRowCount,
  user,
}) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Partial<Program> | null>(
    null
  );
  const [newProgram, setNewProgram] = useState<Partial<Program>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [channels, setChannels] = useState<Setter[]>([]);
  const [types, setTypes] = useState<Setter[]>([]);
  const [categories, setCategories] = useState<Setter[]>([]);
  const [ability, setAbility] = useState<AppAbility | null>(null);

  useEffect(() => {
    const fetchAbilities = async () => {
      if (user) {
        const fetchedAbility = await defineAbilitiesFor(user);
        setAbility(fetchedAbility);
      }
    };
    fetchAbilities();
  }, [user]);

  const channelsData = useCallback(async () => {
    try {
      const records = await allChannels();
      console.log(records);
      setChannels(records);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }, []);
  useEffect(() => {
    channelsData();
  }, [channelsData]);

  useEffect(() => {
    setTypes([
      { id: 1, name: "Live TV" },
      { id: 2, name: "Movies" },
      { id: 3, name: "TV Shows" },
      { id: 4, name: "Sports" },
    ]);

    setCategories([
      { id: 1, name: "Recommended" },
      { id: 2, name: "Popular" },
      { id: 3, name: "Featured" },
    ]);
  }, []);


  const handleOpenDialog = (program: Program | null = null) => {
    setEditingProgram(program);
    setNewProgram(program ? { ...program } : {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewProgram({});
  };

  if (!ability) {
    return <Box><Loading/></Box>;
  }
  
  return (
    <>
      <ProgramTable
        programs={programs}
        handleOpenDialog={handleOpenDialog}
        user={user}
        ability={ability}
        data={data}
        totalRowCount={totalRowCount}
      />
      <ProgramForm
        editingProgram={editingProgram}
        newProgram={newProgram}
        setNewProgram={setNewProgram}
        channels={channels}
        types={types}
        categories={categories}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        user={user}
        ability={ability}
        setPrograms={setPrograms}
      />
    </>
  );
};

export default ProgramManagement;
