import { useEffect } from 'react';

function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — StudyAI` : 'StudyAI';
  }, [title]);
}

export default usePageTitle;