"use client";
import Window from "@/components/Window/Window";

export type ComponentProcessProps = { id: string };

type RenderComponentProps = {
  Component: React.ComponentType<ComponentProcessProps>;
  hasWindow?: boolean;
  id: string;
};

const RenderComponent = ({
  Component,
  hasWindow = true,
  id,
}: RenderComponentProps) => {
  return hasWindow ? (
    <Window id={id}>
      <Component id={id} />
    </Window>
  ) : (
    <Component id={id} />
  );
};

export default RenderComponent;
