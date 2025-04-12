export async function buildBrandPipeline(lang: string) {
  return [
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $project: {
        name: { $ifNull: [`$name${lang}`, '$nameUz'] },
        slugUz: 1,
        slugRu: 1,
        slugEn: 1,
        logo: 1,
        website: 1,
        status: 1,
      },
    },
  ];
}
