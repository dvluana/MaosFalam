export interface ReadingContext {
  target_name: string;
  target_gender: "female" | "male";
  dominant_hand: "left" | "right";
  is_self: boolean;
  session_id: string;
}
