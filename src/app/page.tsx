import Desktop from "./ui/Desktop/Desktop";
import Taskbar from "./ui/Taskbar";

export default function Page() {
  return (
    <main>
      <Desktop>
        <Taskbar />
      </Desktop>
    </main>
  );
}
