import Image from "next/image";

export default function UserAvatar({
  name,
  avatarUrl,
  collapsed,
}: {
  name: string;
  avatarUrl: string;
  collapsed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`${collapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-full overflow-hidden border-2 border-blue-400 bg-gray-100 transition-all duration-200`}>
        <Image src={avatarUrl} alt={name} width={collapsed ? 40 : 48} height={collapsed ? 40 : 48} />
      </div>
      {/* Name is shown in Sidebar, not here, unless needed for tooltip */}
      {/* TODO: Add user interaction logic if needed */}
    </div>
  );
}
