"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BASE_URL } from "@/http/api";
import { isBefore, startOfDay } from "date-fns";
import { MoreHorizontal, Trash, User } from "lucide-react";
import AttendanceStatus from "./attendance-status";
import { motion, AnimatePresence } from "framer-motion";

export function GroupTable({
  toggleDeleteModal,
  data,
  date,
  handleCheck,
  loading,
  searchQuery,
}) {
  const today = startOfDay(new Date());
  const disabled = isBefore(date, today);

  const handleAttendence = (id, attendance, attendanceId) => {
    const status = attendance ? "attending" : "not-attending";
    const updateStatus = attendanceId
      ? { groupId: data.groupId, userId: id, status, attendanceId }
      : {
          groupId: data.groupId,
          members: data.members.map((item) => ({
            user: item._id,
            isAttending:
              item._id === id
                ? status
                : data.isAttending
                ? data.isAttending
                : "not-attending",
          })),
        };
    handleCheck(updateStatus);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Student</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {!data?.members || data.members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              data?.members
                ?.filter(
                  (member) =>
                    member?.username
                      ?.toLowerCase()
                      .includes(searchQuery?.toLowerCase() || "") ||
                    member?.email
                      ?.toLowerCase()
                      .includes(searchQuery?.toLowerCase() || "")
                )
                .map((member, i) => (
                  <motion.tr
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className={`
                    ${loading ? "opacity-50" : ""}
                    group hover:bg-muted/50 transition-colors
                  `}
                  >
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        {member.imageUrl ? (
                          <AvatarImage
                            src={`${BASE_URL}${member.imageUrl}`}
                            alt={member.username}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.username}</span>
                        <span className="text-sm text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AttendanceStatus status={member.attendance.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          disabled={disabled || loading}
                          checked={member.attendance.status === "attending"}
                          onCheckedChange={(e) =>
                            handleAttendence(
                              member._id,
                              e,
                              member.attendance.recordId
                            )
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          {member.attendance.status === "attending"
                            ? "Present"
                            : "Absent"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toggleDeleteModal(member._id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
