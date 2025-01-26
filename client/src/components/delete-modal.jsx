"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DeleteModal = ({ isOpen, onOpenChange, onConfirm, isPending }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-destructive/10 p-5 text-destructive">
            <AlertTriangle className="h-20 w-20" />
          </div>
          <div className="text-center">
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="mt-3 text-[15px] leading-normal">
              This action cannot be undone. This will permanently delete the
              selected item and remove all associated data from our servers.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto gap-2 hover:bg-destructive/90"
            disabled={isPending}
            onClick={onConfirm}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
