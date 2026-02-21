import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Read Story",
    description:
      "Read and share an AI-generated storybook created with TaleCrafter AI.",
    alternates: {
      canonical: `/view-story/${id}`,
    },
    openGraph: {
      title: "Read Story | TaleCrafter AI",
      description:
        "Read an AI-generated storybook and share it with others on TaleCrafter AI.",
      url: `/view-story/${id}`,
      type: "article",
    },
  };
}

export default function ViewStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
