window.addEventListener('DOMContentLoaded', () => {
  fadeInLogoOnScroll();
  activateTourRegions();
  activateTourJsTsSwitch();
});

const fadeInLogoOnScroll = () => {
  if (!window.IntersectionObserver) {
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.length === 0) {
      return;
    }
    const entry = entries[0];
    document.body.classList.toggle('splashLogoScrolled', !entry.isIntersecting);
  });

  // The header logo should fade-in as soon as the splash logo is no longer
  // visible. However, the sticky header occludes the splash logo before it
  // moves out of the viewport.
  //
  // We can't just set rootMargin top to the header height, because that's
  // defined in rems, and only absolute units are allowed in rootMargin. We also
  // can't change the intersection root, because we don't have another scrolling
  // area to use.
  //
  // Instead, we use an invisible .splashLogo-header-offset element, placed
  // var(--header-height) pixels above the bottom of the logo, and check for its
  // intersection with the viewport.
  const splashLogo = document.body.querySelector('#splashLogoHeaderOffset')!;
  observer.observe(splashLogo);
};

const activateTourRegions = () => {
  const regions = [
    {
      noteSelector: '#tourNoteCustomElements',
      ts: {
        start: {line: 3, char: 0},
        end: {line: 3, char: 32},
      },
      js: {
        start: {line: 25, char: 0},
        end: {line: 25, char: 55},
      },
    },
    {
      noteSelector: '#tourNoteStyles',
      ts: {
        start: {line: 5, char: 1.5},
        end: {line: 9, char: 20},
      },
      js: {
        start: {line: 3, char: 1.5},
        end: {line: 7, char: 20},
      },
    },
    {
      noteSelector: '#tourNoteProperties',
      ts: {
        start: {line: 11, char: 2},
        end: {line: 12, char: 19},
      },
      js: {
        start: {line: 9, char: 2},
        end: {line: 13, char: 25},
      },
    },
    {
      noteSelector: '#tourNoteExpressions',
      ts: {
        start: {line: 15, char: 26.5},
        end: {line: 15, char: 36},
      },
      js: {
        start: {line: 21, char: 26.5},
        end: {line: 21, char: 36},
      },
    },
  ];

  const lineHeightEm = 1.8;
  const tsCode = document.querySelector('#tourTsCode > figure')!;
  const jsCode = document.querySelector('#tourJsCode > figure')!;
  const allNotes: HTMLElement[] = [];
  const allHighlights: HTMLElement[] = [];

  const disableAll = () => {
    for (const note of allNotes) {
      note.classList.remove('active');
    }
    for (const highlight of allHighlights) {
      highlight.classList.remove('active');
      highlight.style.width = `0`;
    }
  };

  const activateRegion = (
    code: Element,
    note: Element,
    position: {
      start: {line: number; char: number};
      end: {line: number; char: number};
    }
  ) => {
    const line = code.childNodes[position.start.line];
    if (line === undefined) {
      return;
    }

    const highlight = document.createElement('div');
    allHighlights.push(highlight);
    // Highlights are absolute positioned relative to starting CodeMirror line.
    // Use insertBefore so that natural stacking order puts highlight behind the
    // code text.
    line.insertBefore(highlight, line.firstChild);
    highlight.classList.add('tourHighlight');
    highlight.style.left = `${position.start.char - 1}ch`;
    const tsWidth = position.end.char - position.start.char + 3;
    highlight.style.width = `0`;
    highlight.style.height = `${
      (position.end.line - position.start.line + 1) * lineHeightEm
    }em`;

    // Activation events
    const enable = () => {
      note.classList.add('active');
      highlight.classList.add('active');
      highlight.style.width = `${tsWidth}ch`;
    };
    const disable = () => {
      note.classList.remove('active');
      highlight.classList.remove('active');
      highlight.style.width = `0`;
    };
    note.addEventListener('mouseover', enable);
    note.addEventListener('mouseleave', disable);
    note.addEventListener('focus', enable);
    note.addEventListener('blur', disable);
  };

  for (const region of regions) {
    const note = document.querySelector(region.noteSelector);
    if (note === null) {
      continue;
    }
    allNotes.push(note as HTMLElement);
    note.addEventListener('mouseover', disableAll);
    note.addEventListener('blur', disableAll);
    activateRegion(tsCode, note, region.ts);
    activateRegion(jsCode, note, region.js);
  }
};

const activateTourJsTsSwitch = async () => {
  const sw = document.querySelector('#tourJsTsSwitch > mwc-switch')!;
  sw.addEventListener('change', () => {
    document.querySelector('#tourTsCode')!.toggleAttribute('hidden');
    document.querySelector('#tourJsCode')!.toggleAttribute('hidden');
  });

  // No way to set an mwc-formfield field cursor?
  await customElements.whenDefined('mwc-formfield');
  requestAnimationFrame(() => {
    document
      .querySelector('#tourJsTsSwitch')!
      .shadowRoot!.querySelector('label')!.style.cursor = 'pointer';
  });
};
