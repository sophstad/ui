import { MockedProvider } from "@apollo/client/testing";
import { getUserMock } from "gql/mocks/getUser";
import { act, renderHook } from "test_utils";
import { usePageVisibility } from ".";

// @ts-expect-error: FIXME. This comment was added by an automated script.
const Provider = ({ children }) => (
  <MockedProvider mocks={[getUserMock]}>{children}</MockedProvider>
);

describe("usePageVisibility", () => {
  const updatePageVisibility = (status: string) => {
    act(() => {
      Object.defineProperty(document, "visibilityState", {
        value: status,
      });
      document.dispatchEvent(new window.Event("visibilitychange"));
    });
  };

  it("usePageVisibility should return true when user is viewing document", () => {
    const { result } = renderHook(() => usePageVisibility(), {
      wrapper: Provider,
    });
    expect(result.current).toBe(true);
  });

  it("usePageVisibility should return false when user is not viewing document", () => {
    const { result } = renderHook(() => usePageVisibility(), {
      wrapper: Provider,
    });
    updatePageVisibility("hidden");
    expect(result.current).toBe(false);
  });
});
