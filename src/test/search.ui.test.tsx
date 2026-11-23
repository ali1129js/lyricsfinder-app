import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import { fakeFetch, jsonResponse, track } from "./fakeFetch";

describe("search", () => {
  it("shows results after typing", async () => {
    const f = fakeFetch(() => jsonResponse([track({ trackName: "Hello World" })]));
    render(<App fetchImpl={f} />);
    await userEvent.type(screen.getByLabelText("Song or artist"), "hello");
    expect(await screen.findByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText(/1 result for/)).toBeInTheDocument();
  });

  it("aborts the old request when the query changes", async () => {
    const pending = new Map<string, (r: Response) => void>();
    const f = fakeFetch(
      (url) =>
        new Promise<Response>((resolve) =>
          pending.set(new URL(url).searchParams.get("q") ?? "", resolve),
        ),
    );
    render(<App fetchImpl={f} />);
    const input = screen.getByLabelText("Song or artist");
    await userEvent.type(input, "old{Enter}");
    await userEvent.clear(input);
    await userEvent.type(input, "new{Enter}");
    pending.get("new")?.(jsonResponse([track({ id: 2, trackName: "New Song" })]));
    expect(await screen.findByText("New Song")).toBeInTheDocument();
    pending.get("old")?.(jsonResponse([track({ id: 1, trackName: "Old Song" })]));
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText("Old Song")).not.toBeInTheDocument();
  });

  it("says when nothing matched", async () => {
    render(<App fetchImpl={fakeFetch(() => jsonResponse([]))} />);
    await userEvent.type(screen.getByLabelText("Song or artist"), "zzzz{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent(/No songs matched/);
  });

  it("says when the network is down", async () => {
    render(<App fetchImpl={fakeFetch(() => Promise.reject(new TypeError("offline")))} />);
    await userEvent.type(screen.getByLabelText("Song or artist"), "demo{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent(/Could not reach lrclib.net/);
  });

  it("asks for text when submitted empty", async () => {
    render(<App fetchImpl={fakeFetch(() => jsonResponse([]))} />);
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Type a song title/);
  });
});
