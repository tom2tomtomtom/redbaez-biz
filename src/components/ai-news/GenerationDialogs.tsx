
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface GenerationDialogsProps {
  showArticleDialog: boolean;
  setShowArticleDialog: (show: boolean) => void;
  showNewsletterDialog: boolean;
  setShowNewsletterDialog: (show: boolean) => void;
  generatedArticle: string;
  generatedNewsletter: string;
  onCopyArticle: () => void;
  onCopyNewsletter: () => void;
}

const formatNewsletterContent = (content: string) => {
  // Replace markdown headers with styled elements
  let formatted = content
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Replace bold text
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>')
    // Replace horizontal rules
    .replace(/^---$/gm, '<hr class="my-4 border-gray-200">')
    // Replace newlines with proper spacing
    .replace(/\n\n/g, '</p><p class="my-3">');

  // Wrap the content in a paragraph if it's not already wrapped
  if (!formatted.startsWith('<h1') && !formatted.startsWith('<h2') && !formatted.startsWith('<h3')) {
    formatted = `<p class="my-3">${formatted}</p>`;
  }

  return formatted;
};

export const GenerationDialogs = ({
  showArticleDialog,
  setShowArticleDialog,
  showNewsletterDialog,
  setShowNewsletterDialog,
  generatedArticle,
  generatedNewsletter,
  onCopyArticle,
  onCopyNewsletter,
}: GenerationDialogsProps) => {
  return (
    <>
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generated LinkedIn Article</DialogTitle>
            <DialogDescription>
              Copy and paste this article to LinkedIn
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {generatedArticle}
            </div>
            <Button onClick={onCopyArticle} className="w-full">
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewsletterDialog} onOpenChange={setShowNewsletterDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generated Newsletter</DialogTitle>
            <DialogDescription>
              Copy and use this newsletter to share the latest AI news
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div 
              className="bg-gray-50 p-6 rounded-lg prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: formatNewsletterContent(generatedNewsletter) }}
            />
            <Button onClick={onCopyNewsletter} className="w-full">
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
