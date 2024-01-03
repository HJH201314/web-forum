export type VideoPickerFunc = {
  selectVideo: () => void;
};

export type VideoPickerModelItem = {
  file: File;
  path: string;
};
export type VideoPickerModel = VideoPickerModelItem[];