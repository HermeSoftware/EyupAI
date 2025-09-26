// KaTeX rendering utility
export function renderLatex(latex: string): string {
  try {
    // Check if KaTeX is available
    if (typeof window !== 'undefined' && (window as any).katex) {
      const katex = (window as any).katex;
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: latex.includes('\\begin') || latex.includes('\\frac') || latex.includes('\\sqrt'),
        strict: false
      });
    }
    
    // Fallback: basic LaTeX to HTML conversion
    return latex
      .replace(/\\sqrt{([^}]+)}/g, '√($1)')
      .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
      .replace(/\^{([^}]+)}/g, '<sup>$1</sup>')
      .replace(/\^([0-9])/g, '<sup>$1</sup>')
      .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
      .replace(/_([0-9])/g, '<sub>$1</sub>')
      .replace(/\\pi/g, 'π')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\infty/g, '∞')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\pm/g, '±')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷');
      
  } catch (error) {
    console.warn('LaTeX rendering error:', error);
    return latex;
  }
}

// Load KaTeX dynamically if not already loaded
export function loadKatex(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    if ((window as any).katex) {
      resolve();
      return;
    }

    // KaTeX CSS is already loaded via CDN in index.html
    // Load KaTeX JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js';
    script.integrity = 'sha384-PwRUT/YqbnEjkZO0zZxNqcxACrXe+j766U2amXcgMg5457rve2Y7I6ZJSm2A0mS4';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load KaTeX'));
    
    document.head.appendChild(script);
  });
}
