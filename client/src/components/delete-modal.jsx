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
            <DialogTitle className="text-xl">
              Oʻchirishni tasdiqlang
            </DialogTitle>
            <DialogDescription className="mt-3 text-[15px] leading-normal">
              Bu amalni ortga qaytarib bo‘lmaydi. Bu tanlangan elementni
              butunlay oʻchirib tashlaydi va serverlarimizdan bogʻlangan barcha
              maʼlumotlarni oʻchirib tashlaydi.
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
              Yopish
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
            O'chirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
