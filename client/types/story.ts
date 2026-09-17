export type StoryChapter = {
  chapterNumber?: number;
  title?: string;
  textPrompt?: string;
  imagePrompt?: string;
  imageUrl?: string;
};

export type StoryOutput = {
  title?: string;
  coverImagePrompt?: string;
  chapters?: StoryChapter[];
};

export type StoryItem = {
  id: number | string;
  storyId: string;
  slug?: string | null;
  storySubject?: string | null;
  storyType?: string | null;
  ageGroup?: string | null;
  imageStyle?: string | null;
  coverImage?: string | null;
  output?: StoryOutput | null;
  userName?: string | null;
  userImage?: string | null;
  userEmail: string;
};

export type StorySelection = {
  fieldValue: string;
  fieldName: "storySubject" | "storyType" | "ageCategory" | "imageStyle";
};

export type StorySelectionProps = {
  userSelection: (selection: StorySelection) => void;
};

