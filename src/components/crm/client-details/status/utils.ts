export const formatNotes = (notes: string) => {
  if (!notes) return '';
  
  // Split text into paragraphs on double newlines
  const paragraphs = notes.split(/\n\n+/);
  
  // Format each paragraph:
  // 1. Split into lines
  // 2. Trim each line
  // 3. Remove empty lines
  // 4. Join lines with proper spacing
  return paragraphs
    .map(paragraph => 
      paragraph
        .split(/\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .join(' ')
    )
    .join('\n\n');
};