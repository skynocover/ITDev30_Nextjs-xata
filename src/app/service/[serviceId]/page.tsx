import React from "react";

export default async function Page({
  params,
}: {
  params: { serviceId: string };
}) {
  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      {params.serviceId}
    </div>
  );
}
