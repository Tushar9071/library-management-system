import Image from "next/image";
import ThemeToggleButton from "./togal";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <h1 className="text-primary">hello</h1>
        <ThemeToggleButton/>
      </div>
    </>
  );
}
