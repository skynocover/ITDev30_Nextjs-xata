import { getDictionary } from "./getDictionary";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "@/components/commons/LanguageSwitcher";

export default async function Home({ params }: { params: { lang: string } }) {
  if (params.lang !== "en" && params.lang !== "zh") {
    notFound();
  }
  const dictionary = await getDictionary(params.lang);
  return (
    <div className="container mx-auto mt-10">
      <div className="flex justify-end mb-4">
        <LanguageSwitcher lang={params.lang} />
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {dictionary.hello}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg">{dictionary.welcome}</p>
        </CardContent>
      </Card>
    </div>
  );
}
