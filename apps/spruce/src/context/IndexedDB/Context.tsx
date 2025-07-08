import { useMemo } from "react";
import { IDBPDatabase, openDB, DBSchema } from "idb";

export interface DBProps<T extends DBSchema> {
  Context: React.Context<DBContext<T> | null>;
  dbName: string;
  store: Parameters<IDBPDatabase<T>["createObjectStore"]>;
  version: number;
}

export interface DBContext<T extends DBSchema> {
  db: Promise<IDBPDatabase<T>>;
}

export const DBProvider = <T extends DBSchema>({
  Context,
  children,
  dbName,
  store,
  version,
}: React.PropsWithChildren<DBProps<T>>) => {
  const db = useMemo(
    () =>
      openDB<T>(dbName, version, {
        upgrade(d) {
          d.createObjectStore(...store);
        },
      }),
    [dbName, version, store],
  );

  const providerValue = useMemo(() => ({ db }), [db]);

  return <Context.Provider value={providerValue}>{children}</Context.Provider>;
};
