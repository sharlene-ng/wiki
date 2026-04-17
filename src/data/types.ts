export type Status = "Active" | "Draft" | "Inactive" | "Lark" | "";

export interface WikiEntry {
  id: string;
  status: Status;
  item: string;
  url?: string;
  attachment?: string;
  tags: string[];
}

export interface WikiSection {
  id: string;
  name: string;
  entries: WikiEntry[];
}

export interface WikiPage {
  id: string;
  name: string;
  icon: string;
  description: string;
  sections: WikiSection[];
}
