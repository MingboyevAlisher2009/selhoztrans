"use client";

import { useEffect, useMemo } from "react";
import { Group, Loader, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseCard from "./components/card";
import Modal from "./components/modal";
import DeleteModal from "@/components/delete-modal";
import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosIntense from "@/http/axios";
import HomeCardSkeleton from "@/components/skeletons/home-card";
import useUsers from "@/store/use-users";
import { toast } from "sonner";
import useAuth from "@/store/use-auth";
import StudentPage from "./components/student-page";

const initialFormState = {
  title: "",
  image: null,
  members: [],
  level: "",
  description: "",
  achievement: "",
};

export default function Home() {
  const [modals, setModals] = useState({ create: false, delete: false });
  const [formData, setFormData] = useState(initialFormState);
  const [previewUrl, setPreviewUrl] = useState("");
  const [courses, setCourses] = useState([]);
  const { getUsers, users } = useUsers();
  const { userInfo } = useAuth();
  const [groupId, setGroupId] = useState(null);

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
    if (field === "members") {
      setFormData((prev) => ({ ...prev, members: value }));
    } else if (field === "level") {
      setFormData((prev) => ({ ...prev, level: value }));
    } else if (field === "achievement") {
      setFormData((prev) => ({ ...prev, achievement: value }));
    }
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
      console.log(error);
    },
  });

  useEffect(() => {
    if (userInfo && userInfo.role === "STUDENT") return;
    fetchGroups();
    getUsers();
  }, [fetchGroups, getUsers]);

  const { mutate: addGroup, isPending: isCreating } = useMutation({
    mutationFn: async (data) => {
      await axiosIntense.post("/group", data);
    },
    onSuccess: () => {
      fetchGroups();
      toggleModal("create");
      setFormData(initialFormState);
      setPreviewUrl(null);
      toast.success("Group created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create group");
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
      toast.success("Group deleted successfully");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl;
      console.log(formData.image);
      if (formData.image) {
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
  };

  if (userInfo && userInfo.role === "STUDENT") {
    return <StudentPage />;
  }

  const availableMembers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) => user.role !== "ADMIN" && !formData.members.includes(user._id)
    );
  }, [users, formData.members]);

  return (
    <div>
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Group className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          </div>
          <Button
            onClick={() => toggleModal("create")}
            size="sm"
            className="gap-2 transition-all hover:gap-3"
          >
            <Plus className="w-4 h-4" />
            New Group
          </Button>
        </div>

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
                onDelete={() => {
                  setGroupId(course._id);
                  toggleModal("delete");
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No groups found. Create your first group to get started!
            </div>
          )}
        </div>
      </div>

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

      <DeleteModal
        isOpen={modals.delete}
        onOpenChange={() => toggleModal("delete")}
        onConfirm={deleteGroup}
        isPending={isDeleting}
      />
    </div>
  );
}
