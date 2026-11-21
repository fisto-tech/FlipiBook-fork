import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_TITLE = 'FlipiBook | Turn PDFs into Interactive 3D Digital Catalogues';

const DEFAULT_KEYWORDS =
  'flipbook maker, 3D digital catalogue, interactive flipbook, PDF to flipbook, digital magazine creator, online brochure maker, page turn effect, 3D flipbook software, interactive PDF, digital publication';

const DEFAULT_DESCRIPTION =
  'Turn static PDFs into interactive 3D digital catalogues, digital magazines, brochures, and flipbooks with realistic page-turning animations, video embeds, and AR viewing.';

const ROUTE_SEO_MAP = {
  '/': {
    name: 'Home',
    keywords:
      'flipbook maker, 3D digital catalogue, interactive flipbook, PDF to flipbook, digital magazine creator, online brochure maker, page turn effect, 3D flipbook software, interactive PDF, digital publication, create flipbook online',
    description: DEFAULT_DESCRIPTION,
  },
  '/home': {
    name: 'Home',
    keywords:
      'flipbook maker, 3D digital catalogue, interactive flipbook, PDF to flipbook, digital magazine creator, online brochure maker, page turn effect, 3D flipbook software, interactive PDF, digital publication, create flipbook online',
    description: DEFAULT_DESCRIPTION,
  },
  '/converter': {
    name: 'PDF to Flipbook Converter',
    keywords:
      'pdf to flipbook converter, convert pdf online, create digital catalog from pdf, pdf page flip, digital booklet converter, interactive brochure creator, pdf to ebook converter, turn pdf into digital book',
    description:
      'Instantly convert PDF files, Office documents, and presentations into stunning 3D digital flipbooks with realistic page-turning sound and physics.',
  },
  '/templates': {
    name: 'Templates',
    keywords:
      'flipbook templates, digital catalogue templates, online magazine layout, lookbook templates, brochure templates, interactive flipbook designs, business presentation templates',
    description:
      'Browse professionally designed flipbook templates for digital catalogues, lookbooks, portfolios, magazines, menus, and corporate reports.',
  },
  '/explore': {
    name: 'Explore',
    keywords:
      'explore flipbooks, digital catalog showcase, interactive publications, flipbook examples, digital magazine gallery, creative publications showcase',
    description:
      'Explore inspiring digital catalogues, interactive magazines, and creative 3D publications built by creators on FlipiBook.',
  },
  '/pricing': {
    name: 'Pricing',
    keywords:
      'flipbook pricing, digital publishing plans, affordable flipbook maker, enterprise catalog software, flipbook subscription, flipibook pricing plans',
    description:
      'Simple, transparent pricing plans for creators, agencies, and enterprises to create unlimited interactive 3D flipbooks and digital catalogues.',
  },
  '/features': {
    name: 'Features',
    keywords:
      'flipbook features, 3D flipbook capabilities, augmented reality flipbook, interactive digital catalogue, flipbook analytics, multimedia flipbook, digital publishing suite',
    description:
      'Discover powerful FlipiBook features including realistic 3D page flip, AR viewing, drag-and-drop page editor, video and audio embeds, and detailed analytics.',
  },
  '/features/creation': {
    name: 'Creation Features',
    keywords:
      'flipbook creation, digital publishing tools, custom flipbook builder, fast pdf conversion, online booklet maker, flipbook design',
    description:
      'Create high-impact digital flipbooks from scratch or PDFs with smart creation and publishing tools.',
  },
  '/features/ar': {
    name: 'Augmented Reality (AR) Features',
    keywords:
      'augmented reality catalogue, AR flipbook, 3D model viewer, webAR catalogue, interactive 3D products, view in AR',
    description:
      'Bring your catalogue products to life directly in your space using WebAR and 3D interactive model viewers.',
  },
  '/features/3d-editor-studio': {
    name: '3D Studio Editor Features',
    keywords:
      '3d studio editor, 3d book styling, realistic paper textures, lighting and camera effects, 3d flipbook studio, photorealistic rendering',
    description:
      'Customize lighting, shadows, paper thickness, materials, and physics for a photorealistic 3D reading experience.',
  },
  '/features/explore': {
    name: 'Explore Features',
    keywords:
      'discover digital publications, public flipbooks, shared digital catalogs, interactive bookshelf showcase',
    description:
      'Showcase your publications and discover interactive books from creators worldwide.',
  },
  '/features/my-shelf': {
    name: 'Virtual Bookshelf Features',
    keywords:
      'virtual bookshelf, digital bookcase, organize flipbooks, flipbook collection, branded bookcase, digital library',
    description:
      'Organize and display multiple flipbooks in stylish, branded 3D digital bookcases for your customers and readers.',
  },
  '/features/page-editor': {
    name: 'Page Editor Features',
    keywords:
      'flipbook page editor, add links to flipbook, embed videos in pdf, interactive buttons, rich media editor, interactive pdfs',
    description:
      'Add clickable hotspots, videos, audio clips, lead capture forms, and animated stickers to any flipbook page.',
  },
  '/features/interactive-layout': {
    name: 'Interactive Layout Features',
    keywords:
      'responsive flipbook layouts, grid layouts, mobile flipbook reader, interactive catalog layout, reader controls',
    description:
      'Ensure seamless viewing across desktops, tablets, and smartphones with dynamic, responsive reader layouts.',
  },
  '/features/analytics': {
    name: 'Analytics Features',
    keywords:
      'flipbook analytics, reader engagement tracking, page view stats, click tracking, digital catalogue metrics, lead generation',
    description:
      'Gain actionable reader insights with detailed metrics on page views, read times, link clicks, and device types.',
  },
  '/features/converter': {
    name: 'Converter Features',
    keywords:
      'fast pdf converter, batch document conversion, cloud flipbook conversion, high resolution page flip',
    description:
      'High-speed cloud document conversion preserving vector clarity, sharp typography, and ultra-crisp page rendering.',
  },
  '/help': {
    name: 'Help & Support',
    keywords:
      'flipbook help center, flipbook tutorial, user guide, how to make flipbook, digital catalogue documentation, FAQ, customer support',
    description:
      'Access help documentation, frequently asked questions, and support resources for FlipiBook.',
  },
  '/guide': {
    name: 'User Guide',
    keywords:
      'flipbook guide, complete tutorial, creating digital catalogue, flipbook tips, digital publishing guide, walkthrough',
    description:
      'Comprehensive step-by-step user guide to help you build, customize, and publish interactive 3D digital flipbooks.',
  },
  '/forum': {
    name: 'Community Forum',
    keywords:
      'flipbook community, digital creators forum, discussion, help community, creator showcase, Q&A',
    description:
      'Join the FlipiBook creator community to exchange ideas, ask questions, and share interactive flipbook designs.',
  },
  '/my-flipbooks': {
    name: 'My Flipbooks',
    keywords:
      'flipbook dashboard, manage flipbooks, my publications, digital catalog library, my flipibooks',
    description:
      'Manage, edit, organize, and share all your interactive 3D flipbooks in one central workspace.',
  },
  '/overview': {
    name: 'Analytics Overview',
    keywords:
      'flipbook statistics, reader analytics, digital publication metrics, performance overview, book views',
    description:
      'View real-time audience analytics, reader engagement, and performance telemetry across your flipbooks.',
  },
  '/analytics': {
    name: 'Analytics Overview',
    keywords:
      'flipbook statistics, reader analytics, digital publication metrics, performance overview, book views',
    description:
      'View real-time audience analytics, reader engagement, and performance telemetry across your flipbooks.',
  },
  '/lead-form': {
    name: 'Lead Generation',
    keywords:
      'flipbook lead capture, catalog lead form, reader lead generation, digital book marketing, subscriber capture',
    description:
      'Collect and manage customer inquiries, leads, and orders directly from your interactive flipbook pages.',
  },
  '/coming-soon': {
    name: 'Coming Soon',
    keywords:
      'flipibook launch, coming soon, next gen 3D digital catalogues, flipbook countdown',
    description:
      'The next generation of 3D digital publishing and interactive catalogue creation is launching soon.',
  },
  '/terms-and-conditions': {
    name: 'Terms & Conditions',
    keywords:
      'terms and conditions, terms of service, user agreement, legal terms, flipibook terms',
    description:
      'Review the terms of service and conditions governing the use of the FlipiBook platform.',
  },
  '/privacy-policy': {
    name: 'Privacy Policy',
    keywords:
      'privacy policy, data protection, privacy statement, gdpr compliance, flipibook privacy',
    description:
      'Learn how FlipiBook collects, uses, protects, and handles your personal data and privacy.',
  },
  '/cookie-policy': {
    name: 'Cookie Policy',
    keywords:
      'cookie policy, tracking policy, cookie settings, web cookies, flipibook cookies',
    description:
      'Information on how FlipiBook utilizes cookies and similar tracking technologies to enhance user experience.',
  },
  '/refund-policy': {
    name: 'Refund Policy',
    keywords:
      'refund policy, billing policy, cancellation terms, refund terms, subscription cancellation',
    description:
      'Read our refund, billing, and cancellation policies for FlipiBook subscription plans.',
  },
  '/copyright-policy': {
    name: 'Copyright Policy',
    keywords:
      'copyright policy, dmca policy, intellectual property, content ownership, copyright protection',
    description:
      'Our commitment to intellectual property rights, copyright protections, and DMCA procedures.',
  },
};

function setMetaTag(name, content, attr = 'name') {
  if (!content) return;
  let element = document.querySelector(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function resolveRouteSEO(pathname) {
  // Direct match
  if (ROUTE_SEO_MAP[pathname]) {
    return ROUTE_SEO_MAP[pathname];
  }

  // Prefix matching
  if (pathname.startsWith('/my-flipbooks')) {
    return {
      name: 'My Flipbooks',
      keywords: ROUTE_SEO_MAP['/my-flipbooks'].keywords,
      description: ROUTE_SEO_MAP['/my-flipbooks'].description,
    };
  }

  if (pathname.startsWith('/analytics') || pathname.startsWith('/overview')) {
    return {
      name: 'Analytics Overview',
      keywords: ROUTE_SEO_MAP['/overview'].keywords,
      description: ROUTE_SEO_MAP['/overview'].description,
    };
  }

  if (pathname.startsWith('/lead-form')) {
    return {
      name: 'Lead Generation',
      keywords: ROUTE_SEO_MAP['/lead-form'].keywords,
      description: ROUTE_SEO_MAP['/lead-form'].description,
    };
  }

  if (pathname.includes('/customized_editor')) {
    return {
      name: 'Customized Editor',
      keywords:
        'custom flipbook editor, flipbook design studio, branding customization, interactive viewer styling, flipbook controls',
      description:
        'Customize flipbook branding, theme colors, navigation bars, backgrounds, and viewer controls in real-time.',
    };
  }

  if (pathname.includes('/threed_editor')) {
    return {
      name: '3D Studio Editor',
      keywords:
        '3D studio editor, 3D flipbook customization, textures and materials, 3D book viewer, photorealistic 3d',
      description:
        'Fine-tune lighting, cover materials, realistic spine details, and paper reflections in the 3D Studio Editor.',
    };
  }

  if (pathname.startsWith('/editor')) {
    return {
      name: 'Page Editor',
      keywords:
        'interactive page editor, flipbook authoring tool, rich media annotations, interactive elements, video embed',
      description:
        'Add multimedia elements, shopping links, YouTube videos, audio, and interactive hotspots to your flipbook pages.',
    };
  }

  if (pathname.startsWith('/shelf/')) {
    return {
      name: 'Virtual Bookshelf',
      keywords:
        'digital bookshelf, public flipbook showcase, collection view, online bookshelf, digital bookcase',
      description:
        'Explore this curated digital bookshelf of interactive 3D flipbooks and publications.',
    };
  }

  if (pathname.startsWith('/share')) {
    return {
      name: 'Interactive Flipbook',
      keywords:
        'interactive 3D flipbook, online digital catalogue, view flipbook, page turner publication, read flipbook online',
      description:
        'Read this interactive 3D digital catalogue with lifelike page-turning effects on FlipiBook.',
    };
  }

  if (pathname.startsWith('/preview')) {
    return {
      name: 'Preview Book',
      keywords: 'flipbook preview, interactive preview, 3D catalogue test',
      description: 'Preview your interactive 3D flipbook before publishing.',
    };
  }

  if (pathname.startsWith('/settings')) {
    return {
      name: 'Account Settings',
      keywords:
        'account settings, user profile, billing details, notification preferences, flipibook settings',
      description: 'Manage your profile, team members, billing, and account preferences.',
    };
  }

  // Legal routes aliases
  if (['/terms', '/terms-of-use', '/terms-of-service'].includes(pathname)) {
    return ROUTE_SEO_MAP['/terms-and-conditions'];
  }
  if (pathname === '/privacy') {
    return ROUTE_SEO_MAP['/privacy-policy'];
  }
  if (pathname === '/cookies') {
    return ROUTE_SEO_MAP['/cookie-policy'];
  }
  if (pathname === '/refund') {
    return ROUTE_SEO_MAP['/refund-policy'];
  }
  if (pathname === '/copyright') {
    return ROUTE_SEO_MAP['/copyright-policy'];
  }

  // Generic fallback: format path name nicely
  const segment = pathname.split('/').filter(Boolean)[0] || 'Home';
  const formatted = segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    name: formatted,
    keywords: DEFAULT_KEYWORDS,
    description: DEFAULT_DESCRIPTION,
  };
}

export default function SEOManager() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const seo = resolveRouteSEO(pathname);
    const fullTitle = `${BASE_TITLE} - ${seo.name}`;

    // Update document title
    document.title = fullTitle;

    // Update Meta Keywords & Description
    setMetaTag('keywords', seo.keywords);
    setMetaTag('description', seo.description);

    // Update Open Graph tags
    setMetaTag('og:title', fullTitle, 'property');
    setMetaTag('og:description', seo.description, 'property');
    setMetaTag('og:url', window.location.href, 'property');

    // Update Twitter card tags
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', seo.description);

    // Track SPA page view in Google Analytics if gtag is loaded
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname + (search || ''),
        page_title: fullTitle,
      });
    }
  }, [pathname, search]);

  return null;
}
