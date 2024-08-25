export interface PostInput {
  threadId?: string; //Reply才會有
  title?: string;
  name?: string;
  content?: string;
  youtubeLink?: string;
  image?: File | null;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const validatePostInput = (input: PostInput) => {
  const contentFilled = !!input.content || input.content?.trim() !== "";
  const youtubeLinkFilled = !!input.youtubeLink;
  const imageFilled = !!input.image;

  if (!contentFilled && !youtubeLinkFilled && !imageFilled) {
    throw new Error(
      "At least one of Content, YouTube Link, or Image must be provided"
    );
  }

  if (youtubeLinkFilled && imageFilled) {
    throw new Error(
      "You can only provide either a YouTube Link or an Image, not both"
    );
  }

  if (input.image) {
    if (input.image.size > MAX_IMAGE_SIZE) {
      throw new Error("Image size exceeds the limit");
    }
    if (!input.image.type.startsWith("image/")) {
      throw new Error("Only accept image");
    }
  }

  if (youtubeLinkFilled) {
    const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    const extractedId = extractYouTubeVideoId(input.youtubeLink!);
    if (!extractedId || !youtubeIdRegex.test(extractedId)) {
      throw new Error("Invalid YouTube Link");
    }
  }

  return;
};

export const extractYouTubeVideoId = (url: string): string | null => {
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
