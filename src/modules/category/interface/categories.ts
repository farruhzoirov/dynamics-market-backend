export interface IMainCategory{
  _id?: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  slugUz?: string;
  slugRu?: string;
  slugEn?: string;
}

export interface IMidCategory extends IMainCategory{
  parentId?: string;
  mainCategory?: string;
}

export interface ISubCategory extends IMainCategory {
  parentId?: string;
  midCategory?: string;
}