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
  isOpen,
  users,
  toggleModal,
  handleSubmit,
  previewUrl,
  setPreviewUrl,
  handleInputChange,
  availableMembers,
  handleMemberChange,
  handleSelectChange,
  disabled,
  isSubmitting,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileInput = useCallback(
    (file) => {
      if (file && file.type.startsWith("image/")) {
        const event = {
          target: {
            id: "image",
            files: [file],
          },
        };
        handleInputChange(event);
      }
    },
    [handleInputChange]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileInput(file);
  };

  const handleImageClear = () => {
    const event = {
      target: {
        id: "image",
        value: "",
        files: null,
      },
    };
    handleInputChange(event);
    setPreviewUrl("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Create New Group
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[85vh] px-1.5">
          <form onSubmit={handleSubmit} className="space-y-6 px-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium">
                  Group Image
                </Label>
                <div
                  className={`relative group cursor-pointer ${
                    isDragging ? "border-primary" : "border-border"
                  } border-2 border-dashed rounded-lg transition-colors duration-200`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="relative aspect-video">
                      <img
                        className="w-full h-full rounded-lg object-cover"
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                      />
                      <button
                        type="button"
                        onClick={handleImageClear}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileInput(file);
                        };
                        input.click();
                      }}
                      className="aspect-video flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="p-4 rounded-full bg-secondary">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium">
                          Drag and drop your image here, or click to select
                        </p>
                        <p className="text-xs">Supports: JPG, PNG, GIF</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Group Name
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
                  Level
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleSelectChange("level", value)}
                >
                  <SelectTrigger id="level" className="w-full">
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select level</SelectLabel>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievement" className="text-sm font-medium">
                  Achievement
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
                      <SelectLabel>Select achievement</SelectLabel>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="badge">Badge</SelectItem>
                      <SelectItem value="points">Points</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
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
                <Label className="text-sm font-medium">Members</Label>
                <MultiSelect
                  options={availableMembers}
                  users={users}
                  onValueChange={handleMemberChange}
                  placeholder="Select members"
                  animation={1}
                  maxCount={3}
                  value={formData.members}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={toggleModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                disabled={disabled}
                type="submit"
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Group"
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
