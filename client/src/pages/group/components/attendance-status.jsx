import { cn } from "@/lib/utils";
import { Check, Clock, X } from "lucide-react";

const AttendanceStatus = ({ status }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-colors duration-300",
        status === "attending" && "bg-green-500/15 text-green-500",
        status === "not-attending" && "bg-red-500/15 text-red-500",
        status === "pending" && "bg-yellow-500/15 text-yellow-500"
      )}
    >
      {status === "attending" && (
        <>
          <Check className="w-3 h-3" />
          <span>Attending</span>
        </>
      )}
      {status === "not-attending" && (
        <>
          <X className="w-3 h-3" />
          <span>Not Attending</span>
        </>
      )}
      {status === "pending" && (
        <>
          <Clock className="w-3 h-3" />
          <span>Pending</span>
        </>
      )}
    </div>
  );
};

export default AttendanceStatus;
