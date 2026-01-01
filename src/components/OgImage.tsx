export function OgImage({
  packageDescription,
  packageName
}: {
  packageDescription: string;
  packageName: string;
}) {
  return (
    <main
      className="flex flex-col items-center justify-center gap-10"
      data-og-image
    >
      <div className="text-8xl text-black font-bold">{packageName}</div>
      <div className="text-7xl text-white">{packageDescription}</div>
    </main>
  );
}
