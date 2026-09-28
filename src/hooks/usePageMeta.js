import { useEffect } from 'react';

/** Sets the document title per route. */
export function usePageMeta(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
