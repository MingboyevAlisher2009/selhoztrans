import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";

const Modal = ({
  formData,
  open,
  users,
  onOpenChange,
  handleSubmit,
  handleInputChange,
  availableMembers,
  handleMemberChange,
  handleSelectChange,
  disabled,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Gruh</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[85vh] px-1.5">
          <form onSubmit={handleSubmit} className="space-y-6 px-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Gruh nomi
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter group name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-sm font-medium">
                  Daraja
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleSelectChange("level", value)}
                >
                  <SelectTrigger
                    id="level"
                    value={formData.level}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Darajani tanlang</SelectLabel>
                      <SelectItem value="beginner">Boshlovchi</SelectItem>
                      <SelectItem value="intermediate">O'rta</SelectItem>
                      <SelectItem value="advanced">Murakkab</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievement" className="text-sm font-medium">
                  Muvaffaqiyat
                </Label>
                <Select
                  value={formData.achievement}
                  onValueChange={(value) =>
                    handleSelectChange("achievement", value)
                  }
                >
                  <SelectTrigger id="achievement" className="w-full">
                    <SelectValue placeholder="Select achievement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tanlang muvaffaqiyat</SelectLabel>
                      <SelectItem value="certificate">Sertifikat</SelectItem>
                      <SelectItem value="badge">Belgi</SelectItem>
                      <SelectItem value="points">Ballar</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Tavsif
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter group description"
                  className="w-full min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">A'zo</Label>

                <MultiSelect
                  onValueChange={handleMemberChange}
                  users={users}
                  options={availableMembers}
                  defaultValue={formData.members.map((user) => user._id)}
                  placeholder="Search and select members..."
                  animation={0.3}
                  modalPopover
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onOpenChange}
                className="w-full sm:w-auto"
              >
                Yopish
              </Button>
              <Button
                disabled={disabled}
                type="submit"
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yaratilmoqda...
                  </>
                ) : (
                  "Saqlash"
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
