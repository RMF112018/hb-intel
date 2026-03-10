// Storybook type stubs — remove when @storybook/react is added as devDependency
export type Meta<C> = {
  title: string;
  component: C;
  parameters?: Record<string, unknown>;
};
export type StoryObj<C> = {
  name?: string;
  args?: Partial<C extends React.ComponentType<infer P> ? P : never>;
};
