export type ParagraphBlock = {
  type: 'paragraph';
  text: InlinePart[];
};

export type ListBlock = {
  type: 'list';
  items: ListItem[];
};

export type SubsectionBlock = {
  type: 'subsection';
  heading: string;
  content: (ParagraphBlock | ListBlock)[];
};

export type Block = ParagraphBlock | ListBlock | SubsectionBlock;

export type InlinePart =
  | string
  | {
      type: 'link';
      href: string;
      label: string;
    }
  | {
      type: 'bold';
      text: string;
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

export type ContentSection = {
  id: string;
  title: string;
  blocks: Block[];
};

export type Content = {
  title: string;
  sections: ContentSection[];
};
