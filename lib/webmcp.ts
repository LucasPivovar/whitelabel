type Context = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function registerCheckoutNavigation(open: (id: string) => boolean) {
  const context = (document as Document & { modelContext?: Context })
    .modelContext;
  if (!context) return;
  const controller = new AbortController();
  Promise.resolve(
    context.registerTool(
      {
        name: 'open_checkout_editor',
        description:
          'Abre um checkout existente e autorizado no editor visual. Não salva nem publica alterações.',
        inputSchema: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute(input) {
          if (
            !input ||
            typeof input !== 'object' ||
            !('id' in input) ||
            typeof input.id !== 'string' ||
            !open(input.id)
          )
            throw Error('Checkout indisponível.');
          return { opened: true };
        },
      },
      { signal: controller.signal },
    ),
  ).catch(() => {});
  return () => controller.abort();
}
