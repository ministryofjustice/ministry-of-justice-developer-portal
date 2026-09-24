export type ParagraphBlock = {
    type: "paragraph";
    text: InlinePart[];
};

export type ListBlock = {
    type: "list";
    items: ListItem[];
};

export type SubsectionBlock = {
    type: "subsection";
    heading: string;
    content: Block[];
};

export type Block = ParagraphBlock | ListBlock | SubsectionBlock;

export type PolicySection = {
    id: string;
    title: string;
    blocks: Block[];
};

export type PolicyData = {
    title: string;
    sections: PolicySection[];
};

export type InlinePart =
  | string
  | {
      type: "link";
      href: string;
      label: string;
    };

export type ListItem =
  | string
  | {
      text?: string;
      link?: {
        href: string;
        label: string;
      };
      suffix?: string;
    };