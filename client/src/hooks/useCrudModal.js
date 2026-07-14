import { useState } from "react";

const useCrudModal = () => {
  const [selected, setSelected]     = useState(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openAdd = (resetForm) => {
    resetForm?.();
    setAddOpen(true);
  };

  const openUpdate = (item) => {
    setSelected(item);
    setUpdateOpen(true);
  };

  const openDelete = (item) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  const closeAll = () => {
    setAddOpen(false);
    setUpdateOpen(false);
    setDeleteOpen(false);
    setSelected(null);
  };

  return {
    selected,
    addOpen, setAddOpen,
    updateOpen, setUpdateOpen,
    deleteOpen,
    openAdd, openUpdate, openDelete, closeAll,
  };
};

export default useCrudModal;
