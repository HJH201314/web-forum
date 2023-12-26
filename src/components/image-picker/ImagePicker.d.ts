export type ImagePickerFunc = {
  selectImage: () => void;
};

export type ImagePickerModelItem = {
  file: File;
  path: string;
};
export type ImagePickerModel = ImagePickerModelItem[];