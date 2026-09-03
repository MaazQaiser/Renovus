import type { Metadata } from "next";
import { HomeScreen } from "@/components/home/HomeScreen";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <PageContainer width="default" className="pb-16">
      <HomeScreen />
    </PageContainer>
  );
}
