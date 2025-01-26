import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import AttendanceStatus from "./attendance-status";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader, Trash, User } from "lucide-react";
import { BASE_URL } from "@/http/api";
import { isBefore, startOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const GroupCard = ({ toggleDeleteModal, data, date, handleCheck, loading }) => {
  const today = startOfDay(new Date());

  const disabled = isBefore(date, today);

  const handleAttendence = (id, attendance, attendanceId) => {
    const status = attendance === true ? "attending" : "not-attending";
    const updateStatus = attendanceId
      ? { groupId: data.groupId, userId: id, status, attendanceId }
      : {
          groupId: data.groupId,
          members: data.members.map((item) => {
            return item._id === id
              ? {
                  user: item._id,
                  isAttending: (item.attendance.status = status),
                }
              : { user: item._id, isAttending: "not-attending" };
          }),
        };
    console.log(updateStatus);

    handleCheck(updateStatus);
  };

  return (
    <AnimatePresence>
      {data &&
        data.members.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="relative group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              {loading && (
                <Skeleton className="absolute inset-0 flex w-full h-full justify-center items-center opacity-70 z-50">
                  <Loader className="animate-spin text-2xl" />
                </Skeleton>
              )}
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  {item.imageUrl ? (
                    <div className="w-full flex justify-center items-center h-56">
                      <img
                        className="w-44 h-44 object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                        src={`${BASE_URL}${item.imageUrl}`}
                        alt={`Member ${i + 1}`}
                      />
                    </div>
                  ) : (
                    <div className="w-full flex justify-center items-center h-56">
                      <User
                        size={150}
                        className="shadow border rounded-full p-3"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-xl font-bold mb-2 line-clamp-1">
                      {item.username}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {item.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="rounded-md px-3 py-1 capitalize"
                    >
                      {item.role}
                    </Badge>
                    <AttendanceStatus status={item.attendance.status} />
                  </div>
                </div>
              </CardContent>
              <Separator className="bg-border/50" />
              <CardFooter className="p-6">
                <div className="flex-1 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Attending</span>
                    <Switch
                      disabled={disabled}
                      checked={item.attendance.status === "attending"}
                      onCheckedChange={(e) =>
                        handleAttendence(item._id, e, item.attendance.recordId)
                      }
                    />
                  </div>
                  <Button
                    onClick={() => toggleDeleteModal(item._id)}
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-300"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
    </AnimatePresence>
  );
};

export default GroupCard;
