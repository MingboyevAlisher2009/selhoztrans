import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  File,
  ImageOff,
  ImagePlus,
  LinkIcon,
  Plus,
  Trash,
} from "lucide-react";
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
import { Link, useParams } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GroupTable } from "./components/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Group = () => {
  const [isStudentsOpen, setisStudentsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(Date.now);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddTopic, setisAddTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [topics, setTopics] = useState([]);
  const { users, getUsers } = useUsers();
  const inputRef = useRef();
  const { id } = useParams();

  const toggleModal = () => setIsOpen(!isOpen);
  const toggleStudents = () => setisStudentsOpen(!isStudentsOpen);
  const toggleAddModal = () => setisAddTopic(!isAddTopic);
  const toggleDeleteModal = (id) => {
    setUserId(id);
    setIsDeleteOpen(!isDeleteOpen);
  };

  const formSchema = z.object({
    title: z.string().min(2).max(50),
    description: z.string().min(5),
    link: z.string().url().optional(),
    file: z.any(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      file: "",
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

  const { mutate: getTopics } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosIntense.get(`/group/topics/${id}`);
      return data;
    },
    onSuccess: (data) => {
      setTopics(data.data);
    },
  });

  useEffect(() => {
    mutate();
    getUsers();
    getTopics();
  }, [id, selectedDate, getUsers, getTopics]);

  const availableMembers =
    (users &&
      users.filter(
        (user) => user.role !== "ADMIN" && !members.includes(user._id)
      )) ||
    [];

  const onSubmit = async (values) => {
    try {
      let file;

      if (values.file) {
        const formData = new FormData();
        formData.append("group-image", values.file);
        const { data } = await axiosIntense.post(
          "/group/group-image",
          formData
        );
        file = data.data.imageUrl;
      }

      const { data } = await axiosIntense.post("/group/topic", {
        ...values,
        groupId: id,
        file,
      });
      toggleAddModal();
      getTopics();
      toast("Topic added succesfullt");
    } catch (error) {
      console.log(error);
    }
  };

  if (isPending) {
    return <GroupSkeleton />;
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl md:max-w-6xl px-4 py-4 sm:py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="w-full group relative lg:w-[300px]">
            {data?.data?.imageUrl ? (
              <img
                src={
                  data?.data?.imageUrl
                    ? `${BASE_URL}${data?.data?.imageUrl}`
                    : "/no-image.png?height=100&width=100"
                }
                alt={data?.data?.title || "Placeholder"}
                className="w-full aspect-[4/3] rounded-xl object-cover"
              />
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <ImageOff size={50} />
              </div>
            )}
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
            <div className="flex flex-wrap gap-2 capitalize">
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

        <div className="mt-12 sm:mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center sm:gap-6 mb-6">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              Topics
            </motion.h2>
            <div className="flex flex-wrap gap-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button
                  onClick={toggleAddModal}
                  variant="default"
                  size="sm"
                  className="group"
                >
                  <Plus className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:rotate-90" />
                  Add Topic
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button
                  onClick={toggleStudents}
                  variant="default"
                  size="sm"
                  className="group"
                >
                  Students
                </Button>
              </motion.div>
            </div>
          </div>
          <div className="space-y-5">
            {topics &&
              topics.map((item, i) => (
                <Card className="p-5 border shadow-md rounded-2xl transition-all hover:shadow-lg">
                  <CardHeader className="mb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardDescription className="text-gray-700 dark:text-gray-400 mb-6 leading-relaxed">
                    {item.description}
                  </CardDescription>
                  <Separator className="my-4" />
                  <CardFooter className="flex items-center justify-between gap-4">
                    {item.file && (
                      <a
                        href={item.file}
                        download
                        className="flex items-center line-clamp-1 gap-2 p-3 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <File />
                        <span className="text-sm font-medium truncate">
                          {item.file.split("/").pop()}
                        </span>
                      </a>
                    )}
                    {item.link && (
                      <Link
                        to={item.link}
                        target="_blank"
                        className="px-4 py-2 text-sm font-medium flex gap-3 rounded-lg shadow-md "
                      >
                        <LinkIcon />
                        Open Link
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </div>

      <Sheet open={isStudentsOpen} onOpenChange={toggleStudents}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-5xl overflow-y-auto"
        >
          <SheetHeader className={"flex gap-5 flex-wrap justify-between"}>
            <SheetTitle>Students</SheetTitle>
            <div className="flex flex-wrap items-center justify-between">
              <Input
                placeholder="Search..."
                className="w-52"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex flex-wrap gap-5">
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
          </SheetHeader>
          <div className="p-6">
            <GroupTable
              data={
                data && { groupId: data?.data?._id, members: data.data.members }
              }
              date={data && data.data.attendance.date}
              searchQuery={searchQuery}
              loading={loading}
              handleCheck={handleCheck}
              toggleDeleteModal={toggleDeleteModal}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isAddTopic} onOpenChange={toggleAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Topic</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <Label>File</Label>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) =>
                          form.setValue("file", e.target.files[0])
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <Label>Title</Label>
                    <FormControl>
                      <Input placeholder="Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label>Description</Label>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <Label>Link</Label>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
