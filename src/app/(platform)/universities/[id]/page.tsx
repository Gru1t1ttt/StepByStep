import { notFound } from "next/navigation";
import UniversityDetailView from "@/components/universities/UniversityDetail";
import { universityDetail } from "@/lib/world-server";

export async function generateMetadata(props: PageProps<"/universities/[id]">) {
  const { id } = await props.params;
  const u = await universityDetail(id).catch(() => null);
  return { title: u?.name ?? "Университет" };
}

export default async function UniversityPage(props: PageProps<"/universities/[id]">) {
  const { id } = await props.params;
  const u = await universityDetail(id);
  if (!u) notFound();
  return <UniversityDetailView u={u} />;
}
