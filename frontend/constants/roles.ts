export const CHATBOT_ROLES = [
  { value: "assistant", label: "Assistant virtuel" },
  { value: "support_client", label: "Support client" },
  { value: "commercial", label: "Assistant commercial" },
  { value: "ecommerce", label: "Conseiller e-commerce" },
  { value: "rh", label: "Assistant RH" },
  { value: "administratif", label: "Assistant administratif" },
  { value: "technique", label: "Assistant technique" },
  { value: "education", label: "Assistant pédagogique" },
  { value: "marketing", label: "Assistant marketing" },
  { value: "analytique", label: "Assistant analytique" },
  { value: "faq", label: "FAQ" },
  { value: "expert", label: "Expert métier" },
  { value: "reservation", label: "Assistant réservation" },
  { value: "community_manager", label: "Community Manager" },
] as const;

export const DEFAULT_ROLE = "assistant";

export function getRoleLabel(value: string | undefined | null): string {
  if (!value) return CHATBOT_ROLES[0].label;
  return CHATBOT_ROLES.find((r) => r.value === value)?.label ?? value;
}