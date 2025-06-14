/**
 * Utility hook to count nodes in a mindmap markdown string
 */

/**
 * Counts the number of nodes in a markmap markdown string
 * 
 * @param markmap - The markmap markdown string
 * @returns The number of nodes in the markmap
 */
export const countMindmapNodes = (markmap: string | null | undefined): number => {
  if (!markmap) return 0;
  
  // Clean markdown formatting if needed
  let markdown = markmap;
  
  // Remove markdown code block formatting if present
  if (markdown.startsWith('```markmap')) {
    markdown = markdown.replace(/^```markmap\n/, '').replace(/```$/, '');
  } else if (markdown.startsWith('```')) {
    markdown = markdown.replace(/^```(?:markdown)?\n/, '').replace(/```$/, '');
  }
  
  // If there's an error in the markmap, return 0
  if (markdown.startsWith('Error:')) return 0;
  
  // Count nodes by counting lines
  // Each line with # or - represents a node in the markmap
  const lines = markdown.split('\n').filter(line => 
    line.trim().startsWith('#') || 
    line.trim().startsWith('-')
  );
  
  return lines.length;
};

export default countMindmapNodes; 