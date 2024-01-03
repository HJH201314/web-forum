export type AudioPickerFunc = {
  selectAudio: () => void;
};

export type AudioPickerModelItem = {
  file: File;
  path: string;
};
export type AudioPickerModel = AudioPickerModelItem[];