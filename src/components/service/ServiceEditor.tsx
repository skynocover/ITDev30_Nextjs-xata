"use client";
import React, { useState } from "react";
import axios from "axios";
import { Plus, Trash2, Save, X } from "lucide-react";

import { ILinkItem } from "../layout/Title";
import { ServicesRecord } from "@/xata";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LoadingOverlay from "../commons/LoadingOverlay";

interface ServiceEditorProps {
  service: ServicesRecord;
  serviceId: string;
}

const ServiceEditor: React.FC<ServiceEditorProps> = ({
  service,
  serviceId,
}) => {
  const router = useRouter();
  const [editedService, setEditedService] = useState<ServicesRecord>(service);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedService({ ...editedService, [name]: value });
  };

  const handleLinkChange = (links: ILinkItem[], key: keyof ServicesRecord) => {
    setEditedService({ ...editedService, [key]: links });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const serviceToSave: ServicesRecord = {
        ...editedService,
      };
      await axios.put(`/api/service/${serviceId}`, serviceToSave);
      router.refresh();
    } catch (error) {
      console.error("Error saving service:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/service/${service.id}`);
      router.push("/services");
    } catch (error) {
      console.error("Error deleting service:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoadingOverlay isLoading={isLoading}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Input
              name="name"
              value={editedService.name || ""}
              onChange={handleInputChange}
              placeholder="Service Name"
              className="text-2xl font-bold"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            name="description"
            value={editedService.description || ""}
            onChange={handleInputChange}
            placeholder="Description"
            className="min-h-[100px]"
          />

          <Tabs defaultValue="topLinks" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="topLinks">Top Links</TabsTrigger>
              <TabsTrigger value="headLinks">Head Links</TabsTrigger>
            </TabsList>

            <TabsContent value="topLinks">
              <Card>
                <CardContent className="pt-6">
                  <LinkEditor
                    links={editedService.topLinks || []}
                    onLinksChange={(links) =>
                      handleLinkChange(links, "topLinks")
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headLinks">
              <Card>
                <CardContent className="pt-6">
                  <LinkEditor
                    links={editedService.headLinks || []}
                    onLinksChange={(links) =>
                      handleLinkChange(links, "headLinks")
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this service?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the service and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSave} size="icon">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </LoadingOverlay>
  );
};

interface LinkEditorProps {
  links: ILinkItem[];
  onLinksChange: (links: ILinkItem[]) => void;
}

const LinkEditor: React.FC<LinkEditorProps> = ({ links, onLinksChange }) => {
  const [localLinks, setLocalLinks] = useState<ILinkItem[]>(links);

  const handleLinkChange = (
    index: number,
    field: keyof ILinkItem,
    value: string
  ) => {
    const newLinks = [...localLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLocalLinks(newLinks);
    onLinksChange(newLinks);
  };

  const handleAddLink = () => {
    const newLinks = [...localLinks, { name: "", url: "" }];
    setLocalLinks(newLinks);
    onLinksChange(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = localLinks.filter((_, i) => i !== index);
    setLocalLinks(newLinks);
    onLinksChange(newLinks);
  };

  return (
    <div className="space-y-4">
      {localLinks.map((link, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input
            value={link.name}
            onChange={(e) => handleLinkChange(index, "name", e.target.value)}
            placeholder="Link Name"
            className="flex-1"
          />
          <Input
            value={link.url}
            onChange={(e) => handleLinkChange(index, "url", e.target.value)}
            placeholder="Link URL"
            className="flex-1"
          />
          <Button
            onClick={() => handleRemoveLink(index)}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={handleAddLink} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Link
      </Button>
    </div>
  );
};

export default ServiceEditor;
