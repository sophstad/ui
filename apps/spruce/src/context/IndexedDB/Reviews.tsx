import { createContext, useContext } from "react";
import { DBSchema } from "idb";
import { DBProvider, DBContext } from "./Context";

enum Reviewed {
  // Used for display tasks that have only some children reviewed.
  Indeterminate = -1,
  False = 0,
  True = 1,
}

interface ReviewsDB extends DBSchema {
  reviews: {
    key: string;
    indexes: { "by-done": number };
    value: {
      versionID: string;
      taskID: string;
      parentTaskID: string;
      reviewed: Reviewed;
    };
  };
}

type ReviewsContextType = DBContext<ReviewsDB> | null;

const ReviewsContext = createContext<ReviewsContextType>(null);

export const ReviewsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <DBProvider
    Context={ReviewsContext}
    dbName="spruce-db"
    store={["reviews", { keyPath: "taskID" }]}
    version={1}
  >
    {children}
  </DBProvider>
);

export const useReviewsContext = (): ReviewsContextType => {
  const context = useContext(ReviewsContext);

  if (context === undefined) {
    throw new Error("useReviewsContext must be used within a ReviewsProvider");
  }

  return context;
};
