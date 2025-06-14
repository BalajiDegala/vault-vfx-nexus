
import { format } from "date-fns";

export const getInitials = (name: string): string => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const formatMessageTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      // console.warn("Invalid date for formatMessageTime:", timestamp);
      return "Invalid date";
    }
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday ' + format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  } catch (error) {
    // console.error("Error formatting message time:", error, "timestamp:", timestamp);
    return "Error in date";
  }
};
