import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/token/$address")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/tokens/$address",
      params: { address: params.address },
      replace: true,
    });
  },
});
