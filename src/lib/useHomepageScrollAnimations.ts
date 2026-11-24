import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function wrapHeadingWords(heading: HTMLElement) {
  if (heading.querySelector('.scroll-word')) return;

  const accessibleName = heading.textContent?.trim();
  if (accessibleName && !heading.hasAttribute('aria-label')) {
    heading.setAttribute('aria-label', accessibleName);
  }

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (node.textContent?.trim()) textNodes.push(node as Text);
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const tokens = textNode.textContent?.match(/\s+|[^\s]+/g) ?? [];

    tokens.forEach((token) => {
      if (/^\s+$/.test(token)) {
        fragment.append(document.createTextNode(token));
        return;
      }

      const mask = document.createElement('span');
      mask.className = 'scroll-word-mask';
      mask.setAttribute('aria-hidden', 'true');

      const word = document.createElement('span');
      word.className = 'scroll-word';
      word.textContent = token;
      mask.append(word);
      fragment.append(mask);
    });

    textNode.parentNode?.replaceChild(fragment, textNode);
  });
}

export function useHomepageScrollAnimations(
  rootRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const media = gsap.matchMedia(root);
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const headings = Array.from(
        root.querySelectorAll<HTMLElement>('h1, h2, h3'),
      );
      headings.forEach(wrapHeadingWords);

      headings.forEach((heading) => {
        const words = heading.querySelectorAll('.scroll-word');
        if (!words.length) return;

        gsap.fromTo(
          words,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.045,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: heading,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      root
        .querySelectorAll<HTMLElement>('[data-scroll-reveal]')
        .forEach((element) => {
          gsap.fromTo(
            element,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        });

      root
        .querySelectorAll<HTMLElement>('[data-scroll-stagger]')
        .forEach((group) => {
          const items = group.children;
          if (!items.length) return;

          gsap.fromTo(
            items,
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.13,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: group,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        });
    });

    return () => media.revert();
  }, [rootRef]);
}
