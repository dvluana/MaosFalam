import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Button from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Me mostre</Button>);
    expect(screen.getByRole("button", { name: /me mostre/i })).toBeTruthy();
  });

  it("handles click", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Toque</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
