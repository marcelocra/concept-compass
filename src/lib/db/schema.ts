import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const mindMaps = pgTable("mind_maps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  graphData: jsonb("graph_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MindMap = typeof mindMaps.$inferSelect;
export type NewMindMap = typeof mindMaps.$inferInsert;

// Graph data structure stored in JSONB
export interface GraphData {
  nodes: Array<{
    id: string;
    type?: string;
    data: {
      label: string;
    };
    position: {
      x: number;
      y: number;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
  }>;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  centralConcept: string;
}