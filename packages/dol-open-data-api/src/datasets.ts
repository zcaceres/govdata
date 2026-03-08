export const AGENCIES = {
  EBSA: ["ocats"] as const,
  ETA: ["otaa_petition", "apprenticeship_data", "ui_national_weekly_claims", "ui_state_weekly_claims"] as const,
  ILAB: ["Child_Labor_Report__2016_to_2022", "ImportWatch_Goods_HS", "ImportWatch_Core_Data", "ImportWatch_Country_Codes", "LaborShield_ReportingData", "LaborShield_Goods", "LaborShield_SuggestedActions"] as const,
  MSHA: ["accident", "address_of_records_mines", "assessed_violations", "contractor_name_id_lookup", "contractor_employment_production_annual", "controller_history", "commodity_lookup", "operator_employment_production_annual", "inspection", "mines", "contractor_history_at_mines", "operator_history_at_mines", "contractor_employment_production_quarterly", "operator_employment_production_quarterly", "violation"] as const,
  OSHA: ["accident_lookup2", "accident", "accident_abstract", "accident_injury", "inspection", "optional_code_info", "related_activity", "emphasis_codes", "violation", "violation_event", "violation_gen_duty_std"] as const,
  TRNG: ["training_dataset_industries"] as const,
  VETS: ["4212"] as const,
  WB: ["ndcp"] as const,
  WHD: ["enforcement"] as const,
} as const;

export type Agency = keyof typeof AGENCIES;

export type EndpointFor<A extends Agency> = (typeof AGENCIES)[A][number];
