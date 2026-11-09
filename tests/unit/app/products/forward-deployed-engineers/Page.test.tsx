import { render, screen, within } from '@testing-library/react';
import ForwardDeployedEngineersPlan from "@/app/products/forward-deployed-engineers-plan/page";

vi.mock('@/../content/products/forward-deployed-engineers-plan.json', () => ({
  default: {
    title: 'Forward Deployed Engineers',
    sections: [
      {
        id: 'section-1',
        title: 'Section 1',
        blocks: [
          {
            type: 'paragraph',
            text: [
              'This is a paragraph block. It has ',
              {
                type: 'bold',
                text: 'bold text',
              },
              ' in it.',
            ],
          },
          {
            type: 'subsection',
            heading: 'Subsection 1',
            content: [
              {
                type: 'list',
                items: ['Subsection 1 Item 1', 'Subsection 1 Item 2'],
              },
            ],
          },
        ],
      },
      {
        id: 'section-2',
        title: 'Section 2',
        blocks: [
          {
            type: 'paragraph',
            text: [
              'This is another paragraph block in section 2.',
            ],
          },
          {
            type: "list",
            items: ["Section 2 Item 1", "Section 2 Item 2"]
          }
        ]
      }
    ],
  },
}));

describe("Forward Deployed Engineers Page", () => {
    it('renders the page intro', () => {
        render(<ForwardDeployedEngineersPlan />);
        expect(screen.getByText('Forward deployed engineers plan')).toBeInTheDocument();
    });

    it('renders the sections', () => {
        render(<ForwardDeployedEngineersPlan />);
        expect(screen.getByText('Section 1')).toBeInTheDocument();
        expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('renders the subsection content', () => {
        render(<ForwardDeployedEngineersPlan />);
        expect(screen.getByText('Subsection 1')).toBeInTheDocument();
    });

    it('renders the content within the subsections', () => {
        render(<ForwardDeployedEngineersPlan />);
        expect(screen.getByText('Subsection 1 Item 1')).toBeInTheDocument();
        expect(screen.getByText('Subsection 1 Item 2')).toBeInTheDocument();
    });

    it('renders the bold text correctly', () => {
        render(<ForwardDeployedEngineersPlan />);
        const boldText = screen.getByRole('strong');
        expect(boldText.textContent).toBe('bold text');
    });
});
