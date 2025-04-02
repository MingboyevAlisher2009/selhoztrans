import { useEffect, useMemo, useCallback, useState } from "react";
import { Group, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import DeleteModal from "@/components/delete-modal";
import HomeCardSkeleton from "@/components/skeletons/home-card";

import CourseCard from "./components/card";
import Modal from "./components/modal";
import UpdateModal from "./components/update-modal";
import StudentPage from "./components/student-page";

import axiosIntense from "@/http/axios";
import useUsers from "@/store/use-users";
import useAuth from "@/store/use-auth";

const INITIAL_FORM_STATE = {
  title: "",
  image: null,
  members: [],
  level: "",
  description: "",
  achievement: "",
};

export default function Home() {
  const [modals, setModals] = useState({
    create: false,
    delete: false,
    edit: false,
  });
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [previewUrl, setPreviewUrl] = useState("");
  const [courses, setCourses] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getUsers, users } = useUsers();
  const { userInfo } = useAuth();

  const toggleModal = useCallback((modalType) => {
    setModals((prev) => ({
      ...prev,
      [modalType]: !prev[modalType],
    }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { id, value, files } = e.target;

    if (id === "image" && files?.[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  }, []);

  const handleSelectChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isFormValid = useMemo(() => {
    const { title, level, achievement, description, members } = formData;
    return Boolean(
      title && level && description && members.length > 0 && achievement
    );
  }, [formData]);

  const { mutate: fetchGroups, isPending } = useMutation({
    mutationFn: async () => {
      const response = await axiosIntense.get("/group/get-groups");
      return response.data;
    },
    onSuccess: (data) => {
      setCourses(data.data || []);
    },
    onError: (error) => {
      console.error("Failed to fetch groups:", error);
    },
  });

  const { mutate: addGroup, isPending: isCreating } = useMutation({
    mutationFn: async (data) => {
      await axiosIntense.post("/group", data);
    },
    onSuccess: () => {
      fetchGroups();
      toggleModal("create");
      setFormData(INITIAL_FORM_STATE);
      setPreviewUrl("");
      toast.success("Guruh muvaffaqiyatli yaratildi");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Guruh yaratib bo‘lmadi");
    },
  });

  const { mutate: deleteGroup, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosIntense.delete(`/group/${groupId}`);
      return data;
    },
    onSuccess: () => {
      fetchGroups();
      toggleModal("delete");
      toast.success("Guruh muvaffaqiyatli oʻchirildi");
    },
    onError: (error) => {
      toast.error("Guruhni o‘chirib bo‘lmadi");
    },
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        let imageUrl;

        if (formData.image && formData.image instanceof File) {
          const imageData = new FormData();
          imageData.append("group-image", formData.image);
          const { data } = await axiosIntense.post(
            "/group/group-image",
            imageData
          );
          imageUrl = data.data.imageUrl;
        }

        addGroup({ ...formData, imageUrl });
      } catch (error) {
        toast.error("Failed to upload image");
      }
    },
    [formData, addGroup]
  );

  const handleEdit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        await axiosIntense.put(`/group/${groupId}`, formData);
        fetchGroups();
        toggleModal("edit");
        setFormData(INITIAL_FORM_STATE);
        toast.success("Guruh muvaffaqiyatli yangilandi");
      } catch (error) {
        toast.error("Nimadir noto'g'ri ketdi");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, addGroup]
  );

  const handleEditCourse = useCallback(
    (course) => {
      setGroupId(course._id);
      toggleModal("edit");
      setFormData({
        title: course.title,
        image: course.image,
        achievement: course.achievement,
        description: course.description,
        level: course.level,
        members: course.members,
      });
    },
    [toggleModal]
  );

  const handleDeleteCourse = useCallback(
    (courseId) => {
      setGroupId(courseId);
      toggleModal("delete");
    },
    [toggleModal]
  );

  const availableMembers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) => user.role !== "ADMIN" && !formData.members.includes(user._id)
    );
  }, [users, formData.members]);

  useEffect(() => {
    if (userInfo && userInfo.role === "STUDENT") return;
    fetchGroups();
    getUsers();
  }, [fetchGroups, getUsers, userInfo]);

  if (userInfo && userInfo.role === "STUDENT") {
    return <StudentPage />;
  }

  return (
    <div>
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Group className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Gruhlar</h1>
          </div>
          <Button
            onClick={() => toggleModal("create")}
            size="sm"
            className="gap-2 transition-all hover:gap-3"
          >
            <Plus className="w-4 h-4" />
            Yangi Guruh
          </Button>
        </div>

        {/* Course list */}
        <div className="flex flex-wrap gap-5">
          {isPending ? (
            Array.from({ length: 6 }).map((_, i) => (
              <HomeCardSkeleton key={i} />
            ))
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard
                key={course._id}
                {...course}
                onEdit={() => handleEditCourse(course)}
                onDelete={() => handleDeleteCourse(course._id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Guruhlar topilmadi. Yangi guruh yarating!
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        formData={formData}
        isOpen={modals.create}
        toggleModal={() => toggleModal("create")}
        handleInputChange={handleInputChange}
        handleMemberChange={(values) => handleSelectChange("members", values)}
        handleSubmit={handleSubmit}
        users={users}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        availableMembers={availableMembers}
        handleSelectChange={handleSelectChange}
        disabled={!isFormValid || isCreating}
        isSubmitting={isCreating}
      />

      {/* Update Modal */}
      <UpdateModal
        open={modals.edit}
        onOpenChange={() => toggleModal("edit")}
        formData={formData}
        handleInputChange={handleInputChange}
        handleMemberChange={(values) => handleSelectChange("members", values)}
        handleSubmit={handleEdit}
        users={users}
        availableMembers={availableMembers}
        handleSelectChange={handleSelectChange}
        disabled={!isFormValid || isLoading}
        isSubmitting={isLoading}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={modals.delete}
        onOpenChange={() => toggleModal("delete")}
        onConfirm={deleteGroup}
        isPending={isDeleting}
      />
    </div>
  );
}
