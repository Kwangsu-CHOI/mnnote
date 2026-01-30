"use client";

import { useState } from "react";
import { Users, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { addCollaborator, removeCollaborator, getCollaborators } from "@/actions/share";
import { useEffect } from "react";

interface ShareModalProps {
  documentId: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export const ShareModal = ({
  documentId,
  isOwner,
  isOpen,
  onClose,
}: ShareModalProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, documentId]);

  const loadCollaborators = async () => {
    try {
      const collabs = await getCollaborators(documentId);
      setCollaborators(collabs as Collaborator[]);
    } catch (error) {
      console.error("Failed to load collaborators:", error);
    }
  };

  const handleInvite = async () => {
    if (!email || !isOwner) return;

    setIsLoading(true);
    try {
      await addCollaborator(documentId, email);
      toast.success("Collaborator added successfully!");
      setEmail("");
      await loadCollaborators();
    } catch (error: any) {
      toast.error(error.message || "Failed to add collaborator");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!isOwner) return;

    try {
      await removeCollaborator(documentId, collaboratorId);
      toast.success("Collaborator removed");
      await loadCollaborators();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove collaborator");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share Document
          </DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Invite people to collaborate on this document"
              : "View collaborators on this document"}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleInvite} disabled={isLoading || !email}>
                {isLoading ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">
            Collaborators ({collaborators.length})
          </p>
          {collaborators.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No collaborators yet
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback>
                        {collaborator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.email}
                      </p>
                    </div>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(collaborator.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
