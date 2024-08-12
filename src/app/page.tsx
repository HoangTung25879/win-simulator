import Desktop from "./components/Desktop/Desktop";
import Taskbar from "./components/Taskbar";

export default function Page() {
  return (
    <main>
      <Desktop>
        <Taskbar />
      </Desktop>
    </main>
  );
}
