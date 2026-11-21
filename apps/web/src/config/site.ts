/**
 * Site-wide settings. The site owner fills in the empty values; until then, the links and tags that need them
 * (feedback, repository, canonical, og:url) are not shown. Never put a guessed value here.
 */
export type SiteConfig = {
  name: string;
  tagline: string;
  feedbackEmail: string;
  repoUrl: string;
  siteUrl: string;
};

export const site: Readonly<SiteConfig> = {
  name: "Slow Bend",
  tagline: "گیتار بلوز، قدم‌به‌قدم",
  /** Address for feedback (mailto link on /about and in the footer). Empty = hidden. */
  feedbackEmail: "",
  /** Source repository URL. Empty = hidden. */
  repoUrl: "",
  /** Final public address, e.g. https://example.com (no trailing slash). Empty = no canonical / og:url. */
  siteUrl: "",
};
