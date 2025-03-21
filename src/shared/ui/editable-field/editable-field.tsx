import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input/input";
import { Textarea } from "../textarea/ui/textarea";
import { cn } from "../../lib/utils";

interface EditableFieldProps {
  label: string;
  value?: string | null;
  placeholder?: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  className?: string;
}

export const EditableField = ({
  label,
  value,
  placeholder = "Not set",
  onSave,
  multiline = false,
  className,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value || "");

  const handleSave = () => {
    onSave(fieldValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFieldValue(value || "");
    setIsEditing(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2">
          {multiline ? (
            <Textarea
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder={placeholder}
              className="min-h-[100px] resize-none"
            />
          ) : (
            <Input
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder={placeholder}
            />
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-white/10 bg-background p-3 relative group">
          {value ? (
            <div className="whitespace-pre-wrap">{value}</div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit {label}</span>
          </Button>
        </div>
      )}
    </div>
  );
}; 