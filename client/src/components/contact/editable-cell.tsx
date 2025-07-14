// 🔒 DO NOT REMOVE - In-place editing for Contacts
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Contact } from "@shared/schema";
import { Check, X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditableCellProps {
  contact: Contact;
  field: keyof Contact;
  value: string | null;
  type?: "text" | "email" | "url";
  className?: string;
}

export function EditableCell({ contact, field, value, type = "text", className = "" }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const validateValue = (val: string): boolean => {
    if (!val.trim()) return true; // Allow empty values
    
    switch (type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      case "url":
        try {
          new URL(val.startsWith('http') ? val : `https://${val}`);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  };

  const handleSave = async () => {
    if (!validateValue(editValue)) {
      toast({
        title: "Invalid format",
        description: `Please enter a valid ${type}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          field: field,
          value: editValue.trim() || null
        }),
      });

      // Invalidate the contacts query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      
      toast({
        title: "Contact updated",
        description: `${field} has been updated successfully`,
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-[150px]">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
          disabled={isLoading}
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group cursor-pointer hover:bg-gray-50 rounded px-2 py-1 flex items-center justify-between ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <span className="flex-1">
        {value || "-"}
      </span>
      <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity ml-2 flex-shrink-0" />
    </div>
  );
}