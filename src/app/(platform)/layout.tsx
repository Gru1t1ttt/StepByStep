import CabinetReady from "@/components/platform/CabinetReady";
import Sidebar from "@/components/platform/Sidebar";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cabinet flex min-h-screen flex-col lg:flex-row">
      <CabinetReady />
      <Sidebar />
      <main className="w-full min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-8 sm:pt-8 lg:pb-8">{children}</main>
    </div>
  );
}
