import { XataClient, ServicesRecord } from "../../xata";

interface IGetThreads {
  serviceId: string;
}

export const getService = async ({
  serviceId,
}: IGetThreads): Promise<ServicesRecord | null> => {
  try {
    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });

    return await xata.db.services.getFirst();
  } catch (error) {
    console.error(error);
    return null;
  }
};
