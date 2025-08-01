import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarIcon,
  Edit2,
  File,
  ImageOff,
  ImagePlus,
  LinkIcon,
  Loader2,
  MoreVertical,
  Plus,
  Trash,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
import { Link, useNavigate, useParams } from "react-router-dom";
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
import useAuth from "@/store/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QRCodeCanvas } from "qrcode.react";

const initialValue = {
  category: "",
  startDate: "",
  endDate: "",
  hours: "",
  registerNumber: "",
};

const Group = () => {
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isUpdadeModalOpen, setIsUpdadeModalOpen] = useState(false);
  const [isStudentsOpen, setisStudentsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(Date.now);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [student, setStudent] = useState(initialValue);
  const [certificate, setCertificate] = useState(null);
  const [isAddTopic, setisAddTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTopic, setIsTopic] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [topicId, setTopicId] = useState();
  const [topics, setTopics] = useState([]);
  const canvasRef = useRef();

  const { users, getUsers } = useUsers();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const inputRef = useRef();

  const toggleStudents = () => setisStudentsOpen(!isStudentsOpen);
  const toggleAddModal = () => setisAddTopic(!isAddTopic);
  const toggleTopicModal = () => setIsTopic(!isTopic);
  const toggleModal = () => setIsOpen(!isOpen);
  const toggleCertificateModal = (id) => {
    setUserId(id);
    setIsCertificateOpen(!isDeleteOpen);
  };
  const toggleDeleteModal = (id) => {
    setUserId(id);
    setIsDeleteOpen(!isDeleteOpen);
  };

  const formSchema = z.object({
    title: z.string().min(2).max(50),
    description: z.string().min(5),
    link: z.string().optional(),
    file: z.any().optional(),
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

  const { mutate: deleteTopic, isPending: isDeleteTopic } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosIntense.delete(`/group/topic/${topicId}`);
      return data;
    },
    onSuccess: () => {
      getTopics();
      toggleTopicModal();
      toast("Topic deleted succesfully");
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

      await axiosIntense.post("/group/topic", {
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

  const handleEdit = async (values) => {
    try {
      await axiosIntense.put(`/group/topic/${topicId}`, values);
      setIsUpdadeModalOpen(false);
      getTopics();
      toast("Topic added succesfullt");
      form.reset();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateCertificate = async () => {
    setCertificateLoading(true);
    try {
      const { data } = await axiosIntense.post("/certificate", {
        ...student,
        studentId: userId,
      });
      setCertificate(data.data.certificate);
      setStudent(initialValue)
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Nimadir hato keti. Iltimos boshidan urunib ko'ring."
      );
      console.log(error);
    } finally {
      setCertificateLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.removeProperty("pointer-events");
    };
  }, [isUpdadeModalOpen, setIsUpdadeModalOpen]);

  if (isPending) {
    return <GroupSkeleton />;
  }

  const downloadQRCode = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "certificate-qr.png";
    link.click();
  };

  return (
    <>
      {userInfo && userInfo.role === "STUDENT" && (
        <div onClick={() => navigate("/")} className="mt-5 ml-3 cursor-pointer">
          <ArrowLeft />
        </div>
      )}
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
              Mavzular
            </motion.h2>
            {(userInfo && userInfo.role === "ADMIN") ||
              (userInfo && userInfo.role === "SUPER_ADMIN" && (
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
                      Mavzu qo'shish
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
                      O'quvchilar
                    </Button>
                  </motion.div>
                </div>
              ))}
          </div>
          <AnimatePresence>
            {topics &&
              topics.map((topic, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  key={i}
                  className="group"
                >
                  <Card className="relative overflow-hidden border-muted/30 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
                    <div className="absolute right-2 top-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-yellow-500 focus:text-yellow-600"
                            onClick={() => {
                              setTopicId(topic._id);
                              setIsUpdadeModalOpen(true);

                              form.setValue("title", topic.title);
                              form.setValue("description", topic.description);
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Mavzuni tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setTopicId(topic._id);
                              toggleTopicModal();
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Mavzuni o'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-xl font-semibold line-clamp-1">
                        {topic.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                        {topic.description}
                      </p>
                    </CardContent>

                    {(topic.file || topic.link) && (
                      <>
                        <Separator className="my-4" />
                        <CardFooter className="flex items-center gap-3">
                          {topic.file && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              asChild
                            >
                              <a
                                href={topic.file}
                                download
                                className="flex items-center gap-2"
                              >
                                <File className="h-4 w-4" />
                                <span className="line-clamp-1">
                                  {topic.file.split("/").pop()}
                                </span>
                              </a>
                            </Button>
                          )}
                          {topic.link && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              asChild
                            >
                              <Link
                                to={topic.link}
                                target="_blank"
                                className="flex items-center gap-2"
                              >
                                <LinkIcon className="h-4 w-4" />
                                Open Link
                              </Link>
                            </Button>
                          )}
                        </CardFooter>
                      </>
                    )}
                  </Card>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      <Sheet open={isStudentsOpen} onOpenChange={toggleStudents}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-5xl overflow-y-auto"
        >
          <SheetHeader className={"flex gap-5 flex-wrap justify-between"}>
            <SheetTitle>O'quvchilar</SheetTitle>
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
                          <span>Sana tanlang</span>
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
                    A'zo qushish
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
              toggleCertificateModal={toggleCertificateModal}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isCertificateOpen} onOpenChange={setIsCertificateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sertifikat Malumotlari</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Category */}
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-sm font-medium col-span-1">Category</label>
              <Input
                type="text"
                value={student.category}
                onChange={(e) =>
                  setStudent({ ...student, category: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-sm font-medium col-span-1">
                Boshlangan sana
              </label>
              <Input
                type="date"
                value={student.startDate}
                onChange={(e) =>
                  setStudent({ ...student, startDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* End Date */}
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-sm font-medium col-span-1">
                Tugagan sana
              </label>
              <Input
                type="date"
                value={student.endDate}
                onChange={(e) =>
                  setStudent({ ...student, endDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* Hours */}
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-sm font-medium col-span-1">Soatlar</label>
              <Input
                type="number"
                value={student.hours}
                onChange={(e) =>
                  setStudent({ ...student, hours: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* Register Number */}
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-sm font-medium col-span-1">Reg. No.</label>
              <Input
                type="text"
                value={student.registerNumber}
                onChange={(e) =>
                  setStudent({ ...student, registerNumber: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="mx-auto">
            {certificate && (
              <>
                <div ref={canvasRef}>
                  <QRCodeCanvas
                    value={`${BASE_URL}certificate/${certificate._id}`}
                    size={250}
                    bgColor="#18181b"
                    fgColor="white"
                    includeMargin={true}
                  />
                </div>
                <div className="space-x-2 flex items-center">
                  <Button
                    className="mt-2 mx-auto"
                    variant="outline"
                    onClick={downloadQRCode}
                  >
                    Download QR Code
                  </Button>
                  <Link
                    className="text-blue-500 underline"
                    target="_blank"
                    to={`${BASE_URL}certificate/${certificate._id}`}
                  >
                    Link
                  </Link>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleCreateCertificate}
              disabled={certificateLoading}
            >
              {certificateLoading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsCertificateOpen(false)}
            >
              Yopish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUpdadeModalOpen}
        onOpenChange={() => {
          setIsUpdadeModalOpen(false);
          form.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Topic</DialogTitle>
          </DialogHeader>
          {/* todo: fix later */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEdit)}
              className="space-y-8"
            >
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
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              A'zo qo'shish
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Guruhga qo'shish uchun a'zolarni tanlang. Siz bir nechta a'zolarni
              qo'shishingiz mumkin birdaniga.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4">
              <MultiSelect
                onValueChange={setMembers}
                users={users}
                defaultValue={
                  data && data.data.members?.map((user) => user._id)
                }
                options={availableMembers}
                placeholder="Search and select members..."
                animation={0.3}
                modalPopover
              />
              {members.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {members.length} a'zolar{members.length !== 1 ? "s" : ""}{" "}
                  tanlangan
                </p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={toggleModal}
              className="w-full sm:w-auto"
              disabled={isAddingMembers}
            >
              Yopish
            </Button>
            <Button
              onClick={addMember}
              disabled={isAddingMembers || members.length === 0}
              className="w-full sm:w-auto"
            >
              {isAddingMembers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  Qo'shish{" "}
                  {members.length > 0 ? `(${members.length})` : "A'zolar"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={isTopic}
        isPending={isDeleteTopic}
        onOpenChange={toggleTopicModal}
        onConfirm={deleteTopic}
      />

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
