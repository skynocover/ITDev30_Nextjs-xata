import "server-only";

const dictionaries = {
  en: () => import("./locales/en.json").then((module) => module.default),
  zh: () => import("./locales/zh.json").then((module) => module.default),
};

export const getDictionary = async (locale: "en" | "zh") =>
  dictionaries[locale]();
