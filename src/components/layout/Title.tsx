import Link from "next/link";
import { ExternalLink, Link2 } from "lucide-react";

export interface ILinkItem {
  name: string;
  url: string;
}

export interface IService {
  id: string;
  name: string;
  topLinks: ILinkItem[];
  headLinks: ILinkItem[];
  description: string;
}

interface TitleProps {
  service: IService;
}

export default function Title({ service }: TitleProps) {
  return (
    <>
      <div className="absolute top-2 right-2 flex items-center space-x-2 text-xs">
        {service.topLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            className="text-gray-400 hover:text-gray-600 flex items-center"
          >
            {link.name} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        ))}
        <Link
          href={`/service/${service.id}`}
          className="text-gray-400 hover:text-gray-600 flex items-center"
        >
          Homepage <Link2 className="ml-1 h-3 w-3" />
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-center mb-2 mt-6 text-black">
        {service.name}
      </h1>
      <p className="text-sm text-gray-500 text-center whitespace-pre-wrap mb-2">
        {service.description}
      </p>
      <div className="flex justify-center mb-2 space-x-2">
        {service.headLinks.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            passHref
            target="_blank"
            className="text-blue-500 text-md py-1 px-2 rounded shadow-md border-2 border-blue-400 hover:bg-blue-500 hover:border-blue-500 hover:text-white transition duration-300"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </>
  );
}
