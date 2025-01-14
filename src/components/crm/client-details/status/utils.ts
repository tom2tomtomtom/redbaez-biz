export const formatNotes = (notes: string) => {
  if (!notes) return '';
  
  // Split text into paragraphs on double newlines
  const paragraphs = notes.split(/\n\n+/);
  
  // Split remaining single newlines into lines
  return paragraphs.map(paragraph => 
    paragraph.split(/\n/).map(line => line.trim()).filter(Boolean).join(' ')
  ).join('\n\n');
};