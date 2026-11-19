import { createContext } from 'react';

/**
 * Converts an EDITOR page index (pages as authored, no transparent sheets) to a BOOK page index
 * (the flipbook's page list, where each transparent sheet adds two pages).
 *
 * The preview's counter, page input, thumbnails and progress bar all use book numbering. Things
 * authored in the editor — table of contents entries, "go to page" links, search over the
 * original pages — use editor numbering and must convert before navigating.
 *
 * Default (no provider): identity, i.e. a book without transparent sheets.
 */
export const PageNumberingContext = createContext((editorIndex) => editorIndex);
