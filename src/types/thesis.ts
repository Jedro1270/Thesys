export interface ThesisProject {
  id: string;
  title: string;
  description: string;
  chapters: ThesisChapter[];
  createdAt: string;
  updatedAt: string;
}

export interface ThesisChapter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
