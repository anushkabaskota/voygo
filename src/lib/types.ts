import { z } from "zod";

export const FormSchema = z.object({
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  dates: z.object({
    from: z.date({
      required_error: "A start date is required.",
    }),
    to: z.date({
      required_error: "An end date is required.",
    }),
  }),
  budget: z.coerce.number().min(0, {
    message: "Budget must be a positive number.",
  }),
  interests: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one interest.",
  }),
  travelStyle: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one travel style.",
  }),
});
