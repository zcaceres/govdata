import { z } from "zod";
import {
  SpendingByStateItemSchema,
  RecipientListItemSchema,
  RecipientCountSchema,
  RecipientDetailSchema,
  RecipientChildSchema,
  StateDetailSchema,
  StateAwardItemSchema,
} from "./schemas";

export type SpendingByStateItem = z.infer<typeof SpendingByStateItemSchema>;
export type RecipientListItem = z.infer<typeof RecipientListItemSchema>;
export type RecipientCount = z.infer<typeof RecipientCountSchema>;
export type RecipientDetail = z.infer<typeof RecipientDetailSchema>;
export type RecipientChild = z.infer<typeof RecipientChildSchema>;
export type StateDetail = z.infer<typeof StateDetailSchema>;
export type StateAwardItem = z.infer<typeof StateAwardItemSchema>;

export interface RecipientKindMap {
  spending_by_state: SpendingByStateItem[];
  recipient_list: RecipientListItem[];
  recipient_count: RecipientCount;
  recipient_detail: RecipientDetail;
  recipient_children: RecipientChild[];
  state_detail: StateDetail;
  state_awards: StateAwardItem[];
}
