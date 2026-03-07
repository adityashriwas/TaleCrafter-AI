import Hero from "./(components)/Hero";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  title: "Interactive AI Story Generator with Pictures and Voice",
  description:
    "Create interactive AI stories with pictures, narration, and branching choices. Best for kids stories, bedtime stories, classrooms, and creators.",
  keywords: [
    "interactive AI story generator",
    "AI story generator with pictures",
    "AI story generator with voice",
    "kids bedtime story generator",
    "image to story generator",
    "AI storybook maker",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Interactive AI Story Generator with Pictures and Voice",
    description:
      "Generate AI stories with images, narration, and branching paths.",
    url: "/",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "Interactive AI Story Generator with Pictures",
    description: "Generate AI stories with images, narration, and branching paths.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "TaleCrafter AI",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
      },
      {
        "@type": "WebSite",
        name: "TaleCrafter AI",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/explore?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "TaleCrafter AI",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        url: siteUrl,
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
    </div>
  );
}
