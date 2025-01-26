import { Button } from "@/components/ui/button";
import { CalendarIcon, ImagePlus, Plus, Trash } from "lucide-react";
import { motion } from "framer-motion";
import DeleteModal from "@/components/delete-modal";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MultiSelect } from "@/components/multi-select";
import { useMutation } from "@tanstack/react-query";
import axiosIntense from "@/http/axios";
import GroupSkeleton from "@/components/skeletons/group";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from "@/http/api";
import GroupCard from "./components/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isAfter, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import useUsers from "@/store/use-users";
import { useParams } from "react-router-dom";

const Group = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(Date.now);
  const [userId, setUserId] = useState(null);
  const { users, getUsers } = useUsers();
  const inputRef = useRef();
  const { id } = useParams();

  const toggleModal = () => setIsOpen(!isOpen);
  const toggleDeleteModal = (id) => {
    setUserId(id);
    setIsDeleteOpen(!isDeleteOpen);
  };

  const { mutate, data, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosIntense.get(
        `/group/${id}?date=${format(selectedDate, "yyyy-MM-dd")}`
      );
      const userIds = data.data.members.map((user) => user._id);
      setMembers(userIds);
      return data;
    },
  });

  const handleSelect = (date) => {
    if (!date) return;

    const today = startOfDay(new Date());

    if (isAfter(date, today)) {
      return toast.error("Cannot select a future date");
    }
    setSelectedDate(date);
  };

  const { mutate: addImage } = useMutation({
    mutationFn: async (e) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("group-image", file);
      formData.append("groupId", data?.data?._id);
      await axiosIntense.post(`/group/group-image`, formData);
      return;
    },
    onSuccess: () => {
      mutate();
      toast("Image added succesfully");
    },
  });

  const { mutate: addMember, isPending: isAddingMembers } = useMutation({
    mutationFn: async () => {
      const newMembers = members.filter(
        (memberId) =>
          !data.data.members.some(
            (existingMember) => existingMember._id === memberId
          )
      );

      await axiosIntense.post(`/group/add-member`, {
        groupId: data?.data?._id,
        members: newMembers,
      });
      return;
    },
    onSuccess: () => {
      mutate();
      toggleModal();
      toast("Member added succesfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong.");
    },
  });

  const { mutate: handleCheck, isPending: loading } = useMutation({
    mutationFn: async (attendance) => {
      const { data } = await axiosIntense.post("/group/attendance", attendance);
      return data;
    },
    onSuccess: () => {
      mutate();
    },
  });

  const { mutate: removeImage } = useMutation({
    mutationFn: async () => {
      await axiosIntense.delete(`/group/remove-group-image/${data?.data?._id}`);
      return;
    },
    onSuccess: () => {
      mutate();
      toast("Image added succesfully");
    },
  });

  const { mutate: removeUser, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      await axiosIntense.delete(`/group/${data?.data?._id}?userId=${userId}`);
      return;
    },
    onSuccess: () => {
      mutate();
      toggleDeleteModal();
      toast("Member deleted succesfully");
    },
  });

  useEffect(() => {
    mutate();
    getUsers();
  }, [id, selectedDate, getUsers]);

  const availableMembers =
    (users &&
      users.filter(
        (user) => user.role !== "ADMIN" && !members.includes(user._id)
      )) ||
    [];

  if (isPending) {
    return <GroupSkeleton />;
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl md:max-w-6xl px-4 py-4 sm:py-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="w-full group relative lg:w-[300px]">
            <img
              src={
                data?.data?.imageUrl
                  ? `${BASE_URL}${data?.data?.imageUrl}`
                  : "/no-image.png?height=100&width=100"
              }
              alt={data?.data?.title || "Placeholder"}
              className="w-full aspect-[4/3] rounded-xl object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {data?.data?.imageUrl ? (
                <button onClick={removeImage}>
                  <Trash size={30} className="text-white cursor-pointer" />
                </button>
              ) : (
                <button onClick={() => inputRef.current.click()}>
                  <ImagePlus size={30} className="text-white cursor-pointer" />
                </button>
              )}
              <Input
                ref={inputRef}
                type="file"
                accept="image/*"
                id="image"
                onChange={addImage}
                className="hidden"
              />
            </div>
          </div>
          <div className="flex-1 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold sm:text-3xl">
                {data?.data?.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {data?.data?.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{data?.data?.level}</Badge>
              <Badge variant="secondary">
                {data?.data?.achievement.split("_").join(" ")}
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm">{data?.data?.description}</p>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="mt-12 sm:mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center sm:gap-6 mb-6">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              Members
            </motion.h2>
            <div className="flex flex-wrap gap-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[200px] pl-3 text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button
                  onClick={toggleModal}
                  variant="default"
                  size="sm"
                  className="group"
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                  Add Member
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
            <GroupCard
              data={
                data && { groupId: data?.data?._id, members: data.data.members }
              }
              date={data && data.data.attendance.date}
              loading={loading}
              handleCheck={handleCheck}
              toggleDeleteModal={toggleDeleteModal}
            />
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={toggleModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Select members to add to the group. You can add multiple members
              at once.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <MultiSelect
              onValueChange={setMembers}
              users={users}
              defaultValue={data && data.data.members.map((user) => user._id)}
              options={availableMembers}
              placeholder="Search and select members..."
              animation={0.3}
            />
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
              onClick={addMember}
              disabled={isAddingMembers}
              type="submit"
              className="w-full sm:w-auto"
            >
              {isAddingMembers ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={isDeleteOpen}
        isPending={isLoading}
        onOpenChange={toggleDeleteModal}
        onConfirm={removeUser}
      />
    </>
  );
};

export default Group;
