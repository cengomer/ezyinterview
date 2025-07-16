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
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400 bg-gray-100">
        <Image src={avatarUrl} alt={name} width={48} height={48} />
      </div>
      {/* Name is shown in Sidebar, not here, unless needed for tooltip */}
      {/* TODO: Add user interaction logic if needed */}
    </div>
  );
}
