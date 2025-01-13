import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {generatedNewsletter}
            </div>
            <Button onClick={onCopyNewsletter} className="w-full">
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};