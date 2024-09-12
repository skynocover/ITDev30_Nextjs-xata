## 幫你的討論版增加更多身份驗證

今天這個討論版除了可以當討論版以外
還可以當作個人部落格來使用
只需要加上permission 讓特定用戶可以發文就好
我們來實作看看吧

## 安裝套件

先安裝今天會用到的套件
```
pnpm dlx shadcn@latest add switch label
```


## DB Schema

先修改DB的schema
```json
    {
      "name": "services",
      "columns": [
        { "name": "name", "type": "string" },
        {
          "name": "topLinks",
          "type": "json",
          "notNull": true,
          "defaultValue": "[]"
        },
        {
          "name": "headLinks",
          "type": "json",
          "notNull": true,
          "defaultValue": "[]"
        },
        { "name": "description", "type": "text" },
        {
          "name": "permissions",
          "type": "json",
          "notNull": true,
          "defaultValue": "{}"
        }
      ]
    }
```

然後同樣使用
```
pnpm xata:upload
pnpm xata:gen
```
來同步Xata以及本地端的client

## Service Action

然後我們在`src/app/actions/service.ts`內 新增以下檔案

```ts
"use server";

import { XataClient, ServicesRecord } from "@/xata";
import { auth } from "@/auth";

export async function updateService(serviceId: string, data: ServicesRecord) {
  try {
    const session = await auth();
    if (!session || session.user?.id !== "admin") {
      throw new Error("You don't have permission");
    }

    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });
    const service = await xata.db.services.getFirst();

    if (!service) {
      throw new Error("Service not found");
    }
    if (!session || session.user?.id !== "admin") {
      throw new Error("You don't have permission");
    }

    await xata.db.services.update(service.id, {
      name: data.name?.trim(),
      description: data.description,
      topLinks: data.topLinks || [],
      headLinks: data.headLinks || [],
      permissions: data.permissions || {},
    });

    return { message: "Service updated successfully" };
  } catch (error: any) {
    console.error("Service update error:", error);
    throw new Error("Service update failed: " + error.message);
  }
}
```

然後修改你的`src/components/service/ServiceEditor.tsx`


```tsx
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateService } from "@/app/actions/service";

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

  const handlePermissionChange = (permission: string, value: boolean) => {
    setEditedService({
      ...editedService,
      permissions: { ...editedService.permissions, [permission]: value },
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateService(serviceId, editedService);
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="topLinks">Top Links</TabsTrigger>
              <TabsTrigger value="headLinks">Head Links</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
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

            <TabsContent value="permissions">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="adminOnlyThread">
                        Only admin can create new threads
                      </Label>
                      <Switch
                        id="adminOnlyThread"
                        checked={
                          editedService.permissions.adminOnlyThread || false
                        }
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            "adminOnlyThread",
                            checked as boolean
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="adminOnlyReply">
                        Only admin can reply
                      </Label>
                      <Switch
                        id="adminOnlyReply"
                        checked={
                          editedService.permissions.adminOnlyReply || false
                        }
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            "adminOnlyReply",
                            checked as boolean
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="adminOnlyReport">
                        Only admin can report
                      </Label>
                      <Switch
                        id="adminOnlyReport"
                        checked={
                          editedService.permissions.adminOnlyReport || false
                        }
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            "adminOnlyReport",
                            checked as boolean
                          )
                        }
                      />
                    </div>
                  </div>
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

```

我們在修改service的地方
新增了一個tab 讓我們可以修改permissions

接著我們需要在新增thread的地方 驗證這個permissions
因為我們之前將新增thread改成使用service action了
因此修改你的`src/app/actions/threads.ts`

```ts
// 記得import auth進來
import { auth } from "@/auth";

// 在新增threads之前新增這段
  const service = await xata.db.services.getFirst();

  if (!service) {
    throw new Error("Service not found");
  }

  if (service.permissions.adminOnlyThread) {
    const session = await auth();
    if (session?.user?.id !== "admin") {
      throw new Error("You don't have permission");
    }
  }
```

## 測試permissions

接下來你可以來測試你的permission有沒有正常運作了

先到dashboard中 將`Only admin can create new threads`給打開

然後開啟你的無痕視窗並進入`http://localhost:3000/service/main`
試著發文看看 你會發現失敗
接著可以嘗試登入之後再發文 你會發現成功

這樣就算完成了

## 總結

今天我們幫我們的服務增加了一些permission的設定

你可以把這個服務的`Only admin can create new threads`開啟
然後就可以把它當成個人部落格來使用了

今天只示範了thread 你可以幫你的report跟reply也都加上permission的驗證

